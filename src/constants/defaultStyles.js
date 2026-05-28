export const DEFAULT_TRANSFORM = {
  rotate: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
}

export const DEFAULT_SHADOW = {
  enabled: false,
  x: 0,
  y: 0,
  blur: 0,
  spread: 0,
  color: 'rgba(0,0,0,0.25)',
}

export const DEFAULT_LAYER_STYLE = {
  background: '#22d3ee',
  color: '#ffffff',
  opacity: 1,
  borderWidth: 0,
  borderColor: 'transparent',
  borderStyle: 'solid',
  borderRadius: 0,
  zIndex: 3,
  transform: DEFAULT_TRANSFORM,
  shadow: DEFAULT_SHADOW,
}

export const DEFAULT_HOVER_STATE = {
  enabled: false,
  trigger: 'self',
  target: 'self',
  targetLayerIds: [],
  styles: {},
  transition: {
    enabled: true,
    property: 'all',
    duration: 250,
    delay: 0,
    easing: 'ease',
    perProperty: [],
  },
}

export const DEFAULT_INSET_BORDER = {
  enabled: false,
  innerLayerId: null,
  inset: {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
    unit: 'px',
    linked: true,
  },
  borderColor: '#22d3ee',
  innerColor: '#0d1117',
  syncClipPath: true,
}
