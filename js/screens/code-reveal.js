import { SCREENS, state, go } from "../core/router.js";
import { h } from "../utils/dom.js";
import { PitchButton, TopBar } from "../ui/components.js";

SCREENS.code_reveal = () => {
  const wrap = h("div", { class: "screen-scroll pitch-bg-app" });
  wrap.appendChild(TopBar({ title: "Your Pitch Code" }));

  const code    = state.profile?.friend_code || "";
  const gameUrl = `https://x-o-game-five-jade.vercel.app/?join=${encodeURIComponent(code)}`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(gameUrl)}&bgcolor=050a08&color=d4ff00`;

  const card = h("div", { class: "code-card" });
  card.appendChild(h("img", { class: "code-qr", src: qrUrl, alt: "QR for " + code, width: 220, height: 220 }));
  card.appendChild(h("div", { class: "code-value" }, code));

  const copyBtn = h("button", { class: "pbtn ghost code-copy-btn", type: "button",
    onclick: () => {
      navigator.clipboard?.writeText(code).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.textContent = "Copy Code"; }, 2000);
      });
    },
  }, "Copy Code");
  card.appendChild(copyBtn);
  wrap.appendChild(card);

  wrap.appendChild(h("p", { class: "code-tip" },
    "Ask a friend to scan this QR — it drops them straight into a match with you.",
  ));

  wrap.appendChild(h("div", { class: "onb-actions" },
    PitchButton({ label: "Wait for Friend to Scan", variant: "primary", full: true, icon: "clock", onClick: () => go("lobby") }),
  ));
  wrap.appendChild(h("div", { style: { padding: "0 20px 24px" } },
    PitchButton({ label: "Start Playing Solo", variant: "ghost", full: true, onClick: () => go("home") }),
  ));

  return wrap;
};
