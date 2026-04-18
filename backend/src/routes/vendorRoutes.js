const express = require("express");
const router  = express.Router();

const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  updateVendorProfile,
  uploadLogoMiddleware,
} = require("../controllers/vendorController");

router.get("/",     getAllVendors);
router.get("/:id",  getVendorById);
router.post("/",    createVendor);
router.put("/:id",  updateVendor);

// Profile update (vendor self-service) — handles multipart/form-data + optional logo upload
router.patch("/:id/profile", uploadLogoMiddleware, updateVendorProfile);

module.exports = router;