import "dotenv/config";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Product } from "./models/Product.js";
import { Customer } from "./models/Customer.js";
import { Order } from "./models/Order.js";

await connectDB(process.env.MONGODB_URI);

await Promise.all([
  User.deleteMany({}),
  Product.deleteMany({}),
  Customer.deleteMany({}),
  Order.deleteMany({}),
]);

const admin = await User.create({
  name: "Admin",
  email: "admin@fpt.edu.vn",
  password: "123456",
  role: "admin",
});

const staff = await User.create({
  name: "Nhan Vien",
  email: "staff@fpt.edu.vn",
  password: "123456",
  role: "staff",
});

const products = await Product.insertMany([
  {
    name: "Spaghetti Carbonara",
    description: "Pasta with eggs, cheese and bacon",
    price: 14,
    category: "Pastas",
    imageUrl: "https://picsum.photos/id/292/200/200",
    status: "available",
    stock: 40,
  },
  {
    name: "Coke",
    description: "Classic soft drink",
    price: 3,
    category: "Cold Drinks",
    imageUrl: "https://picsum.photos/id/30/200/200",
    status: "available",
    stock: 100,
  },
  {
    name: "Tiramisu Cake",
    description: "Italian dessert cake",
    price: 8,
    category: "Deserts",
    imageUrl: "https://picsum.photos/id/312/200/200",
    status: "available",
    stock: 25,
  },
  {
    name: "Bruschetta",
    description: "Toasted bread with tomato",
    price: 7,
    category: "Starters",
    imageUrl: "https://picsum.photos/id/225/200/200",
    status: "available",
    stock: 30,
  },
  {
    name: "Espresso",
    description: "Strong Italian coffee",
    price: 4,
    category: "Hot Drinks",
    imageUrl: "https://picsum.photos/id/431/200/200",
    status: "available",
    stock: 80,
  },
  {
    name: "Caesar Salad",
    description: "Fresh salad with chicken",
    price: 10,
    category: "Salads",
    imageUrl: "https://picsum.photos/id/1080/200/200",
    status: "unavailable",
    stock: 0,
  },
  {
    name: "Cheeseburger",
    description: "Beef burger with cheese",
    price: 12,
    category: "Starters",
    imageUrl: "https://picsum.photos/id/1082/200/200",
    status: "available",
    stock: 35,
  },
  {
    name: "Coffee",
    description: "Hot milk coffee",
    price: 5,
    category: "Hot Drinks",
    imageUrl: "https://picsum.photos/id/1060/200/200",
    status: "available",
    stock: 90,
  },
  {
    name: "Apple Pie",
    description: "Homemade apple pie",
    price: 6,
    category: "Deserts",
    imageUrl: "https://picsum.photos/id/201/200/200",
    status: "available",
    stock: 20,
  },
  {
    name: "Edamame",
    description: "Salted green soybeans",
    price: 5,
    category: "Starters",
    imageUrl: "https://picsum.photos/id/102/200/200",
    status: "available",
    stock: 50,
  },
]);

const customers = await Customer.insertMany([
  {
    name: "Ivan Petrov",
    email: "vana@gmail.com",
    phone: "0901111222",
    address: "12 Nguyen Trai, Q1",
  },
  {
    name: "Tran Thi B",
    email: "thib@gmail.com",
    phone: "0903333444",
    address: "45 Le Loi, Q3",
  },
  {
    name: "Le Van C",
    email: "vanc@gmail.com",
    phone: "0905555666",
    address: "78 Hai Ba Trung, Q1",
  },
]);

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

await Order.insertMany([
  {
    code: "#355338",
    customer: customers[0]._id,
    items: [{ product: products[9]._id, name: products[9].name, price: products[9].price, quantity: 1 }],
    total: 5,
    status: "completed",
    createdBy: staff._id,
    createdAt: new Date(now - 1 * dayMs),
  },
  {
    code: "#104389",
    customer: customers[1]._id,
    items: [{ product: products[8]._id, name: products[8].name, price: products[8].price, quantity: 1 }],
    total: 6,
    status: "completed",
    createdBy: staff._id,
    createdAt: new Date(now - 2 * dayMs),
  },
  {
    code: "#220145",
    customer: customers[2]._id,
    items: [
      { product: products[7]._id, name: products[7].name, price: products[7].price, quantity: 2 },
      { product: products[1]._id, name: products[1].name, price: products[1].price, quantity: 1 },
    ],
    total: 13,
    status: "shipping",
    createdBy: admin._id,
    createdAt: new Date(now - 3 * dayMs),
  },
  {
    code: "#880221",
    customer: customers[0]._id,
    items: [{ product: products[0]._id, name: products[0].name, price: products[0].price, quantity: 1 }],
    total: 14,
    status: "pending",
    createdBy: staff._id,
    createdAt: new Date(now),
  },
  {
    code: "#991002",
    customer: customers[1]._id,
    items: [{ product: products[6]._id, name: products[6].name, price: products[6].price, quantity: 2 }],
    total: 24,
    status: "confirmed",
    createdBy: admin._id,
    createdAt: new Date(now - 4 * dayMs),
  },
]);

console.log("Seed xong.");
console.log("Admin: admin@fpt.edu.vn / 123456");
console.log("Staff: staff@fpt.edu.vn / 123456");
process.exit(0);
