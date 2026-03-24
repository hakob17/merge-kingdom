import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

const pool = DATABASE_URL ? new pg.Pool({ connectionString: DATABASE_URL }) : null;
export const db = pool ? drizzle(pool, { schema }) : null;
export type Database = NonNullable<typeof db>;
export { schema };
