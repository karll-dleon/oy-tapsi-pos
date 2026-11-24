// ==========================================================================
// 4. AUTHENTICATION, ACCOUNT ISOLATION & LOGOUT CONFIRMATION DIALOG
// ==========================================================================

import { accounts } from "./data.js";
import { state, dom } from "./state.js";
import {
  isValidAlphanumericEmail,
  isValidAlphanumericPassword,
  setFeedback,
  buildInitials
} from "./utils.js";
import { renderCart } from "./order.js";

export function showAuthCard(cardId) {
  [dom.loginView, dom.signupView, dom.forgotView].forEach((card) => {
    card.classList.toggle("active", card.id === cardId);
  });
  setFeedback(dom.loginFeedback, "");
  setFeedback(dom.signupFeedback, "");
  setFeedback(dom.forgotFeedback, "");
}

export function handleTogglePasswordVisibility() {
  const isPassword = dom.loginPassword.type === "password";
  dom.loginPassword.type = isPassword ? "text" : "password";
  dom.toggleLoginPassword.setAttribute("aria-pressed", String(isPassword));
  dom.toggleLoginPassword.setAttribute(
    "aria-label",
    isPassword ? "Hide password" : "Show password"
  );
  dom.eyeOpenIcon.classList.toggle("hidden", isPassword);
  dom.eyeClosedIcon.classList.toggle("hidden", !isPassword);
}

function findAccountByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  for (let i = 0; i < accounts.length; i += 1) {
    if (accounts[i].email.toLowerCase() === normalized) {
      return accounts[i];
    }
  }
  return null;
}

export function syncProfileForCurrentUser() {
  if (!state.currentUser) return;
  dom.sidebarAdminLabel.textContent = state.currentUser.badge;
  dom.profileAvatar.textContent = state.currentUser.avatar;
  dom.profileBadge.textContent = state.currentUser.badge;
  dom.profileName.textContent = state.currentUser.name;
  dom.profileEmail.textContent = state.currentUser.email;
  dom.profileShift.textContent = state.currentUser.shift;
}

export function handleLoginSubmit(event, onLoginSuccess) {
  event.preventDefault();
  const email = dom.loginEmail.value.trim();
  const password = dom.loginPassword.value;

  if (!isValidAlphanumericEmail(email)) {
    setFeedback(
      dom.loginFeedback,
      "Email must be valid and contain both letters and numbers (e.g., karlitodrew05@gmail.com)."
    );
    return;
  }

  if (!isValidAlphanumericPassword(password)) {
    setFeedback(
      dom.loginFeedback,
      "Password must be at least 6 characters and combine letters and numbers."
    );
    return;
  }

  const matchedAccount = findAccountByEmail(email);
  if (!matchedAccount || matchedAccount.password !== password) {
    state.currentUser = null;
    setFeedback(
      dom.loginFeedback,
      "Invalid email or password. Use a registered account or create one via Signup."
    );
    return;
  }

  // Reset password field to masked state
  dom.loginPassword.type = "password";
  dom.eyeOpenIcon.classList.remove("hidden");
  dom.eyeClosedIcon.classList.add("hidden");

  // Bind session exclusively to authenticated user
  state.currentUser = matchedAccount;
  state.cart = [];
  renderCart();
  syncProfileForCurrentUser();

  setFeedback(dom.loginFeedback, "");
  dom.authWrapper.classList.remove("active");
  dom.appShell.classList.remove("hidden");
  onLoginSuccess("order-entry");
}

export function handleSignupSubmit(event) {
  event.preventDefault();
  const name = dom.signupName.value.trim();
  const email = dom.signupEmail.value.trim();
  const password = dom.signupPassword.value;
  const confirm = dom.signupConfirm.value;

  if (!name) {
    setFeedback(dom.signupFeedback, "Please enter your full name.");
    return;
  }
  if (!isValidAlphanumericEmail(email)) {
    setFeedback(
      dom.signupFeedback,
      "Email must include both letters and numbers (e.g., staff01@oytapsi.com)."
    );
    return;
  }
  if (!isValidAlphanumericPassword(password)) {
    setFeedback(
      dom.signupFeedback,
      "Password must be at least 6 characters and combine letters and numbers."
    );
    return;
  }
  if (password !== confirm) {
    setFeedback(dom.signupFeedback, "Passwords do not match.");
    return;
  }
  if (findAccountByEmail(email)) {
    setFeedback(dom.signupFeedback, "An account with that email already exists.");
    return;
  }

  const nextNum = accounts.length + 123;
  accounts.push({
    name,
    email,
    password,
    badge: `STAFF USER ${nextNum}`,
    shift: `SHIFT #${accounts.length + 1}`,
    avatar: buildInitials(name)
  });

  dom.signupForm.reset();
  showAuthCard("login-view");
  dom.loginEmail.value = email;
  dom.loginPassword.value = "";
  setFeedback(
    dom.loginFeedback,
    `Account created for ${email}. Enter your password to sign in.`,
    true
  );
}

export function handleForgotSubmit(event) {
  event.preventDefault();
  const email = dom.forgotEmail.value.trim();
  const newPassword = dom.forgotNewPassword.value;

  if (!isValidAlphanumericEmail(email)) {
    setFeedback(
      dom.forgotFeedback,
      "Enter a valid registered email containing both letters and numbers."
    );
    return;
  }
  if (!isValidAlphanumericPassword(newPassword)) {
    setFeedback(
      dom.forgotFeedback,
      "New password must be at least 6 characters and combine letters and numbers."
    );
    return;
  }

  const targetAccount = findAccountByEmail(email);
  if (!targetAccount) {
    setFeedback(dom.forgotFeedback, "No account found with that email address.");
    return;
  }

  targetAccount.password = newPassword;
  dom.forgotForm.reset();
  showAuthCard("login-view");
  dom.loginEmail.value = email;
  dom.loginPassword.value = "";
  setFeedback(
    dom.loginFeedback,
    `Password updated for ${email}. Please log in with your new password.`,
    true
  );
}

// Confirmation Dialog Controls for Switch / Logout
export function openLogoutConfirmation() {
  dom.logoutModal.classList.remove("hidden");
  dom.cancelLogoutBtn.focus();
}

export function closeLogoutConfirmation() {
  dom.logoutModal.classList.add("hidden");
}

export function confirmAndExecuteLogout() {
  closeLogoutConfirmation();
  state.currentUser = null;
  state.cart = [];
  renderCart();

  dom.appShell.classList.add("hidden");
  dom.authWrapper.classList.add("active");
  dom.loginForm.reset();
  showAuthCard("login-view");
}