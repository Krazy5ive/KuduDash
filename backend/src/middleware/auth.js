const { auth } = require("express-oauth2-jwt-bearer");
const Student = require("../models/Student");

exports.verifyToken = auth({
  audience:      process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});

exports.attachStudent = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    console.log("auth0Id from token:", auth0Id);

    if (!auth0Id) return res.status(401).json({ message: "Unauthorized" });

    const student = await Student.findOne({ authProviderId: auth0Id });
    console.log("student found:", student);

    if (!student) return res.status(404).json({ message: "Student not found" });

    req.user = student;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};