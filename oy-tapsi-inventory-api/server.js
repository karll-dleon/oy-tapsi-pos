const express = require("express");
const path = require("path");
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require("./data/store");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function parseValidId(rawId) {
  const num = Number(rawId);
  if (!Number.isInteger(num) || num <= 0) {
    return null;
  }
  return num;
}

function validateItemPayload(body, isPartial = false) {
  const errors = [];

  if (!isPartial || body.sku !== undefined) {
    if (typeof body.sku !== "string" || body.sku.trim().length < 2) {
      errors.push("sku is required and must be at least 2 characters.");
    }
  }

  if (!isPartial || body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
      errors.push("name is required and must be at least 2 characters.");
    }
  }

  if (!isPartial || body.category !== undefined) {
    if (typeof body.category !== "string" || body.category.trim().length < 2) {
      errors.push("category is required and must be at least 2 characters.");
    }
  }

  if (!isPartial || body.price !== undefined) {
    const priceNum = Number(body.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      errors.push("price must be a valid non-negative number.");
    }
  }

  if (!isPartial || body.stock !== undefined) {
    const stockNum = Number(body.stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      errors.push("stock must be a valid non-negative whole number.");
    }
  }

  return errors;
}

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "OY, TAPSI! ATBP. Inventory CRUD API",
    timestamp: new Date().toISOString()
  });
});

// READ ALL (with optional ?category= filter)
app.get("/api/items", (req, res) => {
  try {
    const list = getAllItems(req.query.category);
    res.status(200).json({
      count: list.length,
      data: list
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve inventory items." });
  }
});

// READ SINGLE BY ID
app.get("/api/items/:id", (req, res) => {
  const id = parseValidId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Invalid item ID. Must be a positive integer." });
  }

  const item = getItemById(id);
  if (!item) {
    return res.status(404).json({ error: `Item with ID ${id} not found.` });
  }

  return res.status(200).json({ data: item });
});

// CREATE NEW ITEM
app.post("/api/items", (req, res) => {
  const body = req.body || {};
  const errors = validateItemPayload(body, false);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const created = createItem(body);
  return res.status(201).json({
    message: "Inventory item created successfully.",
    data: created
  });
});

// UPDATE EXISTING ITEM
app.put("/api/items/:id", (req, res) => {
  const id = parseValidId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Invalid item ID. Must be a positive integer." });
  }

  const body = req.body || {};
  const errors = validateItemPayload(body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const updated = updateItem(id, body);
  if (!updated) {
    return res.status(404).json({ error: `Item with ID ${id} not found.` });
  }

  return res.status(200).json({
    message: "Inventory item updated successfully.",
    data: updated
  });
});

// DELETE ITEM BY ID
app.delete("/api/items/:id", (req, res) => {
  const id = parseValidId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Invalid item ID. Must be a positive integer." });
  }

  const deleted = deleteItem(id);
  if (!deleted) {
    return res.status(404).json({ error: `Item with ID ${id} not found.` });
  }

  return res.status(200).json({
    message: "Inventory item deleted successfully.",
    data: deleted
  });
});

// Handle Malformed JSON Body Gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON payload in request body." });
  }
  return next(err);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});