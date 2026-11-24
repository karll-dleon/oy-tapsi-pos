// ==========================================================================
// 3. VALIDATION, CURRENCY & DATE/TIME HELPERS
// ==========================================================================

import { dom } from "./state.js";

export function hasLettersAndNumbers(value) {
  const str = String(value || "").trim();
  const hasLetter = /[A-Za-z]/.test(str);
  const hasDigit = /\d/.test(str);
  return hasLetter && hasDigit;
}

export function isValidAlphanumericEmail(email) {
  const trimmed = String(email || "").trim();
  const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basicEmailPattern.test(trimmed) && hasLettersAndNumbers(trimmed);
}

export function isValidAlphanumericPassword(password) {
  const trimmed = String(password || "");
  return trimmed.length >= 6 && hasLettersAndNumbers(trimmed);
}

export function setFeedback(el, message, isSuccess = false) {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("success-msg", Boolean(isSuccess));
}

export function formatPeso(amount) {
  const safeNum = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return `P${safeNum.toFixed(2)}`;
}

export function getFormattedDateTime(dateObj = new Date()) {
  const datePart = dateObj
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    })
    .toUpperCase();

  const timePart = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  return `${datePart} | ${timePart}`;
}

export function updateClock() {
  if (dom.liveClock) {
    dom.liveClock.textContent = getFormattedDateTime();
  }
}

export function buildInitials(fullName) {
  const parts = String(fullName || "User")
    .trim()
    .split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}