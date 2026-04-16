// vendorRoutes.js
const express = require("express");
const router = express.Router();
const { getAllVendors, getVendorById, createVendor, updateVendor } = require("../controllers/vendorController");

router.get("/", getAllVendors);
router.get("/:id", getVendorById);
router.post("/", createVendor);
router.put("/:id", updateVendor);

module.exports = router;