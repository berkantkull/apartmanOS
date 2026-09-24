import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL gerekli.");

const sql = neon(connectionString);
const source = await readFile(new URL("../db/neon-schema.sql", import.meta.url), "utf8");
const statements = source.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);

await sql.transaction((transaction) => statements.map((statement) => transaction.query(statement)));
console.log(`Neon şeması hazır: ${statements.length} işlem uygulandı.`);
