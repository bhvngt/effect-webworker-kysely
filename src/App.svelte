<script lang="ts">
  import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
  import * as EffectWorker from "@effect/platform/Worker";
  import { Effect } from "effect";
  import { GetUserById, User } from "./schema";

  let user: User | null;
  const program = Effect.gen(function* () {
    const pool = yield* EffectWorker.makePoolSerialized({ size: 1 });
    user = yield* pool.executeEffect(new GetUserById({ id: Math.round(Math.random() * 100) }));
  }).pipe(
    Effect.scoped,
    Effect.provide(
      BrowserWorker.layer(() => new Worker(new URL("./serializedWorker.ts", import.meta.url), { type: "module" })),
    ),
  );

  async function addRecord() {
    await Effect.runPromise(program);
  }
</script>

<main>
  <div class="userInfo">
    <div>User Id: {user?.id}</div>
    <div>User Name: {user?.name}</div>
  </div>

  <div class="card">
    <button onclick={addRecord}>Add Record</button>
  </div>
</main>

<style>
    .userInfo {
        display: grid;
        text-align: left;
    }
</style>
