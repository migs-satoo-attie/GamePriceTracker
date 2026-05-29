-- Migration 001: schema inicial de persistência de preços.
-- Preços são armazenados em CENTAVOS (inteiros) para casar com o domínio (Money).

CREATE TABLE IF NOT EXISTS games (
  id                   text PRIMARY KEY,            -- Steam AppID (ou ITAD id)
  name                 text NOT NULL,
  cover_image          text,
  store                text NOT NULL DEFAULT 'Steam',
  original_price_cents integer NOT NULL DEFAULT 0,
  current_price_cents  integer NOT NULL DEFAULT 0,
  historical_low_cents integer NOT NULL DEFAULT 0,
  discount_percent     integer NOT NULL DEFAULT 0,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_snapshots (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id     text NOT NULL,
  price_cents integer NOT NULL,
  recorded_at timestamptz NOT NULL,
  source      text,
  CONSTRAINT price_snapshots_unique UNIQUE (game_id, recorded_at)
);

-- Consulta dominante: histórico de um jogo em ordem cronológica.
CREATE INDEX IF NOT EXISTS idx_price_snapshots_game_time
  ON price_snapshots (game_id, recorded_at);
