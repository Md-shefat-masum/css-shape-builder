import { STORAGE_KEYS } from '../constants/storageKeys'

function safeParse(json, fallback = null) {
  try {
    return JSON.parse(json)
  } catch (error) {
    console.error('Invalid JSON from localStorage:', error)
    return fallback
  }
}

function projectKey(projectId) {
  return `${STORAGE_KEYS.PROJECT_PREFIX}${projectId}`
}

export const storageService = {
  getProjectsIndex() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.PROJECTS_INDEX), [])
  },

  saveProjectsIndex(projects) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS_INDEX, JSON.stringify(projects))
  },

  getProject(projectId) {
    return safeParse(localStorage.getItem(projectKey(projectId)), null)
  },

  saveProject(projectId, data) {
    localStorage.setItem(projectKey(projectId), JSON.stringify(data))
  },

  deleteProject(projectId) {
    localStorage.removeItem(projectKey(projectId))
  },

  getLastOpenedProjectId() {
    return localStorage.getItem(STORAGE_KEYS.LAST_OPENED_PROJECT)
  },

  setLastOpenedProjectId(projectId) {
    localStorage.setItem(STORAGE_KEYS.LAST_OPENED_PROJECT, projectId)
  },

  getEditorSettings() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.EDITOR_SETTINGS), null)
  },

  saveEditorSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.EDITOR_SETTINGS, JSON.stringify(settings))
  },
}
