require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth0 JWT check
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});

// Routes
const authRoutes = require("./src/routes/auth.routes");
app.use("/api/auth", authRoutes);

module.exports = app;