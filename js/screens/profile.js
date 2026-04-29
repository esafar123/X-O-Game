import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { IconBtn, Icon } from "../ui/icons.js";
import { TopBar, Avatar } from "../ui/components.js";
import { db } from "../core/db.js";
import { validateNickname } from "../utils/sanitize.js";

SCREENS.profile = () => {
  const profile = state.profile;
  const code    = profile?.friend_code || "—";

  const wrap = h("div", { class: "screen-scroll" });

  // Live-update refs
  const heroNameEl = h("div", { class: "prof-name" }, profile?.nickname || "Player");
  const avatarWrap = h("div");
  avatarWrap.appendChild(Avatar({
    initial: (profile?.nickname?.[0] || "?").toUpperCase(), size: 80,
  }));

  wrap.appendChild(TopBar({
    title:   "Profile",
     leading:  IconBtn({ name: "home", onClick: () => go("home") }),
    trailing: IconBtn({ name: "settings",  onClick: () => go("settings")  }),
  }));

  // ── Avatar + name hero ───────────────────────────────────────────
  wrap.appendChild(h("div", { class: "prof-hero" },
    avatarWrap,
    heroNameEl,
    h("div", { class: "prof-handle" }, `#${code}`),
  ));

  // ── Stats row ────────────────────────────────────────────────────
  wrap.appendChild(h("div", { class: "prof-stats" },
    statCell("—", "Wins"),
    h("div", { class: "prof-stat-div" }),
    statCell("—", "Matches"),
    h("div", { class: "prof-stat-div" }),
    statCell("—", "Friends"),
  ));

  // ── Account group ────────────────────────────────────────────────
  wrap.appendChild(h("div", { class: "section-label" }, "Account"));

  const statusMsg = h("div", { class: "prof-edit-status" });

  // Nickname row — inline editable
  const nickValueEl = h("span", { class: "prof-detail-val" }, profile?.nickname || "—");
  const editBtn     = h("button", { class: "prof-edit-btn", type: "button" },
    Icon({ name: "more", size: 14, color: "var(--fg-3)" }),
  );

  let editing = false;

  editBtn.onclick = () => {
    if (editing) return;
    editing = true;

    const current = state.profile?.nickname || "";
    const input   = h("input", {
      class: "prof-nick-input", type: "text",
      value: current, maxlength: "16", autocomplete: "off", spellcheck: "false",
    });
    const saveBtn   = h("button", { class: "prof-save-btn",   type: "button" }, "Save");
    const cancelBtn = h("button", { class: "prof-cancel-btn", type: "button" }, "Cancel");

    nickValueEl.replaceWith(input);
    editBtn.replaceWith(h("div", { class: "prof-edit-actions" }, saveBtn, cancelBtn));
    input.focus();
    input.select();
    statusMsg.textContent = "";

    const cancel = () => {
      input.replaceWith(nickValueEl);
      document.querySelector(".prof-edit-actions")?.replaceWith(editBtn);
      statusMsg.textContent = "";
      editing = false;
    };

    const save = async () => {
      const validated = validateNickname(input.value);
      if (!validated) {
        statusMsg.textContent = "2–16 chars, letters/numbers/_ . - only";
        statusMsg.style.color = "var(--eliminate)";
        return;
      }
      if (validated === state.profile?.nickname) { cancel(); return; }

      saveBtn.disabled = cancelBtn.disabled = true;
      statusMsg.textContent = "Saving…";
      statusMsg.style.color = "var(--fg-3)";

      const { error } = await db.from("profiles")
        .update({ nickname: validated })
        .eq("friend_code", code);

      if (error) {
        statusMsg.textContent = "Couldn't save — try again.";
        statusMsg.style.color = "var(--eliminate)";
        saveBtn.disabled = cancelBtn.disabled = false;
        return;
      }

      // Persist locally
      state.profile = { ...state.profile, nickname: validated };
      localStorage.setItem("xo_profile", JSON.stringify(state.profile));

      // Update DOM
      nickValueEl.textContent = validated;
      heroNameEl.textContent  = validated;
      avatarWrap.innerHTML    = "";
      avatarWrap.appendChild(Avatar({ initial: validated[0].toUpperCase(), size: 80 }));

      input.replaceWith(nickValueEl);
      document.querySelector(".prof-edit-actions")?.replaceWith(editBtn);
      statusMsg.textContent = "Nickname updated!";
      statusMsg.style.color = "var(--win)";
      editing = false;
    };

    saveBtn.onclick   = save;
    cancelBtn.onclick = cancel;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter")  save();
      if (e.key === "Escape") cancel();
    });
  };

  const nickRow = h("div", { class: "setting-row prof-nick-row" },
    h("span", { class: "label" }, "Nickname"),
    h("div",  { class: "prof-nick-right" }, nickValueEl, editBtn),
  );

  wrap.appendChild(h("div", { class: "setting-group" },
    nickRow,
    detailRow("Friend Code", code),
    detailRow("League",      "Pro Pitch"),
  ));

  wrap.appendChild(statusMsg);

  return wrap;
};

function statCell(value, label) {
  return h("div", { class: "prof-stat" },
    h("div", { class: "prof-stat-val" }, value),
    h("div", { class: "prof-stat-lbl" }, label),
  );
}

function detailRow(label, value) {
  return h("div", { class: "setting-row" },
    h("span", { class: "label" }, label),
    h("span", { class: "prof-detail-val" }, value),
  );
}
