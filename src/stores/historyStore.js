import { defineStore } from 'pinia'

import { createId } from '../services/idService'
import { deepClone } from '../utils/deepClone'

export const useHistoryStore = defineStore('historyStore', {
  state: () => ({
    historyItems: [
      {
        id: 'hist_project_created',
        type: 'PROJECT_CREATED',
        label: 'Project Created',
        description: 'Initial ClipFrame project shell created',
        timestamp: new Date().toISOString(),
        layerId: 'root',
        icon: 'spark',
        severity: 'normal',
      },
      {
        id: 'hist_clip_applied',
        type: 'CLIP_APPLIED',
        label: 'Smart Corner Clip Applied',
        description: 'Applied default reusable clipped-corner preset',
        timestamp: new Date().toISOString(),
        layerId: 'root',
        icon: 'polygon',
        severity: 'normal',
      },
    ],
    undoStack: [],
    redoStack: [],
    maxHistoryItems: 100,
    maxUndoSteps: 50,
  }),
  getters: {
    historyLabels(state) {
      return state.historyItems.map((item) => item.label)
    },
  },
  actions: {
    addHistory(item = {}) {
      this.historyItems.unshift({
        id: item.id || createId('hist'),
        type: item.type || 'ACTION',
        label: item.label || 'Editor Action',
        description: item.description || '',
        timestamp: item.timestamp || new Date().toISOString(),
        layerId: item.layerId || null,
        icon: item.icon || 'dot',
        severity: item.severity || 'normal',
      })

      this.historyItems = this.historyItems.slice(0, this.maxHistoryItems)
    },

    clearHistory() {
      this.historyItems = []
    },

    pushUndoSnapshot(snapshot) {
      this.undoStack.push(snapshot ? deepClone(snapshot) : { timestamp: new Date().toISOString() })
      this.undoStack = this.undoStack.slice(-this.maxUndoSteps)
      this.redoStack = []
    },

    undo() {
      const snapshot = this.undoStack.pop()
      if (!snapshot) return null

      this.redoStack.push(snapshot)
      return snapshot
    },

    redo() {
      const snapshot = this.redoStack.pop()
      if (!snapshot) return null

      this.undoStack.push(snapshot)
      return snapshot
    },

    clearUndoRedo() {
      this.undoStack = []
      this.redoStack = []
    },
  },
})
