// ==========================================================================
// 5. ORDER ENTRY, AVAILABILITY TOGGLES (✓ / ✕) & CART CHECKOUT LOGIC
// ==========================================================================

import { CATEGORIES, MENU_ITEMS } from "./data.js";
import { state, dom } from "./state.js";
import { formatPeso, getFormattedDateTime } from "./utils.js";
import { renderRecordsLogbook } from "./records.js";

const CHECK_ICON_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
`;

const CROSS_ICON_SVG = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
`;

export function renderCategories() {
  dom.categoryBar.innerHTML = "";
  for (let i = 0; i < CATEGORIES.length; i += 1) {
    const cat = CATEGORIES[i];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `cat-btn${state.activeCategory === cat ? " active" : ""}`;
    btn.textContent = cat;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(state.activeCategory === cat));
    btn.addEventListener("click", () => {
      state.activeCategory = cat;
      renderCategories();
      renderMenuCards();
    });
    dom.categoryBar.appendChild(btn);
  }
}

export function renderMenuCards() {
  dom.menuGrid.innerHTML = "";
  for (let i = 0; i < MENU_ITEMS.length; i += 1) {
    const item = MENU_ITEMS[i];
    if (state.activeCategory !== "ALL" && item.category !== state.activeCategory) {
      continue;
    }

    const card = document.createElement("div");
    card.className = `menu-card${item.available ? "" : " sold-out"}`;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      item.available
        ? `Add ${item.name} (${formatPeso(item.price)}) to order`
        : `${item.name} is currently unavailable`
    );

    card.innerHTML = `
      <div class="menu-card-top">
        <span class="menu-cat-tag">${item.category}</span>
        <button
          type="button"
          class="availability-toggle-btn ${item.available ? "is-available" : "is-unavailable"}"
          title="${item.available ? "Available — Click to mark Sold Out" : "Sold Out — Click to mark Available"}"
          aria-label="Toggle availability for ${item.name}"
        >
          ${item.available ? CHECK_ICON_SVG : CROSS_ICON_SVG}
        </button>
      </div>
      <div class="menu-name">${item.name}</div>
      <div class="menu-card-bottom">
        <div class="menu-price">${formatPeso(item.price)}</div>
        ${item.available ? "" : '<span class="sold-out-pill">SOLD OUT</span>'}
      </div>
    `;

    // Toggle availability status without adding item to cart
    const toggleBtn = card.querySelector(".availability-toggle-btn");
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      item.available = !item.available;
      dom.orderToast.textContent = `${item.name} marked as ${item.available ? "AVAILABLE" : "SOLD OUT"}.`;
      renderMenuCards();
    });

    // Add item to cart when clicking the card (only if available)
    card.addEventListener("click", () => {
      if (!item.available) {
        dom.orderToast.textContent = `${item.name} is currently sold out.`;
        return;
      }
      addItemToCart(item);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });

    dom.menuGrid.appendChild(card);
  }
}

export function addItemToCart(menuItem) {
  dom.orderToast.textContent = "";
  let existing = null;
  for (let i = 0; i < state.cart.length; i += 1) {
    if (state.cart[i].id === menuItem.id) {
      existing = state.cart[i];
      break;
    }
  }

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: menuItem.id,
      name: menuItem.name,
      unitPrice: menuItem.price,
      qty: 1
    });
  }
  renderCart();
}

function changeItemQty(itemId, delta) {
  for (let i = 0; i < state.cart.length; i += 1) {
    if (state.cart[i].id === itemId) {
      const nextQty = state.cart[i].qty + delta;
      if (nextQty <= 0) {
        state.cart.splice(i, 1);
      } else {
        state.cart[i].qty = nextQty;
      }
      break;
    }
  }
  renderCart();
}

function removeCartItem(itemId) {
  state.cart = state.cart.filter((item) => item.id !== itemId);
  renderCart();
}

export function renderCart() {
  dom.cartItemsList.innerHTML = "";
  let totalQty = 0;
  let subtotal = 0;

  if (state.cart.length === 0) {
    dom.cartItemsList.innerHTML =
      '<p class="cart-empty">No items added yet. Click any available menu card to add.</p>';
  } else {
    for (let i = 0; i < state.cart.length; i += 1) {
      const entry = state.cart[i];
      const lineTotal = entry.unitPrice * entry.qty;
      totalQty += entry.qty;
      subtotal += lineTotal;

      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <div class="cart-item-meta">
          <div class="cart-item-name" title="${entry.name}">${entry.name}</div>
          <div class="cart-item-sub">${formatPeso(entry.unitPrice)} each &bull; ${formatPeso(lineTotal)}</div>
        </div>
        <div class="qty-controls">
          <button type="button" class="qty-btn" aria-label="Decrease quantity of ${entry.name}">-</button>
          <span class="qty-val">${entry.qty}</span>
          <button type="button" class="qty-btn" aria-label="Increase quantity of ${entry.name}">+</button>
          <button type="button" class="remove-btn" aria-label="Remove ${entry.name}">X</button>
        </div>
      `;

      const [minusBtn, plusBtn, delBtn] = row.querySelectorAll("button");
      minusBtn.addEventListener("click", () => changeItemQty(entry.id, -1));
      plusBtn.addEventListener("click", () => changeItemQty(entry.id, 1));
      delBtn.addEventListener("click", () => removeCartItem(entry.id));

      dom.cartItemsList.appendChild(row);
    }
  }

  dom.cartItemCount.textContent = `${totalQty} ${totalQty === 1 ? "ITEM" : "ITEMS"}`;
  dom.cartSubtotal.textContent = formatPeso(subtotal);
  dom.cartTotal.textContent = formatPeso(subtotal);
}

export function setPaymentMethod(method) {
  state.paymentMethod = method === "GCASH" ? "GCASH" : "CASH";
  dom.paymentButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.payment === state.paymentMethod);
  });
}

export function handleCompleteOrder() {
  if (state.cart.length === 0) {
    dom.orderToast.textContent = "Add at least one menu item before completing an order.";
    return;
  }

  const orderNumber = `ORD-${String(state.orderCounter).padStart(4, "0")}`;
  const now = new Date();
  const dateTimeStr = getFormattedDateTime(now);
  const timestampMs = now.getTime();

  let orderTotal = 0;
  for (let i = 0; i < state.cart.length; i += 1) {
    orderTotal += state.cart[i].unitPrice * state.cart[i].qty;
  }

  for (let i = 0; i < state.cart.length; i += 1) {
    const item = state.cart[i];
    const lineTotal = item.unitPrice * item.qty;
    state.records.unshift({
      orderNumber,
      dateTime: dateTimeStr,
      timestampMs,
      foodItem: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      lineTotal,
      orderTotal,
      paymentMethod: state.paymentMethod
    });
  }

  state.orderCounter += 1;
  state.cart = [];
  renderCart();
  renderRecordsLogbook();

  dom.orderToast.textContent = `${orderNumber} saved (${state.paymentMethod} • ${formatPeso(orderTotal)}).`;
}