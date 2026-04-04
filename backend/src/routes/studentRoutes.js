const express = require("express");
const router = express.Router();
const { getStudentProfile, createStudent, updateStudent } = require("../controllers/studentController");

router.get("/:id", getStudentProfile);
router.post("/", createStudent);
router.put("/:id", updateStudent);

module.exports = router;