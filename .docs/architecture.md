# Architecture Overview

## Runtime Flow

The app starts in `src/main.js`, installs Pinia, and mounts `App.vue`. `App.vue` only renders `AppShell`, which composes the main editor surface:

- `TopToolbar` handles project name, tool shortcuts, zoom/grid/snap controls, and project modals.
- `LeftToolPanel` exposes tool modes, clip controls, frame presets, zoom, grid/snap, and root reference image upload.
- `CanvasWorkspace` wraps the interactive canvas and status bars.
- `RightPanel` hosts `StylePanel`, `ElementsPanel`, `LayersPanel`, and `HistoryPanel`.
- `BottomOutputPanel` shows generated CSS/HTML, settings placeholders, and the live preview.

## State Ownership

State is split across Pinia stores:

- `editorStore`: tool mode, selection, viewport zoom/pan, canvas flags, target frame size, panel tabs, interaction flags, and mouse status.
- `layerStore`: normalized layer tree, selection-derived layer getters, element CRUD, clip-path edits, inset border edits, hover/transition edits, visibility/lock/expand, and layer reparenting.
- `projectStore`: project metadata/index, local project create/open/delete/import/export entry points, and localStorage save coordination.
- `historyStore`: visible history feed plus undo/redo snapshot stacks.
- `exportStore`: generated/custom CSS and HTML, copy/download actions, and project JSON download payload.

Most editing UI follows this pattern:

```text
component event
  -> Pinia action mutates state
  -> historyStore.addHistory(...)
  -> projectStore.saveCurrentProjectDebounced()
  -> exportStore.regenerateOutputs() when the output panel or caller requests fresh output
```

## Canvas Flow

The main interactive canvas is `CanvasViewport`.

- Tool behavior is driven by `EDITOR_TOOLS` from `src/constants/editorTools.js`.
- `select` selects and moves unlocked layers.
- `pan` changes `editorStore.viewport.panX/panY`.
- `elementAdd` adds a child layer under the selected layer, with coordinates relative to the parent.
- `clipDraw` appends free polygon points to the selected layer.
- `clipEdit` drags existing polygon points.
- `preview` hides editor overlays/handles.

`FrameRenderer` renders the root frame in the editor, and `ElementRenderer` recursively renders child layers. Resize handles and clip point handles emit events back to `CanvasViewport`, which updates `layerStore`.

Zoom and pan only affect editor rendering via `cf-canvas-transform`. Exported CSS uses the persisted target frame/layer values, not viewport scale.

## Layer Rendering Paths

There are two rendering paths:

- Editor canvas: `FrameRenderer` and `ElementRenderer` render interactive markup with editor classes, handles, and mouse events.
- Output preview/export: `PreviewLayerRenderer`, `cssGenerator`, and `htmlGenerator` render or generate clean design markup/styles.

When adding layer behavior, check both paths. A change that only appears in `ElementRenderer` may work in the editor but fail in live preview or exported files.

## Export Flow

`exportStore.regenerateOutputs()` collects:

- `projectStore.currentProjectMeta`
- `editorStore.targetFrame`
- `layerStore.rootLayerId`
- `layerStore.layersById`

It then calls:

- `generateProjectCss(projectData)` from `src/services/cssGenerator.js`
- `generateProjectHtml(projectData)` from `src/services/htmlGenerator.js`

Generated CSS includes position, background, color, opacity, pointer events, z-index, transform, transition, shadow, visibility, clip-path, inset border, hover rules, and root content padding.

Generated HTML recursively outputs each layer's `tagName` and `cssClass`, optional inset-border inner spans, child layers, and root content.

## Project Persistence Flow

Persistence APIs live in `projectStore` and `storageService`.

- Project index key, per-project key prefix, and last-opened key are defined in `src/constants/storageKeys.js`.
- `storageService` is the only direct localStorage wrapper.
- `projectStore.createProject()` creates default project data through `projectFactory` and saves it.
- `exportStore.downloadProjectJson()` creates the most complete JSON export payload because it reads editor, layer, and output stores.

Current caveat: `projectStore.bootstrapApp()` exists but is not called from app startup in the current code. Also, `openProject()`/`importProject()` update project metadata but do not currently hydrate `editorStore`, `layerStore`, or `exportStore`. If you work on project persistence, wire hydration explicitly instead of assuming it already exists.

## UI Styling

Most app styling is in `src/assets/main.css`; `editor-theme.css` holds extra theme styling. Component markup uses a mix of app-specific `cf-*` classes and Tailwind utility classes for editor UI only.

Export generators must not depend on editor-only classes such as handles, overlays, panels, or Tailwind classes.
