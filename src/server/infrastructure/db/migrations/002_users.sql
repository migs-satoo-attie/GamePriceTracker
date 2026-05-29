-- Migration 002: usuários autenticados via Steam OpenID.

CREATE TABLE IF NOT EXISTS users (
  steam_id      text PRIMARY KEY,            -- SteamID64
  username      text NOT NULL,
  avatar        text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now()
);
