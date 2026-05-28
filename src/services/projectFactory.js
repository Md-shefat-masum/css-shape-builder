import { CLIP_MODES, SMART_CORNER_CLIP } from '../constants/clipPresets'
import {
  DEFAULT_HOVER_STATE,
  DEFAULT_INSET_BORDER,
  DEFAULT_LAYER_STYLE,
} from '../constants/defaultStyles'
import { createSafeCssName } from '../utils/cssSafe'
import { deepClone } from '../utils/deepClone'
import { createId } from './idService'
import { createDisplayNameFromTechnicalName, technicalNameToCssClass } from './namingService'

export function createDefaultHoverState() {
  return deepClone(DEFAULT_HOVER_STATE)
}

export function createDefaultRootLayer(cssPrefix = 'clipframe') {
  return {
    id: 'root',
    parentId: null,
    children: [],
    technicalName: 'FRAME',
    displayName: 'Root Frame',
    cssClass: technicalNameToCssClass(cssPrefix, 'FRAME'),
    type: 'frame',
    tagName: 'div',
    visible: true,
    locked: false,
    expanded: true,
    position: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      unit: '%',
    },
    clip: {
      enabled: true,
      mode: CLIP_MODES.SMART_CORNER,
      preset: SMART_CORNER_CLIP.id,
      cornerSize: SMART_CORNER_CLIP.cornerSize,
      polygonPoints: [],
      cssValue: SMART_CORNER_CLIP.cssValue,
    },
    style: {
      ...deepClone(DEFAULT_LAYER_STYLE),
      background: '#0d1117',
      zIndex: 1,
      shadow: {
        enabled: true,
        x: 0,
        y: 12,
        blur: 40,
        spread: 0,
        color: 'rgba(0, 188, 212, 0.15)',
      },
    },
    layout: {
      overflow: 'hidden',
      pointerEvents: 'auto',
    },
    content: {
      enabled: true,
      text: 'Your Content Here',
      className: `${cssPrefix}_content`,
      padding: {
        top: 24,
        right: 24,
        bottom: 24,
        left: 24,
        unit: 'px',
        linked: true,
      },
    },
    insetBorder: deepClone(DEFAULT_INSET_BORDER),
    states: {
      normal: {},
      hover: createDefaultHoverState(),
    },
  }
}

export function createDefaultElementLayer(payload = {}) {
  const technicalName = payload.technicalName || 'E01'
  const cssPrefix = payload.cssPrefix || 'clipframe'

  return {
    id: payload.id || createId('el'),
    parentId: payload.parentId || 'root',
    children: payload.children || [],
    technicalName,
    displayName: payload.displayName || createDisplayNameFromTechnicalName(technicalName),
    cssClass: payload.cssClass || technicalNameToCssClass(cssPrefix, technicalName),
    type: 'element',
    tagName: 'span',
    visible: payload.visible ?? true,
    locked: payload.locked ?? false,
    expanded: payload.expanded ?? true,
    position: {
      x: payload.x ?? payload.position?.x ?? 10,
      y: payload.y ?? payload.position?.y ?? 10,
      width: payload.width ?? payload.position?.width ?? 20,
      height: payload.height ?? payload.position?.height ?? 5,
      unit: payload.unit ?? payload.position?.unit ?? '%',
    },
    clip: {
      enabled: false,
      mode: CLIP_MODES.NONE,
      preset: null,
      cornerSize: 12,
      polygonPoints: [],
      cssValue: '',
      ...payload.clip,
    },
    style: {
      ...deepClone(DEFAULT_LAYER_STYLE),
      ...payload.style,
      transform: {
        ...deepClone(DEFAULT_LAYER_STYLE.transform),
        ...payload.style?.transform,
      },
      shadow: {
        ...deepClone(DEFAULT_LAYER_STYLE.shadow),
        ...payload.style?.shadow,
      },
    },
    layout: {
      overflow: 'visible',
      pointerEvents: 'none',
      ...payload.layout,
    },
    insetBorder: {
      ...deepClone(DEFAULT_INSET_BORDER),
      ...payload.insetBorder,
      inset: {
        ...deepClone(DEFAULT_INSET_BORDER.inset),
        ...payload.insetBorder?.inset,
      },
    },
    states: {
      normal: {},
      ...payload.states,
      hover: {
        ...createDefaultHoverState(),
        ...payload.states?.hover,
        transition: {
          ...createDefaultHoverState().transition,
          ...payload.states?.hover?.transition,
        },
      },
    },
  }
}

export const createDefaultElement = createDefaultElementLayer

export function createDefaultProject(payload = {}) {
  const now = new Date().toISOString()
  const id = payload.id || createId('project')
  const name = payload.name || 'Untitled Frame'
  const slug = payload.slug || createSafeCssName(name).replaceAll('_', '-')
  const cssPrefix = createSafeCssName(payload.cssPrefix || name)
  const rootLayer = createDefaultRootLayer(cssPrefix)
  const topAccent = createDefaultElementLayer({
    id: 'el_demo_e01',
    parentId: 'root',
    children: ['el_demo_e01_c01', 'el_demo_e01_c02'],
    technicalName: 'E01',
    displayName: 'Top Corner Block',
    cssPrefix,
    position: { x: 7, y: 5, width: 34, height: 3, unit: '%' },
  })
  const innerGlow = createDefaultElementLayer({
    id: 'el_demo_e01_c01',
    parentId: 'el_demo_e01',
    technicalName: 'E01-C01',
    displayName: 'Inner Glow Line',
    cssPrefix,
    position: { x: 58, y: 10, width: 34, height: 1, unit: '%' },
    style: { background: '#8b5cf6', zIndex: 4 },
  })
  const smallDot = createDefaultElementLayer({
    id: 'el_demo_e01_c02',
    parentId: 'el_demo_e01',
    technicalName: 'E01-C02',
    displayName: 'Small Dot',
    cssPrefix,
    position: { x: 89, y: 7, width: 2.4, height: 2.4, unit: '%' },
    style: { zIndex: 5 },
  })
  const bottomAccent = createDefaultElementLayer({
    id: 'el_demo_e02',
    parentId: 'root',
    technicalName: 'E02',
    displayName: 'Bottom Accent',
    cssPrefix,
    position: { x: 56, y: 90, width: 34, height: 4, unit: '%' },
    style: { background: 'linear-gradient(90deg, #8b5cf6, #22d3ee)' },
  })

  rootLayer.children = [topAccent.id, bottomAccent.id]

  return {
    schemaVersion: 1,
    meta: {
      id,
      name,
      slug,
      cssPrefix,
      createdAt: now,
      updatedAt: now,
      thumbnail: null,
    },
    editor: {
      currentTool: 'select',
      selectedElementId: 'root',
      viewport: {
        zoom: 1,
        panX: 0,
        panY: 0,
      },
      targetFrame: {
        width: 320,
        height: 460,
        minWidth: 180,
        minHeight: 48,
        preset: 'product-card',
      },
      canvas: {
        showGrid: true,
        snapToGrid: true,
        gridSize: 10,
        backgroundImage: null,
        backgroundOpacity: 0.84,
      },
    },
    layers: {
      rootLayerId: 'root',
      layersById: {
        root: rootLayer,
        [topAccent.id]: topAccent,
        [innerGlow.id]: innerGlow,
        [smallDot.id]: smallDot,
        [bottomAccent.id]: bottomAccent,
      },
    },
    output: {
      cssEditMode: 'generated',
      customCss: '',
      customHtml: '',
    },
  }
}
