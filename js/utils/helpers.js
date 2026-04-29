// Pure utility helpers

export function generateFriendCode() {
  // 6-digit numeric code — easy to share verbally or in chat (e.g. 482916)
  return String(Math.floor(100000 + Math.random() * 900000));
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
