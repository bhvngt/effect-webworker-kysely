import * as BrowserRunner from "@effect/platform-browser/BrowserWorkerRunner";
import * as SqliteKysely from "@effect/sql-kysely/Sqlite";
import * as Sqlite from "@effect/sql-sqlite-node"
import { Context, Effect, Layer } from "effect";
import type { Generated } from "kysely";

class SqliteDB extends Context.Tag("SqliteDB")<SqliteDB, SqliteKysely.EffectKysely<Database>>() {}

const SqliteLive = Sqlite.SqliteClient.layer({ filename: "./mydb.sqlite3" });

const KyselyLive = Layer.effect(SqliteDB, SqliteKysely.make<Database>()).pipe(Layer.provide(SqliteLive));

export interface User1 {
  id: Generated<number>;
  name: string;
}

interface Database {
  users: User1;
}


Effect.gen(function* () {
  const db = yield* SqliteDB;
  yield* db.schema
           .dropTable("users").pipe(Effect.exit);
  yield* db.schema
           .createTable("users")
           .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement())
           .addColumn("name", "text", (c) => c.notNull()).pipe(Effect.exit);
  const result = yield* db.withTransaction(
    Effect.gen(function* () {
      const inserted = yield* db.insertInto("users").values({ name: `Alice` }).returningAll();

      // console.log(inserted instanceof globalThis.Proxy);
      // yield* Console.log(inserted[0])
      // console.log(`inserted`, JSON.stringify(inserted[0]));
      // console.log(`inserted[0]`, Schema.decodeSync(User)(inserted[0]));
      return inserted[0];
      // const selected = yield* db.selectFrom("users").selectAll();
      // yield* Console.table(selected);
      // const updated = yield* db.updateTable("users").set({ name: "Bob" }).returningAll();
      // yield* Console.table(updated);
      // return yield* Effect.fail(new globalThis.Error("rollback"));
    }),
  ).pipe(Effect.exit)
  console.log(`result`, yield* result);
}).pipe(Effect.provide(KyselyLive), Effect.runPromise);

