import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đủ tên, email, mật khẩu." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải từ 6 ký tự." });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email đã được đăng ký." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "staff",
    });

    const token = signToken(user);
    res.status(201).json({ accessToken: token, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu." });
    }

    const token = signToken(user);
    res.json({ accessToken: token, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
