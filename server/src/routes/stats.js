import { Router } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/overview", async (req, res) => {
  try {
    const [orders, products, customers] = await Promise.all([
      Order.find().populate("customer", "name address"),
      Product.find(),
      Customer.countDocuments(),
    ]);

    const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "confirmed" || o.status === "shipping");
    const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyRevenue = dayNames.map((day) => ({ day, value: 0 }));
    const dailyOrders = dayNames.map((day) => ({ day, value: 0 }));

    for (const order of orders) {
      const day = dayNames[new Date(order.createdAt).getDay()];
      const revenueItem = dailyRevenue.find((d) => d.day === day);
      const orderItem = dailyOrders.find((d) => d.day === day);
      if (orderItem) orderItem.value += 1;
      if (revenueItem && order.status !== "cancelled") {
        revenueItem.value += order.total;
      }
    }

    const productSales = new Map();
    for (const order of orders) {
      if (order.status === "cancelled") continue;
      for (const item of order.items) {
        const key = item.name;
        const current = productSales.get(key) || { name: item.name, total: 0, quantity: 0, price: item.price };
        current.total += item.price * item.quantity;
        current.quantity += item.quantity;
        productSales.set(key, current);
      }
    }

    const trendingProducts = [...productSales.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((item, index) => ({
        rank: index + 1,
        name: item.name,
        price: item.price,
        ordered: item.quantity,
        imageUrl: products.find((p) => p.name === item.name)?.imageUrl || "https://picsum.photos/id/30/100/100",
      }));

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((order) => ({
        id: order._id,
        code: order.code,
        customerName: order.customer?.name || "Khách",
        address: order.customer?.address || "",
        itemsLabel: order.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      }));

    res.json({
      summary: {
        revenue,
        orderCount: orders.length,
        customerCount: customers,
        productCount: products.length,
        availableProducts: products.filter((p) => p.status === "available").length,
      },
      dailyRevenue,
      dailyOrders,
      trendingProducts,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
