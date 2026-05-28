<script>
import { mapActions, mapState } from 'pinia'

import { CLIP_MODES } from '../../constants/clipPresets'
import { DEFAULT_INSET_BORDER } from '../../constants/defaultStyles'
import { useEditorStore } from '../../stores/editorStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useLayerStore } from '../../stores/layerStore'
import { useProjectStore } from '../../stores/projectStore'
import ColorInput from '../controls/ColorInput.vue'
import NumberInput from '../controls/NumberInput.vue'
import SectionCard from '../controls/SectionCard.vue'
import SelectInput from '../controls/SelectInput.vue'
import ToggleSwitch from '../controls/ToggleSwitch.vue'

export default {
  name: 'InspectorPanel',
  components: {
    ColorInput,
    NumberInput,
    SectionCard,
    SelectInput,
    ToggleSwitch,
  },
  data() {
    return {
      clipModes: [
        { id: CLIP_MODES.NONE, label: 'None' },
        { id: CLIP_MODES.SMART_CORNER, label: 'Smart Corner' },
        { id: CLIP_MODES.FREE_POLYGON, label: 'Free Polygon' },
        { id: CLIP_MODES.CUSTOM_CSS, label: 'Custom CSS' },
      ],
      borderStyles: [
        { id: 'solid', label: 'Solid' },
        { id: 'dashed', label: 'Dashed' },
        { id: 'dotted', label: 'Dotted' },
        { id: 'double', label: 'Double' },
      ],
      overflowOptions: [
        { id: 'visible', label: 'Visible' },
        { id: 'hidden', label: 'Hidden' },
      ],
      pointerOptions: [
        { id: 'none', label: 'None' },
        { id: 'auto', label: 'Auto' },
      ],
      positionUnitOptions: [
        { id: '%', label: '%' },
        { id: 'px', label: 'px' },
      ],
      hoverTriggers: [
        { id: 'self', label: 'Self Hover' },
        { id: 'parent', label: 'Parent Hover' },
        { id: 'root', label: 'Root Frame Hover' },
        { id: 'customSelector', label: 'Custom Selector' },
      ],
      hoverTargets: [
        { id: 'self', label: 'Selected Element' },
        { id: 'child', label: 'Specific Child' },
        { id: 'multiple', label: 'Multiple Children' },
        { id: 'allChildren', label: 'All Children' },
      ],
      easingOptions: [
        { id: 'ease', label: 'ease' },
        { id: 'ease-in', label: 'ease-in' },
        { id: 'ease-out', label: 'ease-out' },
        { id: 'linear', label: 'linear' },
      ],
    }
  },
  computed: {
    ...mapState(useEditorStore, ['framePresets', 'selectedClipPoint', 'targetFrame']),
    ...mapState(useLayerStore, ['getLayerBreadcrumb', 'selectedLayer']),
    layer() {
      return this.selectedLayer
    },
    isRoot() {
      return this.layer?.id === 'root'
    },
    isLocked() {
      return this.layer?.locked
    },
    breadcrumb() {
      if (!this.layer) return ''

      return this.getLayerBreadcrumb(this.layer.id)
        .map((item) => item.technicalName)
        .join(' > ')
    },
    pointCount() {
      return this.layer?.clip?.polygonPoints?.length || 0
    },
    insetBorder() {
      return {
        ...DEFAULT_INSET_BORDER,
        ...this.layer?.insetBorder,
        inset: {
          ...DEFAULT_INSET_BORDER.inset,
          ...this.layer?.insetBorder?.inset,
        },
      }
    },
  },
  methods: {
    ...mapActions(useEditorStore, [
      'applyFramePreset',
      'clearSelectedClipPoint',
      'selectClipPoint',
      'setTargetFrameSize',
    ]),
    ...mapActions(useLayerStore, [
      'disableClip',
      'enableClip',
      'enableInsetBorder',
      'removeClipPoint',
      'renameLayer',
      'setClipMode',
      'updateClipPoint',
      'updateHoverState',
      'updateInsetBorder',
      'updateLayer',
      'updateLayerPosition',
      'updateLayerStyle',
      'updateTransition',
    ]),
    commit(label, type = 'INSPECTOR_CHANGED') {
      useHistoryStore().addHistory({
        type,
        label,
        layerId: this.layer?.id,
      })
      useProjectStore().saveCurrentProjectDebounced()
    },
    updateDisplayName(value) {
      this.renameLayer(this.layer.id, value)
      this.commit('Layer Renamed', 'LAYER_RENAMED')
    },
    updateRootFrame(key, value) {
      this.setTargetFrameSize({ [key]: value })
      this.commit('Frame Size Changed', 'FRAME_SIZE_CHANGED')
    },
    updatePosition(key, value) {
      this.updateLayerPosition(this.layer.id, { [key]: value })
      this.commit('Position Changed', 'POSITION_CHANGED')
    },
    updateStyle(key, value) {
      this.updateLayerStyle(this.layer.id, { [key]: value })
      this.commit('Style Changed', 'STYLE_CHANGED')
    },
    updateTransform(key, value) {
      this.updateLayerStyle(this.layer.id, {
        transform: {
          ...this.layer.style.transform,
          [key]: value,
        },
      })
      this.commit('Transform Changed', 'TRANSFORM_CHANGED')
    },
    updateShadow(key, value) {
      this.updateLayerStyle(this.layer.id, {
        shadow: {
          ...this.layer.style.shadow,
          [key]: value,
        },
      })
      this.commit('Shadow Changed', 'SHADOW_CHANGED')
    },
    updateLayout(key, value) {
      this.updateLayer(this.layer.id, {
        layout: {
          ...this.layer.layout,
          [key]: value,
        },
      })
      this.commit('Layout Changed', 'LAYOUT_CHANGED')
    },
    toggleClip(enabled) {
      if (enabled) {
        this.enableClip(this.layer.id)
      } else {
        this.disableClip(this.layer.id)
      }
      this.commit('Clip Path Changed', 'CLIP_CHANGED')
    },
    updateClipMode(mode) {
      this.setClipMode(this.layer.id, mode)
      this.commit('Clip Mode Changed', 'CLIP_CHANGED')
    },
    updateClipValue(key, value) {
      this.updateLayer(this.layer.id, {
        clip: {
          ...this.layer.clip,
          [key]: value,
        },
      })
      this.commit('Clip Path Changed', 'CLIP_CHANGED')
    },
    clearPoints() {
      this.updateClipValue('polygonPoints', [])
    },
    updatePoint(pointId, key, value) {
      this.selectClipPoint(this.layer.id, pointId)
      this.updateClipPoint(this.layer.id, pointId, { [key]: value })
      this.commit('Point Changed', 'POINT_CHANGED')
    },
    removePoint(pointId) {
      this.removeClipPoint(this.layer.id, pointId)
      if (
        this.selectedClipPoint.layerId === this.layer.id &&
        this.selectedClipPoint.pointId === pointId
      ) {
        this.clearSelectedClipPoint()
      }
      this.commit('Point Deleted', 'POINT_DELETED')
    },
    isActivePoint(point) {
      return (
        this.selectedClipPoint.layerId === this.layer.id &&
        this.selectedClipPoint.pointId === point.id
      )
    },
    toggleInset(enabled) {
      if (enabled) {
        this.enableInsetBorder(this.layer.id)
      } else {
        this.updateInsetBorder(this.layer.id, { enabled: false, innerLayerId: null })
      }
      this.commit('Inset Border Changed', 'INSET_CHANGED')
    },
    updateInset(key, value) {
      const nextInset = {
        ...this.insetBorder.inset,
        [key]: value,
      }

      if (nextInset.linked && ['top', 'right', 'bottom', 'left'].includes(key)) {
        nextInset.top = value
        nextInset.right = value
        nextInset.bottom = value
        nextInset.left = value
      }

      this.updateInsetBorder(this.layer.id, { inset: nextInset })
      this.commit('Inset Border Changed', 'INSET_CHANGED')
    },
    updateInsetRoot(key, value) {
      this.updateInsetBorder(this.layer.id, { [key]: value })
      this.commit('Inset Border Changed', 'INSET_CHANGED')
    },
    updateHover(key, value) {
      this.updateHoverState(this.layer.id, { [key]: value })
      this.commit('Hover Changed', 'HOVER_CHANGED')
    },
    updateHoverStyle(key, value) {
      this.updateHoverState(this.layer.id, {
        styles: {
          ...this.layer.states.hover.styles,
          [key]: value,
        },
      })
      this.commit('Hover Style Changed', 'HOVER_CHANGED')
    },
    updateHoverTransform(key, value) {
      this.updateHoverState(this.layer.id, {
        styles: {
          ...this.layer.states.hover.styles,
          transform: {
            ...this.layer.states.hover.styles.transform,
            [key]: value,
          },
        },
      })
      this.commit('Hover Transform Changed', 'HOVER_CHANGED')
    },
    updateTransitionValue(key, value) {
      this.updateTransition(this.layer.id, { [key]: value })
      this.commit('Transition Changed', 'TRANSITION_CHANGED')
    },
  },
}
</script>

