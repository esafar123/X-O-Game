// Pure utility helpers

export function generateFriendCode(nickname) {
  const slug   = nickname.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "PLAY";
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `XO-${slug}-${digits}`;
}

// Decode HTML entities returned by opentdb (e.g. &amp; &#039;)
export function decodeHTML(str) {
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value;
}

// Fisher-Yates shuffle
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
