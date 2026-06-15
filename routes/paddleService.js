// =====================================================
// Paddle Service — Soccer Fan Zone
// =====================================================

const axios = require("axios");

const PADDLE_API_KEY = (process.env.PADDLE_API_KEY || "").trim();
const PRICE_ID = (process.env.PADDLE_PRICE_PREMIUM || "").trim();
const FRONTEND_URL = (process.env.FRONTEND_URL || "https://soccer-fan-zone.vercel.app").trim();

if (!PADDLE_API_KEY) throw new Error("Missing PADDLE_API_KEY");
if (!PRICE_ID) throw new Error("Missing PADDLE_PRICE_PREMIUM");

console.log("✅ Paddle Service Ready");
console.log(`   Price ID: ${PRICE_ID}`);
console.log(`   Frontend: ${FRONTEND_URL}`);

async function createCheckout({ email, userId }) {
  console.log("⚽ Creating checkout for:", { email, userId });

  const payload = {
    items: [{ price_id: PRICE_ID, quantity: 1 }],
    customer: { email: email },
    collection_mode: "automatic",
    checkout: {
      url: `${FRONTEND_URL}/checkout`
    },
    custom_data: {
      user_id: String(userId),
      source: "soccer_fan_zone"
    }
  };

  console.log("📤 Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await axios({
      method: "POST",
      url: "https://api.paddle.com/transactions",
      headers: {
        "Authorization": `Bearer ${PADDLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      data: payload
    });

    console.log("📦 Paddle response status:", response.status);
    
    const transaction = response.data?.data;
    
    if (!transaction) {
      console.error("❌ No transaction in response:", response.data);
      throw new Error("No transaction returned");
    }

    const checkoutUrl = transaction.checkout?.url;
    
    if (!checkoutUrl) {
      console.error("❌ No checkout URL in transaction:", transaction);
      throw new Error("No checkout URL returned");
    }

    console.log("✅ Checkout URL:", checkoutUrl);
    
    return {
      checkoutUrl: checkoutUrl,
      transactionId: transaction.id
    };

  } catch (err) {
    console.error("❌ Paddle API error:");
    
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else if (err.request) {
      console.error("No response received");
    } else {
      console.error("Error:", err.message);
    }
    
    throw new Error(`Paddle transaction failed: ${err.message}`);
  }
}

module.exports = { createCheckout };