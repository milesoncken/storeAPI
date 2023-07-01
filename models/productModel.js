const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter a product name"],
    },
    quantity: {
      type: Number,
      required: [true, "please enter a quantity"],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "please enter a price"],
    },
    image: {
      type: String,
      required: false,
    },
    shortDescription: {
      type: String,
      required: false,
    },
    longDescription: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
