export const EDITOR_TOOLS = {
  SELECT: 'select',
  PAN: 'pan',
  ELEMENT_ADD: 'elementAdd',
  CLIP_DRAW: 'clipDraw',
  CLIP_EDIT: 'clipEdit',
  PREVIEW: 'preview',
}

export const EDITOR_TOOL_OPTIONS = [
  { id: EDITOR_TOOLS.SELECT, label: 'Select / Move', shortcut: 'V / Ctrl/Cmd' },
  { id: EDITOR_TOOLS.PAN, label: 'Pan', shortcut: 'H / Space' },
  { id: EDITOR_TOOLS.CLIP_DRAW, label: 'Add Point', shortcut: 'P' },
  { id: EDITOR_TOOLS.CLIP_EDIT, label: 'Edit Points', shortcut: 'E' },
  { id: EDITOR_TOOLS.ELEMENT_ADD, label: 'Add Element', shortcut: 'A' },
  { id: EDITOR_TOOLS.PREVIEW, label: 'Preview', shortcut: '-' },
]
