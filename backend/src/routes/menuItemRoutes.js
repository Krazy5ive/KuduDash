const express = require("express");
const router = express.Router();
const { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } = require("../controllers/menuItemController");

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.post("/", createMenuItem);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;