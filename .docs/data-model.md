# Data Model

## Project Shape

Default project data is created in `src/services/projectFactory.js`.

```js
{
  schemaVersion: 1,
  meta: {
    id,
    name,
    slug,
    cssPrefix,
    createdAt,
    updatedAt,
    thumbnail
  },
  editor: {
    currentTool,
    selectedElementId,
    viewport,
    targetFrame,
    canvas
  },
  layers: {
    rootLayerId: 'root',
    layersById: {
      root: Layer,
      [id]: Layer
    }
  },
  output: {
    cssEditMode,
    customCss,
    customHtml
  }
}
```

`layersById` is the source of truth. Parent/child relationships are represented by each layer's `parentId` and `children` array.

## Layer Shape

Both root and child elements are layers. Root is a frame layer with `id: 'root'`, `type: 'frame'`, and default `tagName: 'div'`. Child layers usually use `type: 'element'` and `tagName: 'span'`.

Important fields:

- `id`: stable internal ID.
- `parentId`: parent layer ID, or `null` for root.
- `children`: ordered child layer IDs.
- `technicalName`: generated structural name such as `FRAME`, `E01`, or `E01-C01`.
- `displayName`: user-facing editable label.
- `cssClass`: generated export class, based on project `cssPrefix` and `technicalName`.
- `visible`: hides layer from canvas/export rendering.
- `locked`: prevents edits, movement, resizing, and deletion for that layer.
- `expanded`: controls tree UI expansion.
- `position`: `x`, `y`, `width`, `height`, and `unit`.
- `clip`: clip-path state.
- `style`: visual style state.
- `layout`: overflow and pointer events.
- `content`: root content block settings.
- `insetBorder`: generated inner border settings.
- `states`: normal and hover state settings.

## Positioning Rules

Child layer position values are relative to their parent, not always the root frame.

- Percent positions (`unit: '%'`) are relative to the rendered parent size.
- Pixel positions (`unit: 'px'`) are clamped to the parent pixel size.
- Canvas snapping uses `editorStore.canvas.gridSize`.
- Move/resize actions commit history and autosave on mouseup, not on every pointer move.

## Naming Rules

Naming helpers live in `src/services/namingService.js`.

- Root frame technical name is `FRAME`.
- Root children are `E01`, `E02`, etc.
- Nested children are `E01-C01`, `E01-C02`, etc.
- CSS class names are generated with `technicalNameToCssClass(prefix, technicalName)`.
- `createSafeCssName()` normalizes project names and class fragments.

Use `technicalName` and `cssClass` for generated output. Keep `displayName` display-only.

## Clip Model

Clip constants live in `src/constants/clipPresets.js`.

Supported modes:

- `none`
- `smartCorner`
- `freePolygon`
- `customCss`

For free polygons, points are stored as:

```js
{ id: 'pt_xxx', x: 12.5, y: 40, unit: '%' }
```

Point coordinates should stay relative to the selected layer. Use `polygonPointsToCss()` and `smartCornerClip()` from `src/utils/clipPath.js` instead of rebuilding clip-path strings in components.

## Style Model

Defaults live in `src/constants/defaultStyles.js`.

Layer style includes:

- `background`
- `color`
- `opacity`
- border fields
- `zIndex`
- nested `transform`
- nested `shadow`

When patching nested style objects, merge existing nested values to avoid dropping sibling transform/shadow fields. `layerStore.updateLayerStyle()` already does this for `transform` and `shadow`.

## Inset Border Model

`insetBorder` does not create a real child layer in `layersById`. It is rendered/generated as an inner span class named `${layer.cssClass}_inner`.

Fields:

- `enabled`
- `innerLayerId`
- `inset` with top/right/bottom/left/unit/linked
- `borderColor`
- `innerColor`
- `syncClipPath`

Check both `PreviewLayerRenderer` and `cssGenerator.generateInsetBorderCss()` when changing this model.

## Hover Model

Hover state is stored in `layer.states.hover`.

Important fields:

- `enabled`
- `trigger`: `self`, `parent`, `root`, or `customSelector`
- `target`
- `targetLayerIds`
- `styles`
- `transition`

Current CSS generation mainly emits hover rules for the selected layer's own class, triggered by self/parent/root/custom selector. If you expand multi-target hover behavior, update the inspector UI, preview renderer, and `cssGenerator.generateHoverCss()` together.

## Known Schema Caveats

- `projectStore.exportProjectJSON()` currently returns metadata with `editor`, `layers`, and `output` set to `null`; `exportStore.downloadProjectJson()` returns the fuller export payload.
- Project open/import currently does not hydrate all stores. Schema changes should include explicit load/save migration or hydration work.
- There is no formal migration layer yet. If schema changes are persisted, add migration logic before reading old localStorage data.
