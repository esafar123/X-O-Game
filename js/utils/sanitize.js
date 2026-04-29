// Input sanitization and rate-limiting helpers

/**
 * Strip HTML-special characters to prevent XSS when inserting into the DOM.
 * Also collapses runs of whitespace and trims.
 */
export function sanitizeText(str = "") {
  return String(str)
    .replace(/[<>&"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate and normalise a friend code.
 * Expected format: 6 digits (e.g. 482916)
 * Returns the normalised code string, or null if invalid.
 */
export function validateInviteCode(raw = "") {
  const code = String(raw).trim().replace(/\s/g, "");
  return /^\d{6}$/.test(code) ? code : null;
}

/**
 * Simple one-at-a-time rate limiter.
 * Returns a wrapped async function that ignores concurrent calls while busy.
 *
 * Usage:
 *   const limited = rateLimit(async () => { ... });
 *   btn.addEventListener("click", limited);
 */
export function rateLimit(fn, cooldownMs = 2000) {
  let busy = false;
  return async function (...args) {
    if (busy) return;
    busy = true;
    try {
      await fn.apply(this, args);
    } finally {
      // Keep busy for cooldownMs after the call completes
      setTimeout(() => { busy = false; }, cooldownMs);
    }
  };
}

/**
 * Validate nickname: 2-16 chars, alphanumeric + _ . –
 * Returns trimmed value, or null if invalid.
 */
export function validateNickname(raw = "") {
  const nick = sanitizeText(raw);
  if (nick.length < 2 || nick.length > 16) return null;
  if (!/^[\w.\-]+$/.test(nick)) return null;
  return nick;
}
