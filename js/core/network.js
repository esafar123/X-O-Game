// Network / connection state management
// Watches online/offline events and shows a banner inside the phone shell.

let offlineBanner = null;

function getPhone() {
  return document.querySelector(".phone");
}

function showOfflineBanner() {
  if (offlineBanner) return;
  offlineBanner = document.createElement("div");
  offlineBanner.className = "offline-banner";
  offlineBanner.textContent = "No connection — some features may be unavailable";
  getPhone()?.prepend(offlineBanner);
}

function hideOfflineBanner() {
  offlineBanner?.remove();
  offlineBanner = null;
}

window.addEventListener("online",  () => hideOfflineBanner());
window.addEventListener("offline", () => showOfflineBanner());

// Surface current status immediately on load
if (!navigator.onLine) showOfflineBanner();

/** True if the browser believes it has a network connection. */
export const isOnline = () => navigator.onLine;
