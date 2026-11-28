import { accounts } from "./data.js";
import { state, dom } from "./state.js";
import {
  isValidAlphanumericEmail,
  isValidAlphanumericPassword,
  setFeedback,
  buildInitials
} from "./utils.js";
import { renderCart } from "./order.js";

const API_AUTH_URL = "http://localhost:3000/api/auth";

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

function makeUsername(email) {
  const clean = String(email || "").trim().toLowerCase();
  const base = clean.includes("@") ? clean.split("@")[0] : clean;
  return base.replace(/[^a-z0-9._-]/g, "_") || `user_${Date.now()}`;
}

function buildSessionUser(apiUser, fallbackName, fallbackEmail) {
  const fullName = apiUser?.fullName || fallbackName || "Staff User";
  const email = apiUser?.email || fallbackEmail || "";
  const id = apiUser?.id ?? accounts.length + 1;
  const roleUpper = String(apiUser?.role || "staff").toUpperCase();

  return {
    id,
    name: fullName,
    fullName,
    username: apiUser?.username || makeUsername(email),
    email,
    role: apiUser?.role || "staff",
    badge: `${roleUpper} #${id}`,
    shift: `SHIFT #${id}`,
    avatar: buildInitials(fullName)
  };
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

export async function handleLoginSubmit(event, onLoginSuccess) {
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

  try {
    const res = await fetch(`${API_AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username: makeUsername(email),
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      state.currentUser = null;
      setFeedback(
        dom.loginFeedback,
        data.message || "Invalid email or password. Use a registered account or create one via Signup."
      );
      return;
    }

    dom.loginPassword.type = "password";
    dom.eyeOpenIcon.classList.remove("hidden");
    dom.eyeClosedIcon.classList.add("hidden");

    state.currentUser = buildSessionUser(data.data, "", email);
    state.cart = [];
    renderCart();
    syncProfileForCurrentUser();
    setFeedback(dom.loginFeedback, "");
    dom.authWrapper.classList.remove("active");
    dom.appShell.classList.remove("hidden");
    if (typeof onLoginSuccess === "function") {
      onLoginSuccess("order-entry");
    }
  } catch (err) {
    state.currentUser = null;
    setFeedback(
      dom.loginFeedback,
      `Cannot connect to ${API_AUTH_URL}/login. Make sure "node server.js" is running on port 3000.`
    );
  }
}

export async function handleSignupSubmit(event) {
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

  try {
    const res = await fetch(`${API_AUTH_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        username: makeUsername(email),
        email,
        password,
        role: "staff"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setFeedback(
        dom.signupFeedback,
        data.message || "Signup failed. That email or username may already be registered."
      );
      return;
    }

    const created = buildSessionUser(data.data, name, email);
    if (!findAccountByEmail(email)) {
      accounts.push(created);
    }

    dom.signupForm.reset();
    showAuthCard("login-view");
    dom.loginEmail.value = email;
    dom.loginPassword.value = "";
    setFeedback(
      dom.loginFeedback,
      `Account created for ${email}. Enter your password to sign in.`,
      true
    );
  } catch (err) {
    setFeedback(
      dom.signupFeedback,
      `Cannot connect to ${API_AUTH_URL}/signup. Make sure "node server.js" is running on port 3000.`
    );
  }
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