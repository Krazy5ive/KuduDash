//menuItemRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  getAllMenuItemsByVendor,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuItemController");

// ⚠️  This MUST come before /:id or Express will treat "vendor" as an id param
router.get("/vendor/:vendorId", getAllMenuItemsByVendor);

router.get("/",      getMenuItems);
router.get("/:id",   getMenuItemById);
router.post("/",     createMenuItem);
router.put("/:id",   updateMenuItem);
router.delete("/:id",deleteMenuItem);

module.exports = router;