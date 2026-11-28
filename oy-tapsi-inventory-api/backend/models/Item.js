const mongoose = require("mongoose");
 
const itemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "stock must be a whole number."
      }
    }
  },
  {
    timestamps: true
  }
);
 
module.exports = mongoose.model("Item", itemSchema);
