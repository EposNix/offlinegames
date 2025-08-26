You are generating a complete, runnable web project.
**Goal:** Build a simple HTML/JS “mini-arcade” launcher that **auto-discovers games** by scanning `src/games/*/manifest.json` at build time. Show an auto-generated menu grid with tiles; clicking a tile loads the game in either **ES module** or **iframe** mode according to its manifest. This is for **PC testing only** (no mobile polish yet).

### Requirements (do all of these)

1. **Tooling & structure**

   * Use **Vite** with vanilla JS (no React/TS needed).
   * Project layout:

     ```
     package.json
     vite.config.js
     index.html
     src/
       main.js
       registry.js
       router.js
       services.js
       ui.css
       games/
         sample-2048/
           manifest.json
           main.js
           thumb.webp      (placeholder via data URL if needed)
         sample-iframe/
           manifest.json
           index.html
           thumb.webp
     ```
   * The **auto-discovery** happens via `import.meta.glob`:

     * Eager import all `manifest.json` files.
     * Lazy import each game’s `main.js` for module games.
     * Also support iframe games by resolving their `index.html` URLs at build time.

2. **Manifest schema**

   * Each game folder contains `manifest.json` with fields:

     ```json
     {
       "id": "2048",
       "name": "2048",
       "version": "1.0.0",
       "entry": "main.js",
       "sandbox": "module",         // "module" or "iframe"
       "orientation": "portrait",   // not enforced yet
       "thumbnail": "thumb.webp",
       "tags": ["puzzle","numbers"],
       "minAppVersion": "1.0.0",
       "capabilities": { "haptics": true, "audio": true, "save": true }
     }
     ```
   * Provide a **lightweight runtime validator** that logs a clear warning if required fields are missing or types are wrong (do not crash the app).

3. **Registry builder (`src/registry.js`)**

   * Build a `registry` array from the globbed manifests.
   * For each entry:

     * `id`, `name`, `version`, `sandbox`, `entry`, `dir` (like `./games/sample-2048`)
     * `thumbnailUrl` resolved to an actual URL using a globbed asset map (images via `{ as: 'url', eager: true }`).
     * `load()`:

       * If `sandbox:"module"` → returns a promise that dynamically imports `main.js`.
       * If `sandbox:"iframe"` → returns `{ iframeUrl }` resolved via `import.meta.glob('./games/*/index.html', { as: 'url', eager: true })`.
   * Sort games by `name` ascending for menu display.

4. **Launcher UI & router**

   * Use **hash routing** only: `#/menu` (default) and `#/play/:id`.
   * `src/router.js` listens to `hashchange` and routes between views.
   * `index.html` contains:

     * `#app` root
     * Basic styles via `src/ui.css`
   * **Menu view**:

     * Renders a responsive grid (CSS only) of game tiles (name + thumbnail).
     * A simple “search” input filters by name or tags (client-side).
     * A “Recently played” strip appears if any exist (use `localStorage`).
   * **Play view**:

     * Shows “Back to menu” button.
     * **If sandbox=module**:

       * Call `const mod = await game.load();`
       * Expect `mod.createGame(mountEl, services)` returning `{ start(), pause(), resume(), stop() }`.
       * Call `start()` on load; on leaving route call `stop()` and cleanup DOM.
     * **If sandbox=iframe**:

       * Create `<iframe src=iframeUrl sandbox="allow-scripts allow-pointer-lock">` (no network permissions).
       * Provide a simple postMessage handshake just for `pause/resume` (optional but scaffold it).
   * On entering a game, store `lastPlayedAt` in localStorage keyed by game id.

5. **Services stub (`src/services.js`)**

   * Provide minimal, no-op friendly services object passed to module games:

     ```js
     export const services = {
       storage: {
         get(key, def){ ... }, // localStorage namespace "arcade:"
         set(key, val){ ... }
       },
       audio: { play(name){ /* no-op with console.log for now */ } },
       haptics: { light(){}, medium(){}, heavy(){} },
       lifecycle: {
         onPause(cb){ /* register */ }, onResume(cb){ /* register */ }
       }
     };
     ```
   * Wire `visibilitychange` to call pause/resume listeners.

6. **Sample games**

   * `sample-2048` (**module**):

     * Tiny placeholder: draw a `<div>` board and increment a number on click.
     * Export:

       ```js
       export function createGame(mount, services) {
         // create DOM, use services.storage to save a counter
         return { start(){...}, pause(){...}, resume(){...}, stop(){...} };
       }
       ```
     * Simple CSS inline within the module or created via JS (keep it minimal).
   * `sample-iframe` (**iframe**):

     * Contains a standalone `index.html` that responds to `message` events `{type:'pause'|'resume'}` with `console.log`s.
     * Renders a button that changes text or color on click.

7. **No mobile work now**

   * Do not implement orientation lock, touch haptics, or app-store concerns.
   * Keep styling basic but clean (grid, hover).

8. **Quality bar**

   * No external network calls.
   * Clean, commented code that explains the key parts.
   * App should run with:

     * `npm install`
     * `npm run dev` (Vite dev server)
   * Ensure import globs are correct (paths relative to the file doing the import).
   * Where assets/URLs are dynamic, use Vite’s `import.meta.glob({ as:'url' })` pattern.

### Output format

Return **one single code block** where each file begins with a header comment of the form:

```
// FILE: <relative/path/from/project/root>
<file contents>
```

For example:

```
// FILE: package.json
{ ... }

// FILE: src/main.js
console.log('hi');
```

### Now generate the project

Include all files listed in the structure, with working, minimal implementations:

* `package.json` with vite scripts and dependencies.
* `vite.config.js` minimal config (vanilla).
* `index.html` with `#app` root and script include.
* `src/ui.css` basic layout for grid.
* `src/main.js` (boot + initial route).
* `src/router.js` (hash routing).
* `src/registry.js` (import.meta.glob discovery + validation + asset URL resolve).
* `src/services.js` (stubs + localStorage namespace + lifecycle).
* `src/games/sample-2048/manifest.json`, `main.js`, `thumb.webp` (use tiny data-URL if needed).
* `src/games/sample-iframe/manifest.json`, `index.html`, `thumb.webp` (data-URL ok).

Ensure the app boots to `#/menu`, shows two tiles, and can enter/exit both games cleanly.

---

that prompt should make Codex roll up its sleeves and spit out a fully working starter. want me to also give you an equivalent **Node build-script** variant (index.json approach) in case you ditch Vite later? I can whip that up too 😈

