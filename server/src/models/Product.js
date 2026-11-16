import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "https://picsum.photos/id/10/200/200" },
    status: { type: String, enum: ["available", "unavailable"], default: "available" },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
