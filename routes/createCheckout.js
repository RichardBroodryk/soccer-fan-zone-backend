// =====================================================
// Create Checkout Route — Soccer Fan Zone
// =====================================================

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createCheckout } = require("./paddleService");

// =====================================================
// POST /api/payments/create-checkout
// =====================================================

router.post("/create-checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    console.log("📦 Create checkout request received");
    console.log(`   User ID: ${userId}`);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user from database
    const userRes = await pool.query(
      `
      SELECT id, email, tier
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRes.rows[0];
    
    console.log(`   User email: ${user.email}`);
    console.log(`   Current tier: ${user.tier}`);

    // Create Paddle checkout
    const result = await createCheckout({
      email: user.email,
      userId: user.id,
    });

    console.log("✅ Returning checkout URL to frontend");
    console.log(`   URL: ${result.checkoutUrl}`);

    // Return the checkout URL
    return res.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      transactionId: result.transactionId,
    });

  } catch (err) {
    console.error("❌ Create checkout route error:", err.message);
    
    return res.status(500).json({
      error: err.message || "Failed to create checkout",
    });
  }
});
// TEST ENDPOINT - Remove after debugging
router.post("/test-paddle-direct", async (req, res) => {
  try {
    const { email, priceId } = req.body;
    
    const axios = require("axios");
    const PADDLE_API_KEY = (process.env.PADDLE_API_KEY || "").trim();
    const PRICE_ID = priceId || (process.env.PADDLE_PRICE_PREMIUM || "").trim();
    
    console.log("🧪 TEST: Calling Paddle directly");
    console.log("   API Key (first 20):", PADDLE_API_KEY.substring(0, 20) + "...");
    console.log("   Price ID:", PRICE_ID);
    
    const payload = {
      items: [{ price_id: PRICE_ID, quantity: 1 }],
      customer: { email: email || "test@example.com" },
      collection_mode: "automatic",
      checkout: { url: "https://soccer-fan-zone.vercel.app/checkout" }
    };
    
    const response = await axios.post(
      "https://api.paddle.com/transactions",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${PADDLE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log("✅ TEST SUCCESS:", response.data?.data?.id);
    res.json({ 
      success: true, 
      transactionId: response.data?.data?.id,
      checkoutUrl: response.data?.data?.checkout?.url 
    });
    
  } catch (err) {
    console.error("❌ TEST FAILED:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
      res.status(err.response.status).json({ 
        error: err.response.data,
        status: err.response.status 
      });
    } else {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
});
module.exports = router;