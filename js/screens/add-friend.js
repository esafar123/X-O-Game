import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { Icon, IconBtn } from "../ui/icons.js";
import { TopBar, Avatar, PitchButton } from "../ui/components.js";
import { db } from "../core/db.js";
import { validateInviteCode, rateLimit } from "../utils/sanitize.js";

SCREENS.add_friend = () => {
  const myCode = state.profile?.friend_code || "";
  const myName = state.profile?.nickname    || "";

  const wrap = h("div", { class: "screen-scroll" });
  wrap.appendChild(TopBar({
    title:   "Add Friend",
    leading: IconBtn({ name: "back", onClick: () => go("friends") }),
  }));

  // ── Your code ────────────────────────────────────────────────────
  const copyBtn = h("button", { class: "af-copy-btn", type: "button" });
  copyBtn.appendChild(Icon({ name: "plus", size: 14 }));
  copyBtn.appendChild(document.createTextNode(" Copy"));
  copyBtn.onclick = () => {
    navigator.clipboard?.writeText(myCode).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.innerHTML = "";
        copyBtn.appendChild(Icon({ name: "plus", size: 14 }));
        copyBtn.appendChild(document.createTextNode(" Copy"));
      }, 1800);
    });
  };

  wrap.appendChild(h("div", { class: "af-section" },
    h("div", { class: "section-label" }, "Your code"),
    h("div", { class: "af-my-code" },
      h("div", { class: "af-code-text" }, myCode || "No profile yet"),
      copyBtn,
    ),
  ));

  // ── Status + results ─────────────────────────────────────────────
  const statusMsg  = h("div", { class: "join-status af-status" });
  const resultArea = h("div", { class: "af-result" });
  let foundProfile = null;

  const setStatus = (msg, color = "var(--eliminate)") => {
    statusMsg.textContent = msg;
    statusMsg.style.color = color;
  };

  // ── Search by code ───────────────────────────────────────────────
  const input = h("input", {
    class: "onb-input af-input", type: "text",
    placeholder: "Enter 6-digit code…",
    maxlength: "6", inputmode: "numeric",
    autocomplete: "off", spellcheck: "false",
    oninput: () => { statusMsg.textContent = ""; resultArea.innerHTML = ""; },
  });

  const doSearch = rateLimit(async (prefillCode) => {
    const raw  = prefillCode || input.value.trim();
    const code = validateInviteCode(raw);

    if (!code) { setStatus("Enter a valid 6-digit code."); return; }
    if (code === myCode) { setStatus("That's your own code!"); return; }

    setStatus("Searching…", "var(--flood-500)");
    resultArea.innerHTML = "";
    foundProfile         = null;

    const { data: profile, error } = await db
      .from("profiles").select("nickname, friend_code")
      .eq("friend_code", code).maybeSingle();

    if (error || !profile) { setStatus("No player found with that code."); return; }

    const { data: existing } = await db
      .from("friend_requests").select("status")
      .or(`and(from_code.eq.${myCode},to_code.eq.${code}),and(from_code.eq.${code},to_code.eq.${myCode})`)
      .maybeSingle();

    if (existing) {
      setStatus(
        existing.status === "accepted" ? "You're already friends!" : "Request already sent or pending.",
        "var(--fg-2)",
      );
      return;
    }

    foundProfile          = profile;
    statusMsg.textContent = "";

    const card = h("div", { class: "af-found-card" });
    card.appendChild(Avatar({ initial: profile.nickname[0]?.toUpperCase() || "?", size: 48 }));
    card.appendChild(h("div", { class: "af-found-info" },
      h("div", { class: "nm"   }, profile.nickname),
      h("div", { class: "meta" }, profile.friend_code),
    ));
    resultArea.appendChild(card);
    resultArea.appendChild(h("div", { style: { marginTop: "12px" } },
      PitchButton({ label: "Send Friend Request", variant: "primary", full: true, icon: "plus", onClick: doSend }),
    ));
  }, 1200);

  const doSend = rateLimit(async () => {
    if (!foundProfile || !myCode) return;
    setStatus("Sending…", "var(--flood-500)");

    const { error } = await db.from("friend_requests").insert({
      from_code: myCode, to_code: foundProfile.friend_code,
      from_name: myName, to_name: foundProfile.nickname, status: "pending",
    });

    if (error) {
      setStatus(error.code === "23505" ? "Request already sent." : "Couldn't send — try again.");
      return;
    }

    const sentTo         = foundProfile.nickname;
    resultArea.innerHTML = "";
    input.value          = "";
    foundProfile         = null;
    setStatus(`✓ Request sent to ${sentTo}!`, "var(--win)");
  }, 2000);

  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

  wrap.appendChild(h("div", { class: "af-section", style: { marginTop: "24px" } },
    h("div", { class: "section-label" }, "Find a player"),
    h("div", { class: "af-search-row" },
      input,
      PitchButton({ label: "Search", variant: "primary", onClick: () => doSearch() }),
    ),
    statusMsg,
    resultArea,
  ));

  // ── Scan QR ──────────────────────────────────────────────────────
  if (navigator.mediaDevices?.getUserMedia) {
    wrap.appendChild(h("div", { class: "af-section af-scan-section" },
      h("div", { class: "section-label" }, "Or scan a QR code"),
      h("button", { class: "af-scan-big-btn", type: "button", onclick: startScanner },
        h("div", { class: "af-scan-big-icon" },
          Icon({ name: "scan", size: 28, color: "var(--flood-500)" }),
        ),
        h("div", { class: "af-scan-big-label" }, "Open Camera"),
        h("div", { class: "af-scan-big-sub"   }, "Scan a friend's profile QR"),
      ),
    ));
  }

  function startScanner() {
    const root   = document.querySelector("#root");
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d", { willReadFrequently: true });
    let stream   = null;
    let animId   = null;
    let done     = false;

    const close = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(animId);
      stream?.getTracks().forEach(t => t.stop());
      overlay.remove();
    };

    const onDetect = (raw) => {
      if (done) return;
      // Parse code from ?challenge= or ?join= URL, or raw 6-digit string
      let code = null;
      try {
        const url = new URL(raw);
        code = url.searchParams.get("challenge") || url.searchParams.get("join") || null;
      } catch {}
      if (!code && /^\d{6}$/.test(raw.trim())) code = raw.trim();

      close();
      if (code) {
        input.value = code;
        statusMsg.textContent = "";
        resultArea.innerHTML  = "";
        doSearch(code);
      } else {
        setStatus("QR not recognised — try typing the code manually.");
      }
    };

    const scanFrame = () => {
      if (done) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        try {
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const res = window.jsQR?.(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
          if (res?.data) { onDetect(res.data); return; }
        } catch {}
      }
      animId = requestAnimationFrame(scanFrame);
    };

    const video   = h("video", { autoplay: true, playsinline: true, muted: true, class: "qr-video" });
    const scanLine = h("div",  { class: "qr-scan-line" });
    const overlay = h("div",  { class: "qr-overlay" },
      video,
      h("div", { class: "qr-dimmer qr-dimmer-top" }),
      h("div", { class: "qr-dimmer-mid" },
        h("div", { class: "qr-dimmer qr-dimmer-side" }),
        h("div", { class: "qr-frame" },
          h("span", { class: "qr-corner qr-tl" }),
          h("span", { class: "qr-corner qr-tr" }),
          h("span", { class: "qr-corner qr-bl" }),
          h("span", { class: "qr-corner qr-br" }),
          scanLine,
        ),
        h("div", { class: "qr-dimmer qr-dimmer-side" }),
      ),
      h("div", { class: "qr-dimmer qr-dimmer-bot" },
        h("div", { class: "qr-hint" }, "Point at a friend's Profile QR code"),
        h("button", { class: "qr-cancel", type: "button", onclick: close },
          Icon({ name: "close", size: 20, color: "#fff" }),
          h("span", { style: { marginLeft: "6px", fontSize: "13px" } }, "Cancel"),
        ),
      ),
    );

    root.appendChild(overlay);

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 } }, audio: false })
      .then(s => {
        stream = s;
        video.srcObject = s;
        video.play().then(() => { animId = requestAnimationFrame(scanFrame); }).catch(close);
      })
      .catch(() => {
        close();
        setStatus("Camera access denied — allow camera permission and try again.");
      });
  }

  return wrap;
};
