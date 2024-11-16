import * as BrowserRunner from "@effect/platform-browser/BrowserWorkerRunner";
import * as Runner from "@effect/platform/WorkerRunner";
import * as SqliteKysely from "@effect/sql-kysely/Sqlite";
import * as Sqlite from "@effect/sql-sqlite-wasm";
import { Console, Context, Effect, Layer } from "effect";
import type { Generated } from "kysely";
import { GetUserById, User } from "./schema";


interface Database {
  users: Omit<typeof User.Type, "id"> & { id: Generated<number> };
}

class SqliteDB extends Context.Tag("SqliteDB")<SqliteDB, SqliteKysely.EffectKysely<Database>>() {}

const SqliteLive = Sqlite.SqliteClient.layer({ dbName: "mydb", mode: "opfs", openMode: "c" });

const KyselyLive = Layer.effect(SqliteDB, SqliteKysely.make<Database>()).pipe(Layer.provide(SqliteLive));

interface Name {
  readonly _: unique symbol;
}

export const Name = Context.GenericTag<Name, string>("Name");

const WorkerLive = Runner.layerSerialized(GetUserById, {
  GetUserById: (req) => Effect.gen(function* () {
    yield* Effect.log("Loading and initializing SQLite3 module...");
    const db = yield* SqliteDB;
    yield* db.schema
             .createTable("users")
             .addColumn("id", "integer", (c) => c.primaryKey().autoIncrement())
             .addColumn("name", "text", (c) => c.notNull()).pipe(Effect.exit);
    const result = yield* db.withTransaction(
      Effect.gen(function* () {
        const inserted = yield* db.insertInto("users").values({ name: `Alice-${req.id}` }).returningAll();
        yield* Console.table(inserted);
        return inserted[0];
      }),
    ).pipe(Effect.exit);
    const user = yield* result;
    // return new User({id: req.id, name: "John"});
    return yield* result;
  }).pipe(Effect.catchAll(x => Effect.succeed(null))),
}).pipe(Layer.provide(KyselyLive), Layer.provide(BrowserRunner.layer));

Effect.runFork(Layer.launch(WorkerLive));