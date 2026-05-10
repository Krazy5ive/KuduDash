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
  toggleSoldOut,
} = require("../controllers/menuItemController");
const { verifyToken, attachVendor } = require("../middleware/auth");
const { requireNotSuspended }       = require("../controllers/vendorController");

// ⚠️  Specific routes MUST come before /:id param routes

// Public
router.get("/vendor/:vendorId", getAllMenuItemsByVendor);
router.get("/",    getMenuItems);
router.get("/:id", getMenuItemById);

// Vendor-protected writes
router.post(   "/",    verifyToken, attachVendor, requireNotSuspended, createMenuItem);
router.put(    "/:id", verifyToken, attachVendor, requireNotSuspended, updateMenuItem);
router.delete( "/:id", verifyToken, attachVendor, requireNotSuspended, deleteMenuItem);

// Toggle sold-out:
// requireNotSuspended is NOT used here because it resolves the vendor using
// req.params.id — which on this route is the MENU ITEM id, not the vendor id.
// The suspension check is done inside toggleSoldOut via req.vendor instead.
router.patch("/:id/sold-out", verifyToken, attachVendor, toggleSoldOut);

module.exports = router;