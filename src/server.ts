import { sql } from "./db.ts";

function json(data: unknown, init: ResponseInit = {}): Response {
  const body = JSON.stringify(data);
  return new Response(body, {
    headers: { "content-type": "application/json", ...(init.headers || {}) },
    ...init,
  });
}

async function serveStatic(pathname: string): Promise<Response | undefined> {
  if (pathname === "/") {
    const file = Bun.file("public/index.html");
    if (await file.exists()) return new Response(file);
  }
  return undefined;
}

async function listProducts() {
  return sql`SELECT id, sku, name, price_cents, stock_qty FROM products ORDER BY name`;
}

async function createProduct(body: any) {
  const sku = String(body?.sku || '').trim();
  const name = String(body?.name || '').trim();
  const price_cents = Number(body?.price_cents);
  const stock_qty = Number(body?.stock_qty ?? 0);
  if (!sku || !name || !Number.isInteger(price_cents) || price_cents < 0 || !Number.isInteger(stock_qty) || stock_qty < 0) {
    return json({ error: "Invalid product payload" }, { status: 400 });
  }
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
  return json(rows[0], { status: 201 });
}

async function listSales() {
  return sql`SELECT id, total_cents, created_at FROM sales ORDER BY id DESC LIMIT 50`;
}

async function createSale(body: any) {
  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) return json({ error: "No sale items provided" }, { status: 400 });

  // Validate items
  for (const item of items) {
    if (!Number.isInteger(item?.productId) || !Number.isInteger(item?.quantity) || item.quantity <= 0) {
      return json({ error: "Invalid item format" }, { status: 400 });
    }
  }

  const result = await sql.begin(async (tx) => {
    let total_cents = 0;

    // Fetch product prices and stock, lock rows for update
    const ids = items.map((i: any) => i.productId);
    const products = await tx`SELECT id, price_cents, stock_qty FROM products WHERE id IN ${tx(ids)} FOR UPDATE`;
    const byId = new Map(products.map((p: any) => [p.id, p]));

    for (const { productId, quantity } of items) {
      const p = byId.get(productId);
      if (!p) throw new Error(`Product ${productId} not found`);
      if (p.stock_qty < quantity) throw new Error(`Insufficient stock for product ${productId}`);
      total_cents += p.price_cents * quantity;
    }

    const saleRows = await tx`INSERT INTO sales (total_cents) VALUES (${total_cents}) RETURNING id, total_cents, created_at`;
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

  return json(result, { status: 201 });
}

const port = Number(process.env.PORT || 3000);

const server = Bun.serve({
  port,
  fetch: async (req: Request) => {
    const url = new URL(req.url);

    try {
      const staticRes = await serveStatic(url.pathname);
      if (staticRes) return staticRes;

      if (url.pathname === "/api/health") {
        if (req.method === "GET") return json({ ok: true });
      }

      if (url.pathname === "/api/products") {
        if (req.method === "GET") return json(await listProducts());
        if (req.method === "POST") {
          const body = await req.json().catch(() => ({}));
          return createProduct(body);
        }
      }

      if (url.pathname === "/api/sales") {
        if (req.method === "GET") return json(await listSales());
        if (req.method === "POST") {
          const body = await req.json().catch(() => ({}));
          try {
            return await createSale(body);
          } catch (err: any) {
            return json({ error: err?.message || "Failed to create sale" }, { status: 400 });
          }
        }
      }

      return json({ error: "Not Found" }, { status: 404 });
    } catch (err: any) {
      console.error(err);
      return json({ error: "Internal Server Error" }, { status: 500 });
    }
  },
});

console.log(`Bun POS listening on http://localhost:${port}`);
