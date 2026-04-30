// menuItemRoutes.js
const express = require("express");
const router = express.Router();
const { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem, setMenuItemApproval } = require("../controllers/menuItemController");
const { verifyToken, attachAdmin } = require("../middleware/auth");

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.post("/", verifyToken, createMenuItem);
router.put("/:id", verifyToken, updateMenuItem);
router.delete("/:id", verifyToken, deleteMenuItem);
router.patch("/:id/approval", verifyToken, attachAdmin, setMenuItemApproval);

module.exports = router;
console.log("menuItemRoutes file executed");