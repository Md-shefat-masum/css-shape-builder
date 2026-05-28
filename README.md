# ClipFrame CSS Builder

Visual CSS `clip-path` frame builder for cards, buttons, banners, and UI components.

ClipFrame CSS Builder is a fully client-side Vue app for designing reusable clipped frames, nested absolute span elements, technical/inset borders, hover states, transitions, and exporting clean vanilla HTML/CSS.

## Features

- Visual `clip-path` frame editor
- Smart clipped-corner preset
- Free polygon point drawing
- Nested absolute elements
- Recursive layer tree
- Technical/inset border system
- Hover state builder
- Transition controls
- LocalStorage project management
- Vanilla HTML/CSS export

## Tech Stack

- Vue 3
- JavaScript only
- Vue Options API
- Pinia Options Stores
- Tailwind CSS for editor UI
- Raw CSS for editor theme and generated/exported design CSS
- SweetAlert2 via `alertService`
- `localStorage` persistence

## Installation

```sh
npm install
```

## Development

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Lint

```sh
npm run lint
```

## Export Rule

Generated output must contain only HTML and CSS.

Exported output must not include JavaScript, Vue, Pinia, Tailwind classes, editor handles, grid overlays, clip point controls, resize handles, or app UI classes.

## Architecture

- Components call Pinia stores.
- Stores call services.
- Services and utils do not call Pinia stores.
- Components never write directly to `localStorage`.
- Projects are persisted through `storageService`.
- Data is normalized with `rootLayerId` and `layersById`.
- Every layer has stable `id`, `technicalName`, `displayName`, and `cssClass`.
- `displayName` is user-editable and is never used as an internal ID.
- Auto-save is debounced.
- Drag/move/resize history is committed on mouseup only.

## Folder Map

```text
src/
  assets/
  components/
    canvas/
    controls/
    layers/
    layout/
    output/
    panels/
    project/
  constants/
  services/
  stores/
  utils/
```

## Build Roadmap

1. Base app shell and dark neon theme.
2. Production folder structure and Pinia store setup.
3. Project schema and LocalStorage project management.
4. Normalized layer and element data logic.
5. Dynamic canvas rendering.
6. Tool mode system.
7. Zoom, pan, target size, grid, and snap.
8. Element move and resize.
9. Clip path system.
10. Advanced layer tree panel.
11. Inspector panel.
12. Inset/technical border system.
13. Hover and transition system.
14. History, undo, and redo.
15. Vanilla CSS and HTML generators.
16. Export, import, and live preview.
17. Project manager UI.
18. Keyboard shortcuts and UX polish.
19. Error handling and data safety.
20. Production build cleanup.

## Implementation Rules

- Use Vue 3.
- Use JavaScript only.
- Do not use TypeScript.
- Use Vue Options API in components.
- Use Pinia Options Store style.
- Use SweetAlert2 through `alertService` only.
- Root frame cannot be deleted.
- Locked layers cannot be edited, moved, or resized.
- Zoom and pan only affect the editor viewport, never exported CSS values.
- Free polygon points are stored as percentages relative to the selected layer.
- Child element percentages are relative to their parent, not the root frame.
- Hidden layers are selectable from the layer tree but not from the canvas.

## Core Clip Preset

```css
polygon(
  12px 0px,
  100% 0px,
  100% calc(100% - 12px),
  calc(100% - 12px) 100%,
  0px 100%,
  0px 12px
)
```

## Production Acceptance Criteria

- A user can create a new frame project.
- A user can set target frame size.
- A user can add elements and nested children.
- A user can select any element from canvas or layer tree.
- A user can apply `clip-path` using smart corner or free polygon.
- A user can create technical/inset borders.
- A user can control hover and transition.
- A user can save and reopen projects from LocalStorage.
- A user can export pure HTML and pure CSS.
- Exported files work outside the app without JavaScript.
- `npm run build` succeeds.
- No major console errors appear during normal use.

## Manual Test Checklist

### Project

- Create new project
- Rename project
- Save project
- Refresh browser and restore project
- Open previous project
- Duplicate project
- Delete project
- Import JSON
- Export JSON

### Canvas

- Select mode works
- Pan mode works
- Add element mode works
- Clip draw mode works
- Clip edit mode works
- Preview mode works
- Zoom in/out works
- Fit screen works
- Grid works
- Snap works

### Layers

- Add root element
- Add child element
- Add nested child
- Select from canvas
- Select from layer tree
- Rename layer
- Hide layer
- Lock layer
- Duplicate layer
- Delete layer
- Parent delete removes children

### Inspector

- X/Y update works
- Width/height update works
- Background update works
- Opacity update works
- Border update works
- Shadow update works
- Transform update works
- Z-index update works
- Locked layer disables controls

### Clip Path

- Enable clip
- Disable clip
- Smart corner works
- Corner size works
- Core polygon preset works
- Free polygon add point works
- Free polygon drag point works
- Custom clip works

### Inset Border

- Enable technical border
- Border color works
- Inner color works
- Linked inset works
- Separate inset works
- Sync clip-path works
- Preview and export match

### Hover

- Self hover works
- Parent hover child works
- Root hover element works
- Transition duration works
- Transition delay works
- Easing works
- Per-property transition works

### History

- History item added
- History item selects layer
- Undo works
- Redo works
- Drag creates one item only
- Clear history works

### Export

- CSS output correct
- HTML output correct
- Copy CSS works
- Copy HTML works
- Download CSS works
- Download HTML works
- Live preview works
- Export contains no JS
- Export contains no Vue
- Export contains no Tailwind classes
- Export contains no editor handles
