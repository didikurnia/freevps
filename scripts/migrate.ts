import { sql, closeDb } from "../src/db.ts";

async function migrate() {
  console.log("Running migrations...");

  await sql`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS sale_items (
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    PRIMARY KEY (sale_id, product_id)
  )`;

  await sql`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id)`;

  console.log("Migrations complete.");
}

migrate().catch((err) => {
  console.error(err);
  process.exitCode = 1;
}).finally(async () => {
  await closeDb();
});
