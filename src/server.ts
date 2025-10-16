import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { sql } from "./db.ts";

async function listProducts() {
  return sql`SELECT id, sku, name, price_cents, stock_qty FROM products ORDER BY name`;
}

function validateProductPayload(body: any): { valid: boolean; message?: string } {
  const sku = String(body?.sku || "").trim();
  const name = String(body?.name || "").trim();
  const price_cents = Number(body?.price_cents);
  const stock_qty = Number(body?.stock_qty ?? 0);
  if (!sku || !name) return { valid: false, message: "Missing sku or name" };
  if (!Number.isInteger(price_cents) || price_cents < 0)
    return { valid: false, message: "Invalid price_cents" };
  if (!Number.isInteger(stock_qty) || stock_qty < 0)
    return { valid: false, message: "Invalid stock_qty" };
  return { valid: true };
}

async function upsertProduct(body: any) {
  const sku = String(body.sku).trim();
  const name = String(body.name).trim();
  const price_cents = Number(body.price_cents);
  const stock_qty = Number(body.stock_qty ?? 0);
  const rows = await sql`
    INSERT INTO products (sku, name, price_cents, stock_qty)
    VALUES (${sku}, ${name}, ${price_cents}, ${stock_qty})
    ON CONFLICT (sku) DO UPDATE SET
      name = EXCLUDED.name,
      price_cents = EXCLUDED.price_cents,
      stock_qty = EXCLUDED.stock_qty,
      updated_at = now()
    RETURNING id, sku, name, price_cents, stock_qty
  `;
  return rows[0];
}

async function listSales() {
  return sql`SELECT id, total_cents, created_at FROM sales ORDER BY id DESC LIMIT 50`;
}

type SaleItem = { productId: number; quantity: number };

async function createSale(items: SaleItem[]) {
  const result = await sql.begin(async (tx) => {
    let total_cents = 0;

    const ids = items.map((i) => i.productId);
    const products = ids.length
      ? await tx`SELECT id, price_cents, stock_qty FROM products WHERE id IN ${tx(ids)} FOR UPDATE`
      : [];
    const byId = new Map(products.map((p: any) => [p.id, p]));

    for (const { productId, quantity } of items) {
      const p = byId.get(productId);
      if (!p) throw new Error(`Product ${productId} not found`);
      if (p.stock_qty < quantity) throw new Error(`Insufficient stock for product ${productId}`);
      total_cents += p.price_cents * quantity;
    }

    const saleRows = await tx`
      INSERT INTO sales (total_cents)
      VALUES (${total_cents})
      RETURNING id, total_cents, created_at
    `;
    const sale = saleRows[0];

    for (const { productId, quantity } of items) {
      const p = byId.get(productId)!;
      await tx`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price_cents)
        VALUES (${sale.id}, ${productId}, ${quantity}, ${p.price_cents})
      `;
      await tx`UPDATE products SET stock_qty = stock_qty - ${quantity}, updated_at = now() WHERE id = ${productId}`;
    }

    return sale;
  });

  return result;
}

const port = Number(process.env.PORT || 3000);

const app = new Elysia()
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/",
    })
  )
  .get("/", () => new Response(Bun.file("public/index.html")))
  .get("/api/health", () => ({ ok: true }))
  .get("/api/products", async () => await listProducts())
  .post("/api/products", async ({ body, set }) => {
    const check = validateProductPayload(body);
    if (!check.valid) {
      set.status = 400;
      return { error: check.message || "Invalid product payload" };
    }
    const row = await upsertProduct(body);
    set.status = 201;
    return row;
  })
  .get("/api/sales", async () => await listSales())
  .post("/api/sales", async ({ body, set }) => {
    const items = Array.isArray((body as any)?.items) ? (body as any).items : [];
    if (items.length === 0) {
      set.status = 400;
      return { error: "No sale items provided" };
    }
    for (const item of items) {
      if (!Number.isInteger(item?.productId) || !Number.isInteger(item?.quantity) || item.quantity <= 0) {
        set.status = 400;
        return { error: "Invalid item format" };
      }
    }
    try {
      const sale = await createSale(items);
      set.status = 201;
      return sale;
    } catch (err: any) {
      set.status = 400;
      return { error: err?.message || "Failed to create sale" };
    }
  })
  .onError(({ error, set }) => {
    console.error(error);
    set.status = 500;
    return { error: "Internal Server Error" };
  })
  .listen(port);

console.log(`Bun POS (Elysia) listening on http://localhost:${port}`);
