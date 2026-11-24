// ==========================================================================
// 2. CENTRALIZED APPLICATION STATE & DOM ELEMENT REFERENCES
// ==========================================================================

export const state = {
  currentUser: null,
  activeCategory: "ALL",
  activeTab: "order-entry",
  logbookFilter: "ALL", // ALL | DAILY | WEEKLY | MONTHLY | YEARLY
  paymentMethod: "CASH",
  cart: [],
  orderCounter: 1,
  records: []
};

export const dom = {
  // Auth Screens
  authWrapper: document.getElementById("auth-wrapper"),
  loginView: document.getElementById("login-view"),
  signupView: document.getElementById("signup-view"),
  forgotView: document.getElementById("forgot-view"),
  loginForm: document.getElementById("login-form"),
  loginEmail: document.getElementById("login-email"),
  loginPassword: document.getElementById("login-password"),
  toggleLoginPassword: document.getElementById("toggle-login-password"),
  eyeOpenIcon: document.getElementById("eye-open-icon"),
  eyeClosedIcon: document.getElementById("eye-closed-icon"),
  loginFeedback: document.getElementById("login-feedback"),
  openForgotBtn: document.getElementById("open-forgot-btn"),
  openSignupBtn: document.getElementById("open-signup-btn"),
  signupForm: document.getElementById("signup-form"),
  signupName: document.getElementById("signup-name"),
  signupEmail: document.getElementById("signup-email"),
  signupPassword: document.getElementById("signup-password"),
  signupConfirm: document.getElementById("signup-confirm"),
  signupFeedback: document.getElementById("signup-feedback"),
  backToLoginFromSignup: document.getElementById("back-to-login-from-signup"),
  forgotForm: document.getElementById("forgot-form"),
  forgotEmail: document.getElementById("forgot-email"),
  forgotNewPassword: document.getElementById("forgot-new-password"),
  forgotFeedback: document.getElementById("forgot-feedback"),
  backToLoginFromForgot: document.getElementById("back-to-login-from-forgot"),

  // App Shell & Navigation
  appShell: document.getElementById("app-shell"),
  navButtons: Array.from(document.querySelectorAll(".nav-item[data-tab]")),
  logoutBtn: document.getElementById("logout-btn"),
  sidebarAdminLabel: document.getElementById("sidebar-admin-label"),
  tabPanels: {
    "order-entry": document.getElementById("tab-order-entry"),
    "analytics-records": document.getElementById("tab-analytics-records"),
    "admin-profile": document.getElementById("tab-admin-profile")
  },
  pageTitle: document.getElementById("page-title"),
  pageSubtitle: document.getElementById("page-subtitle"),
  liveClock: document.getElementById("live-clock"),

  // Logout Confirmation Modal
  logoutModal: document.getElementById("logout-modal"),
  cancelLogoutBtn: document.getElementById("cancel-logout-btn"),
  confirmLogoutBtn: document.getElementById("confirm-logout-btn"),

  // Profile
  profileAvatar: document.getElementById("profile-avatar"),
  profileBadge: document.getElementById("profile-badge"),
  profileName: document.getElementById("profile-name"),
  profileEmail: document.getElementById("profile-email"),
  profileShift: document.getElementById("profile-shift"),
  backToPosBtn: document.getElementById("back-to-pos-btn"),

  // Order Entry & Cart
  categoryBar: document.getElementById("category-bar"),
  menuGrid: document.getElementById("menu-grid"),
  cartItemCount: document.getElementById("cart-item-count"),
  cartItemsList: document.getElementById("cart-items-list"),
  paymentButtons: Array.from(document.querySelectorAll(".payment-btn")),
  cartSubtotal: document.getElementById("cart-subtotal"),
  cartTotal: document.getElementById("cart-total"),
  completeOrderBtn: document.getElementById("complete-order-btn"),
  orderToast: document.getElementById("order-toast"),

  // Analytics & Logbook
  statOrderCount: document.getElementById("stat-order-count"),
  statOrderSub: document.getElementById("stat-order-sub"),
  statGrossSales: document.getElementById("stat-gross-sales"),
  statAvgOrder: document.getElementById("stat-avg-order"),
  statTopPayment: document.getElementById("stat-top-payment"),
  statSyncSub: document.getElementById("stat-sync-sub"),
  logbookFilterButtons: Array.from(document.querySelectorAll(".filter-pill[data-filter]")),
  recordsTbody: document.getElementById("records-tbody")
};