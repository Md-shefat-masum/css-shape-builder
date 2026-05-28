export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 7.5, 10, 12.5, 15]

export const FRAME_PRESETS = [
  { id: 'button', label: 'Button', width: 180, height: 48, minWidth: 120, minHeight: 40 },
  { id: 'small-card', label: 'Small Card', width: 280, height: 360, minWidth: 220, minHeight: 280 },
  {
    id: 'product-card',
    label: 'Product Card',
    width: 320,
    height: 460,
    minWidth: 280,
    minHeight: 360,
  },
  { id: 'banner', label: 'Banner', width: 1200, height: 420, minWidth: 640, minHeight: 260 },
  {
    id: 'square-poster',
    label: 'Square Poster',
    width: 600,
    height: 600,
    minWidth: 320,
    minHeight: 320,
  },
  { id: 'custom', label: 'Custom', width: 800, height: 450, minWidth: 320, minHeight: 180 },
]
