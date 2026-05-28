<script>
import CanvasWorkspace from '../canvas/CanvasWorkspace.vue'
import BottomOutputPanel from './BottomOutputPanel.vue'
import LeftToolPanel from './LeftToolPanel.vue'
import RightPanel from './RightPanel.vue'
import TopToolbar from './TopToolbar.vue'

export default {
  name: 'AppShell',
  components: {
    BottomOutputPanel,
    CanvasWorkspace,
    LeftToolPanel,
    RightPanel,
    TopToolbar,
  },
}
</script>

<template>
  <div class="cf-app-shell">
    <TopToolbar />

    <main class="cf-main-body">
      <LeftToolPanel />
      <section class="cf-center-area">
        <CanvasWorkspace />
      </section>
      <RightPanel />
    </main>

    <BottomOutputPanel />
  </div>
</template>
