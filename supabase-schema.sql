-- Run this entire file in:
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- ── Plaid items (one row per connected bank account) ────────────────────────
CREATE TABLE IF NOT EXISTS plaid_items (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL,
  access_token      TEXT        NOT NULL,   -- never exposed to browser
  item_id           TEXT        UNIQUE NOT NULL,
  institution_name  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS plaid_items_user_id_idx ON plaid_items (user_id);

-- ── Sync cursors (tracks how far we've synced each account) ─────────────────
CREATE TABLE IF NOT EXISTS plaid_sync_cursors (
  plaid_item_id   UUID        PRIMARY KEY REFERENCES plaid_items (id) ON DELETE CASCADE,
  cursor          TEXT,
  last_synced_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id             TEXT        PRIMARY KEY,   -- Plaid transaction_id
  user_id        UUID        NOT NULL,
  plaid_item_id  UUID        REFERENCES plaid_items (id) ON DELETE CASCADE,
  amount         DECIMAL(10,2) NOT NULL,    -- positive = money out (Plaid convention)
  date           DATE        NOT NULL,
  merchant       TEXT,
  category       TEXT,                       -- mapped Pocket category name
  raw_category   TEXT,                       -- Plaid personal_finance_category.primary
  pending        BOOLEAN     DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx    ON transactions (date);

-- ── Row-Level Security ────────────────────────────────────────────────────────
-- Service role key (used by API routes) bypasses RLS.
-- These policies protect direct client access.

ALTER TABLE plaid_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_sync_cursors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own plaid items"   ON plaid_items
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own transactions"  ON transactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "own sync cursors"  ON plaid_sync_cursors
  FOR ALL USING (
    plaid_item_id IN (SELECT id FROM plaid_items WHERE user_id = auth.uid())
  );
