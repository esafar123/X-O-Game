// Lightweight DOM helpers — h(), svg(), svgEl()

export const h = (tag, attrs = {}, ...kids) => {
  const el = tag.includes(":")
    ? document.createElementNS("http://www.w3.org/2000/svg", tag.split(":")[1])
    : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k in el && typeof el[k] !== "function" && tag !== "svg" && !tag.startsWith("svg:")) {
      try { el[k] = v; } catch { el.setAttribute(k, v); }
    } else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
  }
  return el;
};

export const svg = (attrs, ...kids) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  for (const kid of kids.flat(Infinity)) if (kid) el.appendChild(kid);
  return el;
};

export const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
