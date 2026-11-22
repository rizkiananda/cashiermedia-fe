<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
</script>

<template>
  <RouterView />
  <Toast position="top-right" />
  <ConfirmDialog :style="{ width: '30rem' }" :breakpoints="{ '575px': 'calc(100vw - 2.5rem)' }" />
</template>
