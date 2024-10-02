const express = require('express');
const { resetPassword, verifyOtp, signup, login, getUser, logout } = require('./controllers/AuthController');
const { verifyToken } = require('./middlewares/varifyToken');
const { addToCart, getCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart, checkout } = require('./controllers/FeatureController');
const router = express.Router();

// AUTH ROUTES

router.post("/signup",signup)
router.post("/login",login)
router.get("/logout",logout)
router.put("/reset-password",resetPassword)
router.put("/verify-opt",verifyOtp)
router.get("/get-user",verifyToken,getUser)

// FEATURES ROUTES
router.post("/add-to-cart/:id", addToCart);
router.get("/get-cart/:id", getCart);
router.delete("/remove-from-cart/:id", removeFromCart);
router.put("/increment-from-cart/:id", incrementQuantity);
router.put("/decrement-from-cart/:id", decrementQuantity);
router.get("/checkout", verifyToken, checkout);
router.get("/clear-cart", verifyToken, clearCart);




module.exports = router;
