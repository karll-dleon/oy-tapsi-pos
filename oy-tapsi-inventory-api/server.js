require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const authRoutes = require("./backend/models/routes/auth");
const store = require("./data/store");

let Item = null;
try {
  Item = require("./backend/models/Item");
} catch (_) {
  Item = null;
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

let dbConnected = false;

app.use(express.json());

// Allow cross-origin requests from Live Server (e.g., http://127.0.0.1:5500) & local frontends
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "..")));

// Auth routes (Signup, Login, Fetch Users)
app.use("/api/auth", authRoutes);

function isValidObjectId(id) {
  if (dbConnected && Item) {
    return mongoose.isValidObjectId(id);
  }
  return /^\d+$/.test(String(id));
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
    storageMode: dbConnected ? "mongodb" : "local-store",
    dbState: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  });
});

// READ ALL (with optional ?category= filter)
app.get("/api/items", async (req, res) => {
  try {
    const category = req.query.category ? req.query.category.trim() : "";

    if (dbConnected && Item) {
      const filter = category ? { category } : {};
      const list = await Item.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({
        count: list.length,
        data: list
      });
    }

    const allItems = store.getAllItems();
    const list = category
      ? allItems.filter(
          (item) => String(item.category).toLowerCase() === category.toLowerCase()
        )
      : allItems;

    return res.status(200).json({
      count: list.length,
      data: list
    });
  } catch (err) {
    console.error("GET /api/items error:", err);
    return res.status(500).json({ error: "Failed to retrieve inventory items." });
  }
});

// READ SINGLE BY ID
app.get("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid item ID format." });
  }

  try {
    if (dbConnected && Item) {
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ error: `Item with ID ${id} not found.` });
      }
      return res.status(200).json({ data: item });
    }

    const item = store.getItemById(id);
    if (!item) {
      return res.status(404).json({ error: `Item with ID ${id} not found.` });
    }
    return res.status(200).json({ data: item });
  } catch (err) {
    console.error("GET /api/items/:id error:", err);
    return res.status(500).json({ error: "Failed to retrieve inventory item." });
  }
});

// CREATE NEW ITEM
app.post("/api/items", async (req, res) => {
  const body = req.body || {};
  const errors = validateItemPayload(body, false);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  try {
    const payload = {
      sku: body.sku.trim(),
      name: body.name.trim(),
      category: body.category.trim(),
      price: Number(body.price),
      stock: Number(body.stock)
    };

    if (dbConnected && Item) {
      const created = await Item.create(payload);
      return res.status(201).json({
        message: "Inventory item created successfully.",
        data: created
      });
    }

    const created = store.createItem(payload);
    return res.status(201).json({
      message: "Inventory item created successfully.",
      data: created
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "An inventory item with that SKU already exists." });
    }
    console.error("POST /api/items error:", err);
    return res.status(500).json({ error: "Failed to create inventory item." });
  }
});

// UPDATE EXISTING ITEM
app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid item ID format." });
  }

  const body = req.body || {};
  const errors = validateItemPayload(body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const updates = {};
  if (body.sku !== undefined) updates.sku = body.sku.trim();
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.category !== undefined) updates.category = body.category.trim();
  if (body.price !== undefined) updates.price = Number(body.price);
  if (body.stock !== undefined) updates.stock = Number(body.stock);

  try {
    if (dbConnected && Item) {
      const updated = await Item.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!updated) {
        return res.status(404).json({ error: `Item with ID ${id} not found.` });
      }

      return res.status(200).json({
        message: "Inventory item updated successfully.",
        data: updated
      });
    }

    const updated = store.updateItem(id, updates);
    if (!updated) {
      return res.status(404).json({ error: `Item with ID ${id} not found.` });
    }

    return res.status(200).json({
      message: "Inventory item updated successfully.",
      data: updated
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "An inventory item with that SKU already exists." });
    }
    console.error("PUT /api/items/:id error:", err);
    return res.status(500).json({ error: "Failed to update inventory item." });
  }
});

// DELETE ITEM BY ID
app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid item ID format." });
  }

  try {
    if (dbConnected && Item) {
      const deleted = await Item.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: `Item with ID ${id} not found.` });
      }

      return res.status(200).json({
        message: "Inventory item deleted successfully.",
        data: deleted
      });
    }

    const deleted = store.deleteItem(id);
    if (!deleted) {
      return res.status(404).json({ error: `Item with ID ${id} not found.` });
    }

    return res.status(200).json({
      message: "Inventory item deleted successfully.",
      data: deleted
    });
  } catch (err) {
    console.error("DELETE /api/items/:id error:", err);
    return res.status(500).json({ error: "Failed to delete inventory item." });
  }
});

// Handle Malformed JSON Body Gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON payload in request body." });
  }
  return next(err);
});

// Fallback JSON Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error." });
});

async function startServer() {
  if (MONGODB_URI && Item) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      dbConnected = true;
      console.log("Connected to MongoDB Atlas");
    } catch (err) {
      dbConnected = false;
      console.warn("MongoDB unavailable, running with local store:", err.message);
    }
  } else {
    console.log("Running without MongoDB (using local store)");
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();