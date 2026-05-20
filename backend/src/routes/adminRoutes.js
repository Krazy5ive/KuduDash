// routes/adminRoutes.js
const express = require("express");
const router  = express.Router();

const { getAllAdmins, getAdminById, createAdmin, updateAdmin } =
  require("../controllers/adminController");

const { getAdminAnalytics } =
  require("../controllers/analyticsController");

// Analytics — must come before /:id to avoid route clash
router.get("/analytics", getAdminAnalytics);

router.get("/",    getAllAdmins);
router.get("/:id", getAdminById);
router.post("/",   createAdmin);
router.put("/:id", updateAdmin);

module.exports = router;