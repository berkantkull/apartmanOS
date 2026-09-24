import { env } from "cloudflare:workers";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Row = Record<string, unknown>;

let client: NeonQueryFunction<false, false> | undefined;

function sqlClient() {
  const connectionString = env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
  client ??= neon(connectionString);
  return client;
}

function postgresSql(sql: string) {
  let index = 0;
  return sql.replaceAll("?", () => `$${++index}`);
}

class PreparedQuery {
  private boundParams: Array<string | number | null> = [];

  constructor(readonly statement: string) {}

  get params() {
    return this.boundParams;
  }

  bind(...params: Array<string | number | null>) {
    this.boundParams = params;
    return this;
  }

  query() {
    return sqlClient().query(postgresSql(this.statement), this.boundParams);
  }

  async first<T = Row>(): Promise<T | null> {
    const rows = await this.query();
    return (rows[0] as T | undefined) ?? null;
  }

  async all<T = Row>(): Promise<{ results: T[] }> {
    const rows = await this.query();
    return { results: rows as T[] };
  }

  async run() {
    await this.query();
    return { success: true };
  }
}

export function getDatabase() {
  return {
    prepare(statement: string) {
      return new PreparedQuery(statement);
    },
    async batch(queries: PreparedQuery[]) {
      return sqlClient().transaction((transaction) =>
        queries.map((query) => transaction.query(postgresSql(query.statement), query.params)),
      );
    },
  };
}
