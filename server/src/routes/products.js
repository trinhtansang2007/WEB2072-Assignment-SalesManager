import { Router } from "express";
import { Product } from "../models/Product.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const { q, category, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (status) filter.status = status;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(50, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireRole("admin", "staff"), async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, status, stock } = req.body;
    if (!name || price == null || !category) {
      return res.status(400).json({ message: "Thiếu tên, giá hoặc danh mục." });
    }

    const product = await Product.create({
      name,
      description: description || "",
      price: Number(price),
      category,
      imageUrl: imageUrl || undefined,
      status: status === "unavailable" ? "unavailable" : "available",
      stock: Number(stock) || 0,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireRole("admin", "staff"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    res.json({ message: "Đã xóa sản phẩm." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
