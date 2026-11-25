const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "inventory.json");

const DEFAULT_ITEMS = [
  {
    id: 1,
    sku: "SILOG-001",
    name: "TAPSILOG",
    category: "SILOG MEALS",
    price: 100,
    stock: 25,
    available: true
  },
  {
    id: 2,
    sku: "PARES-001",
    name: "PARES BEEF",
    category: "PARES MEALS",
    price: 120,
    stock: 18,
    available: true
  },
  {
    id: 3,
    sku: "GOTO-001",
    name: "GOTO w/ EGG",
    category: "GOTO",
    price: 40,
    stock: 30,
    available: true
  }
];

function loadItems() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_ITEMS, null, 2), "utf8");
      return [...DEFAULT_ITEMS];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_ITEMS];
  } catch (err) {
    console.error("Failed to read inventory file, using defaults:", err.message);
    return [...DEFAULT_ITEMS];
  }
}

function saveItems(items) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save inventory file:", err.message);
  }
}

let items = loadItems();

function getNextId() {
  let maxId = 0;
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].id > maxId) {
      maxId = items[i].id;
    }
  }
  return maxId + 1;
}

function getAllItems(categoryFilter) {
  if (!categoryFilter || String(categoryFilter).trim().toUpperCase() === "ALL") {
    return items;
  }
  const target = String(categoryFilter).trim().toUpperCase();
  const result = [];
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].category.toUpperCase() === target) {
      result.push(items[i]);
    }
  }
  return result;
}

function getItemById(id) {
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].id === id) {
      return items[i];
    }
  }
  return null;
}

function createItem(payload) {
  const newItem = {
    id: getNextId(),
    sku: payload.sku.trim().toUpperCase(),
    name: payload.name.trim(),
    category: payload.category.trim().toUpperCase(),
    price: Number(payload.price),
    stock: Number(payload.stock),
    available: payload.available !== undefined ? Boolean(payload.available) : Number(payload.stock) > 0
  };
  items.push(newItem);
  saveItems(items);
  return newItem;
}

function updateItem(id, updates) {
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].id === id) {
      const current = items[i];
      const updated = {
        id: current.id,
        sku: updates.sku !== undefined ? String(updates.sku).trim().toUpperCase() : current.sku,
        name: updates.name !== undefined ? String(updates.name).trim() : current.name,
        category:
          updates.category !== undefined
            ? String(updates.category).trim().toUpperCase()
            : current.category,
        price: updates.price !== undefined ? Number(updates.price) : current.price,
        stock: updates.stock !== undefined ? Number(updates.stock) : current.stock,
        available:
          updates.available !== undefined ? Boolean(updates.available) : current.available
      };
      items[i] = updated;
      saveItems(items);
      return updated;
    }
  }
  return null;
}

function deleteItem(id) {
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].id === id) {
      const [removed] = items.splice(i, 1);
      saveItems(items);
      return removed;
    }
  }
  return null;
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};