# Feature Development Guide

Use this checklist before changing behavior. The app has separate editor, preview, export, history, and persistence paths, so most feature bugs come from updating only one path.

## General Change Flow

1. Find the owning store for the data.
2. Add or update constants/defaults if the value belongs in project data.
3. Update store actions so components do not mutate complex state ad hoc.
4. Update editor rendering for interactive behavior.
5. Update live preview and export generators if users should see/export the behavior.
6. Add history events and debounced save calls for user-visible mutations.
7. Run build/lint or at least inspect lints for changed files.

## Adding A New Layer Property

Usually update:

- `src/constants/defaultStyles.js` if it is visual style state.
- `src/services/projectFactory.js` so new projects and new layers receive defaults.
- `src/stores/layerStore.js` with a focused action or safe merge behavior.
- `src/components/panels/InspectorPanel.vue` if users can edit it.
- `src/components/canvas/ElementRenderer.vue` for editor canvas output.
- `src/components/output/PreviewLayerRenderer.vue` for live preview output.
- `src/services/cssGenerator.js` and maybe `src/services/htmlGenerator.js` for exported files.
- Project import/export/hydration code if the property must persist.

Do not rely on exported CSS inheriting editor-only CSS. Export should be fully represented by generated classes and markup.

## Adding A New Tool Mode

Usually update:

- `src/constants/editorTools.js`
- `editorStore.currentTool` behavior if it needs store state.
- `LeftToolPanel` and possibly `TopToolbar` for UI entry points.
- `CanvasViewport` for pointer/keyboard behavior.
- `main.css` if the tool needs cursor or visual state.
- History/save behavior when the tool mutates project data.

Keep temporary tools consistent with existing keyboard behavior: Space temporarily switches to pan, Ctrl/Cmd temporarily switches to select.

## Adding A New Frame Preset

Update `src/constants/framePresets.js`.

Each preset should provide:

- `id`
- `label`
- `width`
- `height`
- `minWidth`
- `minHeight`

Frame presets are consumed by `editorStore`, `LeftToolPanel`, `InspectorPanel`, and `NewProjectModal`.

## Adding Clip Behavior

Check:

- `src/constants/clipPresets.js`
- `src/utils/clipPath.js`
- `src/stores/layerStore.js`
- `src/components/panels/InspectorPanel.vue`
- `src/components/canvas/CanvasViewport.vue`
- `src/components/canvas/ElementRenderer.vue`
- `src/components/output/PreviewLayerRenderer.vue`
- `src/services/cssGenerator.js`

Free polygon points are stored in layer-relative percentages. Do not convert them to viewport-relative values.

## Adding Export Behavior

Update both generators when needed:

- CSS: `src/services/cssGenerator.js`
- HTML: `src/services/htmlGenerator.js`

Then compare with live preview:

- Runtime preview: `src/components/output/PreviewLayerRenderer.vue`
- Output panel: `src/components/layout/BottomOutputPanel.vue`

Export constraints:

- No JavaScript in exported output.
- No Vue-specific markup.
- No Pinia state.
- No Tailwind utility dependency.
- No editor controls, handles, overlays, panels, or `cf-editor-*` behavior classes.

## Adding Project Persistence

Use:

- `src/stores/projectStore.js`
- `src/stores/layerStore.js`
- `src/stores/editorStore.js`
- `src/stores/exportStore.js`
- `src/services/storageService.js`
- `src/constants/storageKeys.js`

Important current gap: opening/importing a project currently updates project metadata but does not hydrate all stores. A robust persistence feature should add a single explicit hydration path, for example:

```text
loaded project JSON
  -> projectStore applies meta/index/currentProjectId
  -> editorStore applies editor state
  -> layerStore applies rootLayerId/layersById
  -> exportStore applies output customizations
  -> exportStore.regenerateOutputs()
```

Also ensure debounced saves write a full project snapshot, not only project index metadata, if the feature depends on reload persistence.

## Adding Undo/Redo

`historyStore` has `undoStack` and `redoStack`, and canvas drag/resize/point drag pushes snapshots before mutation. Toolbar buttons currently render but do not wire undo/redo behavior.

For real undo/redo:

- Store full enough snapshots to restore affected stores.
- On undo, restore `layerStore.layersById` and any related editor selection.
- On redo, restore the next snapshot.
- Clear redo when a new user edit starts.
- Regenerate export output after restore.

## Adding UI Controls

Reusable controls live in `src/components/controls/`.

Most inspector edits should:

```text
control emits value
  -> InspectorPanel method calls layerStore/editorStore action
  -> InspectorPanel.commit(label, type)
```

`commit()` adds history and calls `projectStore.saveCurrentProjectDebounced()`.

## Manual Verification Checklist

For visual/editor changes:

- Select root and child layers.
- Move and resize percent-based and px-based layers.
- Toggle grid and snap.
- Check preview mode hides editor handles.
- Check locked layers cannot be edited.

For output changes:

- Click regenerate/format in the output panel.
- Compare live preview to editor canvas.
- Copy or download generated CSS/HTML.
- Confirm exported output has no editor-only classes or JavaScript.

For persistence changes:

- Create a new project.
- Rename project.
- Add nested layers.
- Change frame size and styles.
- Save, refresh, and reopen.
- Export JSON and import it again.

## Common Pitfalls

- Updating `ElementRenderer` but not `PreviewLayerRenderer` or `cssGenerator`.
- Treating `displayName` as a stable ID.
- Forgetting child coordinates are relative to parent size.
- Mutating locked layers.
- Saving project metadata but not the full editor/layer snapshot.
- Assuming output auto-regenerates after every store mutation.
- Adding editor-only classes to generated HTML/CSS.
