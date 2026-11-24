// ==========================================================================
// 6. ANALYTICS KPI CALCULATIONS & TIME-FILTERED TRANSACTION LOGBOOK
// ==========================================================================

import { state, dom } from "./state.js";
import { formatPeso } from "./utils.js";

function matchesTimeFilter(timestampMs, filter) {
  if (filter === "ALL" || !timestampMs) return true;

  const now = new Date();
  const recDate = new Date(timestampMs);

  if (filter === "DAILY") {
    return (
      recDate.getFullYear() === now.getFullYear() &&
      recDate.getMonth() === now.getMonth() &&
      recDate.getDate() === now.getDate()
    );
  }

  if (filter === "WEEKLY") {
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday start
    return recDate >= startOfWeek;
  }

  if (filter === "MONTHLY") {
    return (
      recDate.getFullYear() === now.getFullYear() &&
      recDate.getMonth() === now.getMonth()
    );
  }

  if (filter === "YEARLY") {
    return recDate.getFullYear() === now.getFullYear();
  }

  return true;
}

export function setLogbookFilter(filter) {
  state.logbookFilter = filter;
  dom.logbookFilterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderRecordsLogbook();
}

export function renderRecordsLogbook() {
  dom.recordsTbody.innerHTML = "";

  const filteredRecords = state.records.filter((rec) =>
    matchesTimeFilter(rec.timestampMs, state.logbookFilter)
  );

  const uniqueOrders = new Set();
  const seenOrderTotals = new Set();
  let grossSales = 0;
  let totalItemsSold = 0;
  let cashOrders = 0;
  let gcashOrders = 0;

  for (let i = 0; i < filteredRecords.length; i += 1) {
    const rec = filteredRecords[i];
    uniqueOrders.add(rec.orderNumber);
    totalItemsSold += rec.qty;

    if (!seenOrderTotals.has(rec.orderNumber)) {
      seenOrderTotals.add(rec.orderNumber);
      grossSales += rec.orderTotal;
      if (rec.paymentMethod === "GCASH") {
        gcashOrders += 1;
      } else {
        cashOrders += 1;
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${rec.orderNumber}</td>
      <td>${rec.dateTime}</td>
      <td>${rec.foodItem}</td>
      <td>${rec.qty}</td>
      <td>${formatPeso(rec.unitPrice)}</td>
      <td>${formatPeso(rec.lineTotal)}</td>
      <td>${rec.paymentMethod}</td>
      <td>${formatPeso(rec.orderTotal)}</td>
    `;
    dom.recordsTbody.appendChild(tr);
  }

  if (filteredRecords.length === 0) {
    const filterLabel =
      state.logbookFilter === "ALL" ? "" : ` for ${state.logbookFilter.toLowerCase()} view`;
    dom.recordsTbody.innerHTML = `
      <tr class="empty-table-row">
        <td colspan="8">No completed orders found${filterLabel}. Complete an order in Order Entry to log it here.</td>
      </tr>
    `;
  }

  // Update KPI Cards & Sub-details
  const orderCount = uniqueOrders.size;
  const avgOrderVal = orderCount > 0 ? grossSales / orderCount : 0;

  dom.statOrderCount.textContent = String(orderCount);
  dom.statOrderSub.textContent = `${totalItemsSold} total ${totalItemsSold === 1 ? "item" : "items"} sold (${state.logbookFilter})`;

  dom.statGrossSales.textContent = formatPeso(grossSales);
  dom.statAvgOrder.textContent = `Avg. Order Value: ${formatPeso(avgOrderVal)}`;

  if (orderCount === 0) {
    dom.statTopPayment.textContent = "IN-MEMORY SYNCED";
    dom.statSyncSub.textContent = "No transactions recorded in this period";
  } else {
    const topChannel = gcashOrders > cashOrders ? "GCASH" : "CASH";
    dom.statTopPayment.textContent = `TOP: ${topChannel}`;
    dom.statSyncSub.textContent = `${cashOrders} Cash • ${gcashOrders} GCash orders synced`;
  }
}