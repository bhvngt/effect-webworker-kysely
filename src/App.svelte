<script lang="ts">
  import viteLogo from "/vite.svg";
  import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
  import * as EffectWorker from "@effect/platform/Worker";
  import { Effect } from "effect";
  import svelteLogo from "./assets/svelte.svg";
  import Counter from "./lib/Counter.svelte";
  import { GetUserById, User } from "./schema";

  let user: User|null;
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
  <div>
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>
  <div class="userInfo">
  <div>User Id: {user?.id}</div>
  <div>User Name: {user?.name}</div>
  </div>

  <div class="card">
    <Counter />
    <button onclick={addRecord}>Add Record</button>
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the
    official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

<style>
    .userInfo {
        display: grid;
        text-align: left;
    }
    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }

    .read-the-docs {
        color: #888;
    }
</style>
