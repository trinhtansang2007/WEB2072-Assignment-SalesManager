import { Router } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function makeOrderCode() {
  return "#" + String(Math.floor(100000 + Math.random() * 900000));
}

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;

    let items = await Order.find(filter)
      .populate("customer", "name email phone address")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    if (q) {
      const keyword = String(q).toLowerCase();
      items = items.filter((order) => {
        const name = order.customer?.name?.toLowerCase() || "";
        return order.code.toLowerCase().includes(keyword) || name.includes(keyword);
      });
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("createdBy", "name email role");
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireRole("admin", "staff"), async (req, res) => {
  try {
    const { customerId, items, status, note } = req.body;
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Thiếu khách hàng hoặc sản phẩm." });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Khách hàng không tồn tại." });

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: "Sản phẩm không hợp lệ." });
      }
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = product.price * quantity;
      total += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const order = await Order.create({
      code: makeOrderCode(),
      customer: customer._id,
      items: orderItems,
      total,
      status: status || "pending",
      note: note || "",
      createdBy: req.user._id,
    });

    const populated = await Order.findById(order._id).populate("customer", "name email phone address");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireRole("admin", "staff"), async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng." });

    if (status) order.status = status;
    if (note != null) order.note = note;
    await order.save();

    const populated = await Order.findById(order._id).populate("customer", "name email phone address");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    res.json({ message: "Đã xóa đơn hàng." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
