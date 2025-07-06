require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const { clerkMiddleware } = require('@clerk/express');
const axios = require('axios');
const crypto = require('crypto');
global.crypto = crypto;

const app = express();
const PORT = 3010;

// Clerk Middleware for session handling
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

// Logging
app.use(morgan('combined'));



// ---------------------- AUTHENTICATION MIDDLEWARE ----------------------

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        name: "AuthenticationError",
        message: "Unauthorized",
        explanation: "Token is missing",
        statusCode: 401
      });
    }

    const response = await axios.get("http://localhost:3010/authService/api/v1/users/status/isAuthenticated", {
      headers: {
        Authorization: token
      }
    });

    if (response.data && response.data.success === true) {
      req.user = response.data.user;
      return next();
    } else {
      return res.status(401).json({
        success: false,
        name: "AuthenticationError",
        message: "Unauthorized",
        explanation: "User is not signed in.",
        statusCode: 401
      });
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      name: "AuthenticationError",
      message: "Unauthorized",
      explanation: err.response?.data?.message || "Auth check failed",
      statusCode: 401
    });
  }
};

// ---------------------- ROUTES ----------------------

// Dummy test route to validate auth middleware
app.get('/protected/test', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated!",
    user: req.user || "No user attached"
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    data: "You are hitting the API Gateway.",
    auth: req.auth,
    user: req.auth?.userId || null
  });
});

// ---------------------- PROXIES ----------------------

// Proxy for authService
app.use("/authService", createProxyMiddleware({
  target: "http://3.110.117.104:3001/authService",
  changeOrigin: true
}));

//DEMO for protected routes

// Protect userService routes with middleware
// app.use("/userService", isAuthenticated);
// app.use("/userService", createProxyMiddleware({
//   target: "http://3.110.117.104:3002/userService",
//   changeOrigin: true
// }));

// ---------------------- START SERVER ----------------------

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}...`);
});
