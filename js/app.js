import { state, dom } from "./state.js";
import { updateClock } from "./utils.js";
import {
  showAuthCard,
  handleTogglePasswordVisibility,
  syncProfileForCurrentUser,
  handleLoginSubmit,
  handleSignupSubmit,
  handleForgotSubmit,
  openLogoutConfirmation,
  closeLogoutConfirmation,
  confirmAndExecuteLogout
} from "./auth.js";
import {
  renderCategories,
  renderMenuCards,
  renderCart,
  setPaymentMethod,
  handleCompleteOrder
} from "./order.js";
import { setLogbookFilter, renderRecordsLogbook } from "./records.js";

export function switchTab(tabName) {
  if (!dom.tabPanels[tabName]) return;
  state.activeTab = tabName;

  Object.keys(dom.tabPanels).forEach((key) => {
    dom.tabPanels[key].classList.toggle("active", key === tabName);
  });

  dom.navButtons.forEach((btn) => {
    const isCurrent = btn.dataset.tab === tabName;
    btn.classList.toggle("active", isCurrent);
    if (isCurrent) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  if (tabName === "order-entry") {
    dom.pageTitle.textContent = "ORDER ENTRY";
    dom.pageSubtitle.textContent = "OY, TAPSI! Menu & Live Customer Cart";
  } else if (tabName === "analytics-records") {
    dom.pageTitle.textContent = "ANALYTICS & RECORDS";
    dom.pageSubtitle.textContent = "Key Performance Metrics & Completed Order Logbook";
    renderRecordsLogbook();
  } else if (tabName === "admin-profile") {
    syncProfileForCurrentUser();
    dom.pageTitle.textContent = "ADMIN PROFILE";
    dom.pageSubtitle.textContent = "Operator Account & Session Status";
  }
}

function initApp() {
  updateClock();
  setInterval(updateClock, 30000);

  dom.loginForm.addEventListener("submit", (e) => handleLoginSubmit(e, switchTab));
  dom.toggleLoginPassword.addEventListener("click", handleTogglePasswordVisibility);
  dom.openSignupBtn.addEventListener("click", () => showAuthCard("signup-view"));
  dom.openForgotBtn.addEventListener("click", () => showAuthCard("forgot-view"));
  dom.signupForm.addEventListener("submit", handleSignupSubmit);
  dom.backToLoginFromSignup.addEventListener("click", () => showAuthCard("login-view"));
  dom.forgotForm.addEventListener("submit", handleForgotSubmit);
  dom.backToLoginFromForgot.addEventListener("click", () => showAuthCard("login-view"));

  dom.logoutBtn.addEventListener("click", openLogoutConfirmation);
  dom.cancelLogoutBtn.addEventListener("click", closeLogoutConfirmation);
  dom.confirmLogoutBtn.addEventListener("click", confirmAndExecuteLogout);
  dom.logoutModal.addEventListener("click", (e) => {
    if (e.target === dom.logoutModal) closeLogoutConfirmation();
  });

  dom.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  dom.backToPosBtn.addEventListener("click", () => switchTab("order-entry"));

  dom.paymentButtons.forEach((btn) => {
    btn.addEventListener("click", () => setPaymentMethod(btn.dataset.payment));
  });
  dom.completeOrderBtn.addEventListener("click", handleCompleteOrder);

  dom.logbookFilterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLogbookFilter(btn.dataset.filter));
  });

  renderCategories();
  renderMenuCards();
  renderCart();
  renderRecordsLogbook();
}

document.addEventListener("DOMContentLoaded", initApp);