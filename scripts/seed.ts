import { sql, closeDb } from "../src/db.ts";

async function seed() {
  console.log("Seeding demo data...");

  const products = [
    { sku: "SKU-001", name: "Coffee", price_cents: 300, stock_qty: 100 },
    { sku: "SKU-002", name: "Tea", price_cents: 250, stock_qty: 80 },
    { sku: "SKU-003", name: "Sandwich", price_cents: 650, stock_qty: 40 },
    { sku: "SKU-004", name: "Cake Slice", price_cents: 450, stock_qty: 50 }
  ];

  for (const p of products) {
    await sql`
      INSERT INTO products (sku, name, price_cents, stock_qty)
      VALUES (${p.sku}, ${p.name}, ${p.price_cents}, ${p.stock_qty})
      ON CONFLICT (sku) DO UPDATE SET
        name = EXCLUDED.name,
        price_cents = EXCLUDED.price_cents,
        stock_qty = EXCLUDED.stock_qty,
        updated_at = now()
    `;
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exitCode = 1;
}).finally(async () => {
  await closeDb();
});
