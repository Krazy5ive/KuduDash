const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const studentRoutes = require("./src/routes/studentRoutes");
const vendorRoutes = require("./src/routes/vendorRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const menuItemRoutes = require("./src/routes/menuItemRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/students", studentRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/orders", orderRoutes);

const authRoutes = require("./src/routes/auth.routes");
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
