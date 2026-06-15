-- =====================================================
-- Soccer Fan Zone Database Schema
-- Production Ready
-- Fly.io PostgreSQL
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  auth_provider VARCHAR(50) DEFAULT 'email',

  tier VARCHAR(50) NOT NULL DEFAULT 'free',

  paddle_customer_id VARCHAR(255),
  paddle_subscription_id VARCHAR(255),

  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_tier
ON users(tier);

CREATE INDEX IF NOT EXISTS idx_users_paddle_customer
ON users(paddle_customer_id);

CREATE INDEX IF NOT EXISTS idx_users_paddle_subscription
ON users(paddle_subscription_id);

-- =====================================================
-- PAYMENT EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  paddle_event_id VARCHAR(255),

  paddle_customer_id VARCHAR(255),

  paddle_subscription_id VARCHAR(255),

  event_type VARCHAR(100),

  amount NUMERIC(10,2),

  currency VARCHAR(10),

  raw_payload JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_user
ON payment_events(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_events_event
ON payment_events(paddle_event_id);

-- =====================================================
-- WEBHOOK IDEMPOTENCY
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  paddle_event_id VARCHAR(255) UNIQUE NOT NULL,

  event_type VARCHAR(100),

  processed BOOLEAN DEFAULT FALSE,

  processed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event
ON webhook_events(paddle_event_id);

-- =====================================================
-- USER LOYALTY
-- =====================================================

CREATE TABLE IF NOT EXISTS user_loyalty (
  id SERIAL PRIMARY KEY,

  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  points INTEGER DEFAULT 0,

  tier VARCHAR(50) DEFAULT 'bronze',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);