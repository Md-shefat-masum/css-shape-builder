# ClipFrame CSS Builder Docs

This directory is for future agents and maintainers who need to understand or extend the app quickly.

## Project In One Paragraph

ClipFrame CSS Builder is a fully client-side Vue app for designing clipped CSS frame/card/button layouts visually. Users edit a normalized tree of layers on a canvas, then export plain HTML and CSS that can run outside Vue without JavaScript, Pinia, Tailwind utility classes, editor handles, or app UI markup.

## Tech Stack

- Vue 3 single-page app, written in JavaScript only.
- Vue Options API in `.vue` components.
- Pinia Options Stores for shared state.
- Vite for dev/build.
- Tailwind CSS and raw CSS for the editor UI.
- Raw generated CSS/HTML for exported designs.
- SweetAlert2 wrapped by `src/services/alertService.js`.
- Browser `localStorage` wrapped by `src/services/storageService.js`.

## Important Commands

```sh
npm install
npm run dev
npm run build
npm run lint
npm run format
```

Notes:

- `npm run lint` runs fixers (`oxlint . --fix` and `eslint . --fix --cache`), so expect it to modify files.
- `npm run format` formats `src/` with Prettier.
- Build output goes to `dist/`; treat it as generated unless the user explicitly asks to inspect or publish it.

## Source Map

```text
src/
  main.js                         Vue app and Pinia bootstrap
  App.vue                         Mounts the app shell
  assets/
    main.css                      Main editor styling
    editor-theme.css              Theme-related styling
  components/
    layout/                       Top/left/right/bottom shell panels
    canvas/                       Interactive editor canvas and handles
    output/                       Live preview and generated output UI
    panels/                       Inspector, elements, layers, history panels
    layers/                       Recursive layer tree UI
    controls/                     Reusable form controls
    project/                      Project creation/list/import/export modals
  constants/                      Tool, frame, clip, storage, default style constants
  services/                       Pure app services and export generators
  stores/                         Pinia stores
  utils/                          Small pure helpers
```

## Core Rules

- Components may call stores.
- Stores may call services and utils.
- Services and utils should stay framework-light and avoid depending on Pinia stores.
- Components should not write directly to `localStorage`; use `projectStore`/`storageService`.
- Exported output must stay vanilla HTML/CSS.
- Keep generated/exported CSS independent from editor viewport zoom/pan.
- Preserve stable layer IDs, technical names, display names, and CSS classes.
- `displayName` is user-facing only; never use it as an internal identifier.

## Start Here

- Read `architecture.md` for how the UI, stores, and export path fit together.
- Read `data-model.md` before changing layer/project schema.
- Read `feature-guide.md` before adding tools, inspector controls, export behavior, or project persistence.
