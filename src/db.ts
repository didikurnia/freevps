import postgres from "postgres";

function buildDatabaseUrlFromPgEnv(): string | undefined {
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  if (host && database && user) {
    const _port = port || '5432';
    const auth = password ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}` : encodeURIComponent(user);
    return `postgres://${auth}@${host}:${_port}/${database}`;
  }
  return undefined;
}

const DEFAULT_URL = "postgres://postgres:postgres@localhost:5432/posdb";
const connectionString = process.env.DATABASE_URL || buildDatabaseUrlFromPgEnv() || DEFAULT_URL;

export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
  prepare: true,
});

export async function closeDb(): Promise<void> {
  try {
    await sql.end({ timeout: 5 });
  } catch (_) {
    // ignore
  }
}
