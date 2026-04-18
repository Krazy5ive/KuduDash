const express = require("express");
const router = express.Router();
const {
  getAllAdmins,
  getAdminById,
  getAdminByEmail,
  createAdmin,
  updateAdmin,
} = require("../controllers/adminController");

router.get("/", getAllAdmins);

// IMPORTANT: specific named routes must come BEFORE the /:id wildcard,
// otherwise Express matches "by-email" as the :id parameter.
router.get("/by-email/:email", getAdminByEmail);

router.get("/:id", getAdminById);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);

module.exports = router;