import { defineStore } from 'pinia'

import { createDefaultProject } from '../services/projectFactory'
import { storageService } from '../services/storageService'
import { createSafeCssName } from '../utils/cssSafe'
import { debounce } from '../utils/debounce'

const debouncedSave = debounce((store) => {
  store.saveCurrentProject()
}, 500)

const initialProject = createDefaultProject({
  id: 'project_clipframe_demo',
  name: 'Untitled ClipFrame',
  slug: 'untitled-clipframe',
})

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    currentProjectId: initialProject.meta.id,
    projectsIndex: [
      {
        ...initialProject.meta,
      },
    ],
    currentProjectMeta: {
      ...initialProject.meta,
    },
    isLoaded: false,
    isSaving: false,
    lastSavedAt: null,
  }),
  actions: {
    bootstrapApp() {
      const projectsIndex = storageService.getProjectsIndex()

      if (projectsIndex.length) {
        this.projectsIndex = projectsIndex
      }

      this.currentProjectId = storageService.getLastOpenedProjectId() || this.currentProjectId
      this.isLoaded = true
    },

    createProject(payload = {}) {
      const project = createDefaultProject(payload)

      this.currentProjectId = project.meta.id
      this.currentProjectMeta = project.meta
      this.projectsIndex.push(project.meta)
      this.saveCurrentProject(project)

      return project
    },

    openProject(projectId) {
      const project = storageService.getProject(projectId)
      if (!project) return null

      this.currentProjectId = projectId
      this.currentProjectMeta = project.meta
      storageService.setLastOpenedProjectId(projectId)

      return project
    },

    saveCurrentProject(projectData = null) {
      if (!this.currentProjectId) return

      this.isSaving = true
      const savedAt = new Date().toISOString()

      if (projectData) {
        storageService.saveProject(this.currentProjectId, projectData)
      }

      this.lastSavedAt = savedAt
      this.isSaving = false
      storageService.saveProjectsIndex(this.projectsIndex)
      storageService.setLastOpenedProjectId(this.currentProjectId)
    },

    saveCurrentProjectDebounced() {
      debouncedSave(this)
    },

    duplicateProject(projectId) {
      const source = storageService.getProject(projectId)
      if (!source) return null

      return this.createProject({
        name: `${source.meta.name} Copy`,
      })
    },

    renameProject(projectId, newName) {
      const now = new Date().toISOString()
      const cssPrefix = createSafeCssName(newName)

      this.projectsIndex = this.projectsIndex.map((project) =>
        project.id === projectId
          ? { ...project, name: newName, cssPrefix, updatedAt: now }
          : project,
      )

      if (this.currentProjectId === projectId) {
        this.currentProjectMeta = {
          ...this.currentProjectMeta,
          name: newName,
          cssPrefix,
          updatedAt: now,
        }
      }
    },

    deleteProject(projectId) {
      storageService.deleteProject(projectId)
      this.projectsIndex = this.projectsIndex.filter((project) => project.id !== projectId)
    },

    importProject(jsonData) {
      const project = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData

      this.currentProjectId = project.meta.id
      this.currentProjectMeta = project.meta
      this.projectsIndex.push(project.meta)
      this.saveCurrentProject(project)
    },

    exportProjectJSON() {
      return JSON.stringify(
        {
          schemaVersion: 1,
          meta: this.currentProjectMeta,
          editor: null,
          layers: null,
          output: null,
        },
        null,
        2,
      )
    },

    updateProjectTimestamp() {
      this.currentProjectMeta.updatedAt = new Date().toISOString()
    },
  },
})
