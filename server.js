require("dotenv").config();

/* ======================================================
   IMPORTS
====================================================== */

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("./db");

/* ======================================================
   ROUTES
====================================================== */

const footballRoutes = require("./routes/football");

const subscriptionStatus = require(
  "./routes/subscriptionStatus"
);

const subscriptionRoutes = require(
  "./routes/subscription"
);

const newsRoutes = require(
  "./routes/news"
);

const loyaltyRoutes = require(
  "./routes/loyalty"
);

const createCheckout = require(
  "./routes/createCheckout"
);

/* ======================================================
   INIT
====================================================== */

const app = express();

console.log(
  "⚽ Soccer Fan Zone Backend Starting..."
);

/* ======================================================
   ENV
====================================================== */

const JWT_SECRET =
  (
    process.env.JWT_SECRET || ""
  ).trim();

if (!JWT_SECRET) {
  console.error(
    "❌ JWT_SECRET missing"
  );

  process.exit(1);
}

/* ======================================================
   CORS
====================================================== */

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://soccer-fan-zone.vercel.app"
    ],
    credentials: true,
  })
);

/* ======================================================
   OPTIONS
====================================================== */

app.use(
  (req, res, next) => {
    if (
      req.method ===
      "OPTIONS"
    ) {
      res.setHeader(
        "Access-Control-Allow-Origin",
        req.headers.origin
      );

      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
      );

      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );

      return res.sendStatus(200);
    }

    next();
  }
);

/* ======================================================
   BODY PARSER
====================================================== */

app.use(express.json());

/* ======================================================
   AUTH MIDDLEWARE
====================================================== */

function authMiddleware(
  req,
  res,
  next
) {
  try {
    const header =
      req.headers.authorization;

    if (
      !header ||
      !header
        .toLowerCase()
        .startsWith(
          "bearer "
        )
    ) {
      return res
        .status(401)
        .json({
          error:
            "No token",
        });
    }

    const token =
      header
        .slice(7)
        .trim();

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    req.userId =
      decoded.userId;

    req.userEmail =
      decoded.email;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({
        error:
          "Invalid token",
      });
  }
}

/* ======================================================
   AUTH
====================================================== */

app.post(
  "/api/register",
  async (req, res) => {
    const {
      email,
      password,
    } = req.body || {};

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          error:
            "Email and password required",
        });
    }

    try {
      const normalizedEmail =
        email.toLowerCase();

      const hashed =
        await bcrypt.hash(
          password,
          10
        );

      const result =
        await pool.query(
          `
        INSERT INTO users (
          email,
          password_hash,
          tier,
          is_active,
          auth_provider
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, tier
      `,
          [
            normalizedEmail,
            hashed,
            "freemium",
            true,
            "email",
          ]
        );

      const newUser =
        result.rows[0];

      const token =
        jwt.sign(
          {
            userId: String(
              newUser.id
            ),

            email:
              newUser.email,
          },

          JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );

      res.json({
        token,

        userId:
          newUser.id,

        email:
          newUser.email,

        tier:
          newUser.tier,
      });
    } catch (err) {
      console.error(
        "❌ REGISTER ERROR:",
        err.message
      );

      if (
        err.code ===
        "23505"
      ) {
        return res
          .status(400)
          .json({
            error:
              "User already exists",
          });
      }

      res
        .status(500)
        .json({
          error:
            "Registration failed",
        });
    }
  }
);

/* ======================================================
   LOGIN
====================================================== */

app.post(
  "/api/login",
  async (req, res) => {
    const {
      email,
      password,
    } = req.body || {};

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          error:
            "Email and password required",
        });
    }

    try {
      const normalizedEmail =
        email.toLowerCase();

      const result =
        await pool.query(
          `
        SELECT
          id,
          email,
          password_hash,
          tier
        FROM users
        WHERE email = $1
      `,
          [
            normalizedEmail,
          ]
        );

      if (
        result.rows
          .length === 0
      ) {
        return res
          .status(401)
          .json({
            error:
              "Invalid credentials",
          });
      }

      const user =
        result.rows[0];

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password_hash
        );

      if (
        !passwordMatch
      ) {
        return res
          .status(401)
          .json({
            error:
              "Invalid credentials",
          });
      }

      const token =
        jwt.sign(
          {
            userId: String(
              user.id
            ),

            email:
              user.email,
          },

          JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );

      res.json({
        token,

        userId:
          user.id,

        email:
          user.email,

        tier:
          user.tier,
      });
    } catch (err) {
      console.error(
        "❌ LOGIN ERROR:",
        err.message
      );

      res
        .status(500)
        .json({
          error:
            "Login failed",
        });
    }
  }
);

/* ======================================================
   API ROUTES
====================================================== */

app.use(
  "/api/football",
  footballRoutes
);

app.use(
  "/api/subscription",
  authMiddleware,
  subscriptionStatus
);

app.use(
  "/api",
  subscriptionRoutes
);

app.use(
  "/api/payments",
  createCheckout
);

app.use(
  "/api/news",
  newsRoutes
);

app.use(
  "/api/loyalty",
  loyaltyRoutes
);

/* ======================================================
   HEALTH
====================================================== */

app.get(
  "/health",
  (req, res) => {
    res.json({
      status: "ok",

      time:
        new Date().toISOString(),

      message:
        "Soccer Fan Zone backend running",
    });
  }
);

app.get(
  "/",
  (req, res) => {
    res.send(
      "⚽ Soccer Fan Zone backend running"
    );
  }
);

/* ======================================================
   START
====================================================== */

const PORT =
  process.env.PORT || 4000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `⚽ Server running on port ${PORT}`
    );
  }
);