<template>
  <section class="cf-inspector-body">
    <SectionCard title="Selected Layer">
      <div v-if="layer" class="space-y-2">
        <label class="cf-field-stack">
          <span>Display Name</span>
          <input
            :value="layer.displayName"
            :disabled="isLocked"
            @change="updateDisplayName($event.target.value)"
          />
        </label>
        <div class="cf-property-list">
          <span>Technical</span>
          <strong>{{ layer.technicalName }}</strong>
          <span>CSS Class</span>
          <strong>{{ layer.cssClass }}</strong>
          <span>Type</span>
          <strong>{{ layer.tagName }}</strong>
          <span>Path</span>
          <strong>{{ breadcrumb }}</strong>
        </div>
      </div>
      <p v-else class="text-xs text-slate-400">No selected layer.</p>
    </SectionCard>

    <SectionCard v-if="layer" :title="isRoot ? 'Target Frame' : 'Size & Position'" collapsible>
      <div v-if="isRoot" class="grid grid-cols-2 gap-2">
        <SelectInput
          class="col-span-2"
          label="Size Preset"
          :model-value="targetFrame.preset"
          :options="framePresets"
          @change="applyFramePreset"
        />
        <NumberInput
          label="Width"
          :model-value="targetFrame.width"
          unit="px"
          @change="updateRootFrame('width', $event)"
        />
        <NumberInput
          label="Height"
          :model-value="targetFrame.height"
          unit="px"
          @change="updateRootFrame('height', $event)"
        />
        <NumberInput
          label="Min W"
          :model-value="targetFrame.minWidth"
          unit="px"
          @change="updateRootFrame('minWidth', $event)"
        />
        <NumberInput
          label="Min H"
          :model-value="targetFrame.minHeight"
          unit="px"
          @change="updateRootFrame('minHeight', $event)"
        />
      </div>
      <div v-else class="grid grid-cols-2 gap-2">
        <NumberInput
          label="X"
          :model-value="layer.position.x"
          :unit="layer.position.unit"
          :disabled="isLocked"
          @change="updatePosition('x', $event)"
        />
        <NumberInput
          label="Y"
          :model-value="layer.position.y"
          :unit="layer.position.unit"
          :disabled="isLocked"
          @change="updatePosition('y', $event)"
        />
        <NumberInput
          label="Width"
          :model-value="layer.position.width"
          :unit="layer.position.unit"
          :disabled="isLocked"
          @change="updatePosition('width', $event)"
        />
        <NumberInput
          label="Height"
          :model-value="layer.position.height"
          :unit="layer.position.unit"
          :disabled="isLocked"
          @change="updatePosition('height', $event)"
        />
        <SelectInput
          class="col-span-2"
          label="Position Unit"
          :model-value="layer.position.unit"
          :options="positionUnitOptions"
          :disabled="isLocked"
          @change="updatePosition('unit', $event)"
        />
        <NumberInput
          label="Z-index"
          :model-value="layer.style.zIndex"
          :disabled="isLocked"
          @change="updateStyle('zIndex', $event)"
        />
        <NumberInput
          label="Rotate"
          :model-value="layer.style.transform.rotate"
          unit="deg"
          :disabled="isLocked"
          @change="updateTransform('rotate', $event)"
        />
        <NumberInput
          label="Scale"
          :model-value="layer.style.transform.scale"
          :step="0.01"
          :disabled="isLocked"
          @change="updateTransform('scale', $event)"
        />
      </div>
    </SectionCard>

    <SectionCard v-if="layer" title="Appearance" collapsible>
      <div class="grid grid-cols-2 gap-2">
        <ColorInput
          label="Background"
          :model-value="layer.style.background"
          :disabled="isLocked"
          @change="updateStyle('background', $event)"
        />
        <ColorInput
          label="Text"
          :model-value="layer.style.color"
          :disabled="isLocked"
          @change="updateStyle('color', $event)"
        />
        <NumberInput
          label="Opacity"
          :model-value="layer.style.opacity"
          :min="0"
          :max="1"
          :step="0.05"
          :disabled="isLocked"
          @change="updateStyle('opacity', $event)"
        />
        <NumberInput
          label="Border W"
          :model-value="layer.style.borderWidth"
          unit="px"
          :disabled="isLocked"
          @change="updateStyle('borderWidth', $event)"
        />
        <ColorInput
          label="Border"
          :model-value="layer.style.borderColor"
          :disabled="isLocked"
          @change="updateStyle('borderColor', $event)"
        />
        <SelectInput
          label="Border Style"
          :model-value="layer.style.borderStyle"
          :options="borderStyles"
          :disabled="isLocked"
          @change="updateStyle('borderStyle', $event)"
        />
        <NumberInput
          label="Radius"
          :model-value="layer.style.borderRadius"
          unit="px"
          :disabled="isLocked"
          @change="updateStyle('borderRadius', $event)"
        />
        <SelectInput
          label="Overflow"
          :model-value="layer.layout.overflow"
          :options="overflowOptions"
          :disabled="isLocked"
          @change="updateLayout('overflow', $event)"
        />
        <SelectInput
          class="col-span-2"
          label="Pointer Events"
          :model-value="layer.layout.pointerEvents"
          :options="pointerOptions"
          :disabled="isLocked"
          @change="updateLayout('pointerEvents', $event)"
        />
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <ToggleSwitch
          class="col-span-2"
          label="Shadow"
          :model-value="layer.style.shadow.enabled"
          :disabled="isLocked"
          @change="updateShadow('enabled', $event)"
        />
        <ColorInput
          label="Shadow Color"
          :model-value="layer.style.shadow.color"
          :disabled="isLocked"
          @change="updateShadow('color', $event)"
        />
        <NumberInput
          label="Shadow X"
          :model-value="layer.style.shadow.x"
          unit="px"
          :disabled="isLocked"
          @change="updateShadow('x', $event)"
        />
        <NumberInput
          label="Shadow Y"
          :model-value="layer.style.shadow.y"
          unit="px"
          :disabled="isLocked"
          @change="updateShadow('y', $event)"
        />
        <NumberInput
          label="Blur"
          :model-value="layer.style.shadow.blur"
          unit="px"
          :disabled="isLocked"
          @change="updateShadow('blur', $event)"
        />
        <NumberInput
          label="Spread"
          :model-value="layer.style.shadow.spread"
          unit="px"
          :disabled="isLocked"
          @change="updateShadow('spread', $event)"
        />
      </div>
    </SectionCard>

    <SectionCard v-if="layer" title="Clip Path" collapsible>
      <div class="space-y-2">
        <ToggleSwitch
          label="Enable Clip Path"
          :model-value="layer.clip.enabled"
          :disabled="isLocked"
          @change="toggleClip"
        />
        <SelectInput
          label="Clip Mode"
          :model-value="layer.clip.mode"
          :options="clipModes"
          :disabled="isLocked"
          @change="updateClipMode"
        />
        <NumberInput
          v-if="layer.clip.mode === 'smartCorner'"
          label="Corner Size"
          :model-value="layer.clip.cornerSize"
          unit="px"
          :disabled="isLocked"
          @change="updateClipValue('cornerSize', $event)"
        />
        <label v-if="layer.clip.mode === 'customCss'" class="cf-field-stack">
          <span>Custom CSS</span>
          <input
            :value="layer.clip.cssValue"
            :disabled="isLocked"
            @change="updateClipValue('cssValue', $event.target.value)"
          />
        </label>
        <div v-if="layer.clip.mode === 'freePolygon'" class="cf-point-table">
          <p class="text-[11px] text-slate-400">
            Use Clip Draw to add points and Clip Edit to drag them.
          </p>
          <div
            v-for="(point, index) in layer.clip.polygonPoints"
            :key="point.id"
            class="cf-point-row"
            :class="{ 'is-active': isActivePoint(point) }"
            @click="selectClipPoint(layer.id, point.id)"
          >
            <span>#{{ index + 1 }}</span>
            <input
              :value="point.x"
              :disabled="isLocked"
              type="number"
              @change="updatePoint(point.id, 'x', Number($event.target.value))"
            />
            <input
              :value="point.y"
              :disabled="isLocked"
              type="number"
              @change="updatePoint(point.id, 'y', Number($event.target.value))"
            />
            <button
              class="cf-mini-action"
              type="button"
              :disabled="isLocked"
              @click.stop="removePoint(point.id)"
            >
              Delete
            </button>
          </div>
          <button
            class="cf-small-control w-full"
            type="button"
            :disabled="isLocked"
            @click="clearPoints"
          >
            Clear Points ({{ pointCount }})
          </button>
        </div>
      </div>
    </SectionCard>

    <SectionCard v-if="layer" title="Technical Border" collapsible>
      <div class="grid grid-cols-2 gap-2">
        <ToggleSwitch
          class="col-span-2"
          label="Enable Technical Border"
          :model-value="insetBorder.enabled"
          :disabled="isLocked"
          @change="toggleInset"
        />
        <ColorInput
          label="Border Color"
          :model-value="insetBorder.borderColor"
          :disabled="isLocked"
          @change="updateInsetRoot('borderColor', $event)"
        />
        <ColorInput
          label="Inner Fill"
          :model-value="insetBorder.innerColor"
          :disabled="isLocked"
          @change="updateInsetRoot('innerColor', $event)"
        />
        <ToggleSwitch
          class="col-span-2"
          label="Link Inset Values"
          :model-value="insetBorder.inset.linked"
          :disabled="isLocked"
          @change="updateInset('linked', $event)"
        />
        <NumberInput
          label="Top"
          :model-value="insetBorder.inset.top"
          unit="px"
          :disabled="isLocked"
          @change="updateInset('top', $event)"
        />
        <NumberInput
          label="Right"
          :model-value="insetBorder.inset.right"
          unit="px"
          :disabled="isLocked"
          @change="updateInset('right', $event)"
        />
        <NumberInput
          label="Bottom"
          :model-value="insetBorder.inset.bottom"
          unit="px"
          :disabled="isLocked"
          @change="updateInset('bottom', $event)"
        />
        <NumberInput
          label="Left"
          :model-value="insetBorder.inset.left"
          unit="px"
          :disabled="isLocked"
          @change="updateInset('left', $event)"
        />
        <ToggleSwitch
          class="col-span-2"
          label="Sync Clip Path"
          :model-value="insetBorder.syncClipPath"
          :disabled="isLocked"
          @change="updateInsetRoot('syncClipPath', $event)"
        />
      </div>
    </SectionCard>

    <SectionCard v-if="layer" title="Hover & Transition" collapsible>
      <div class="grid grid-cols-2 gap-2">
        <ToggleSwitch
          class="col-span-2"
          label="Enable Hover"
          :model-value="layer.states.hover.enabled"
          :disabled="isLocked"
          @change="updateHover('enabled', $event)"
        />
        <SelectInput
          label="Trigger"
          :model-value="layer.states.hover.trigger"
          :options="hoverTriggers"
          :disabled="isLocked"
          @change="updateHover('trigger', $event)"
        />
        <SelectInput
          label="Target"
          :model-value="layer.states.hover.target"
          :options="hoverTargets"
          :disabled="isLocked"
          @change="updateHover('target', $event)"
        />
        <ColorInput
          label="Hover BG"
          :model-value="layer.states.hover.styles.background || layer.style.background"
          :disabled="isLocked"
          @change="updateHoverStyle('background', $event)"
        />
        <NumberInput
          label="Hover Opacity"
          :model-value="layer.states.hover.styles.opacity ?? layer.style.opacity"
          :min="0"
          :max="1"
          :step="0.05"
          :disabled="isLocked"
          @change="updateHoverStyle('opacity', $event)"
        />
        <NumberInput
          label="Move X"
          :model-value="layer.states.hover.styles.transform?.translateX || 0"
          unit="px"
          :disabled="isLocked"
          @change="updateHoverTransform('translateX', $event)"
        />
        <NumberInput
          label="Move Y"
          :model-value="layer.states.hover.styles.transform?.translateY || 0"
          unit="px"
          :disabled="isLocked"
          @change="updateHoverTransform('translateY', $event)"
        />
        <NumberInput
          label="Scale"
          :model-value="layer.states.hover.styles.transform?.scale || 1"
          :step="0.01"
          :disabled="isLocked"
          @change="updateHoverTransform('scale', $event)"
        />
        <NumberInput
          label="Rotate"
          :model-value="layer.states.hover.styles.transform?.rotate || 0"
          unit="deg"
          :disabled="isLocked"
          @change="updateHoverTransform('rotate', $event)"
        />
        <ToggleSwitch
          class="col-span-2"
          label="Enable Transition"
          :model-value="layer.states.hover.transition.enabled"
          :disabled="isLocked"
          @change="updateTransitionValue('enabled', $event)"
        />
        <label class="cf-field-stack">
          <span>Property</span>
          <input
            :value="layer.states.hover.transition.property"
            :disabled="isLocked"
            @change="updateTransitionValue('property', $event.target.value)"
          />
        </label>
        <SelectInput
          label="Easing"
          :model-value="layer.states.hover.transition.easing"
          :options="easingOptions"
          :disabled="isLocked"
          @change="updateTransitionValue('easing', $event)"
        />
        <NumberInput
          label="Duration"
          :model-value="layer.states.hover.transition.duration"
          unit="ms"
          :disabled="isLocked"
          @change="updateTransitionValue('duration', $event)"
        />
        <NumberInput
          label="Delay"
          :model-value="layer.states.hover.transition.delay"
          unit="ms"
          :disabled="isLocked"
          @change="updateTransitionValue('delay', $event)"
        />
      </div>
    </SectionCard>
  </section>
</template>
