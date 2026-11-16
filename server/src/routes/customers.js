import { Router } from "express";
import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }
    const items = await Customer.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
    res.json({ customer, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireRole("admin", "staff"), async (req, res) => {
  try {
    const { name, email, phone, address, note } = req.body;
    if (!name) return res.status(400).json({ message: "Tên khách hàng là bắt buộc." });
    const customer = await Customer.create({ name, email, phone, address, note });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireRole("admin", "staff"), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    res.json({ message: "Đã xóa khách hàng." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
