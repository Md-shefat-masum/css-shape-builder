export const CLIP_MODES = {
  NONE: 'none',
  SMART_CORNER: 'smartCorner',
  FREE_POLYGON: 'freePolygon',
  CUSTOM_CSS: 'customCss',
}

export const SMART_CORNER_CLIP = {
  id: 'cut-tl-br',
  label: 'Cut TL / BR',
  cornerSize: 12,
  cssValue:
    'polygon(12px 0px, 100% 0px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0px 100%, 0px 12px)',
  points: [
    { id: 'p1', x: 12, y: 0, unit: 'px' },
    { id: 'p2', x: 100, y: 0, unit: '%' },
    { id: 'p3', x: 100, y: 88, unit: '%' },
    { id: 'p4', x: 88, y: 100, unit: '%' },
    { id: 'p5', x: 0, y: 100, unit: '%' },
    { id: 'p6', x: 0, y: 12, unit: 'px' },
  ],
}

export const CLIP_PRESETS = [SMART_CORNER_CLIP]
