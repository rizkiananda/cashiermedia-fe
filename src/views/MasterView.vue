<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CrudTable from '@/components/CrudTable.vue'
import { masterEntities, apiFor } from '@/config/masterEntities'

const route = useRoute()
const entity = computed(() => masterEntities[route.params.entity as string])
const api = computed(() => (entity.value ? apiFor(entity.value) : null))
</script>

<template>
  <div v-if="entity" :key="entity.slug">
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i :class="entity.icon"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Master {{ entity.title }}</h1>
        <p class="text-sm text-slate-500">Kelola data {{ entity.title.toLowerCase() }}</p>
      </div>
    </div>

    <CrudTable
      v-if="api"
      :title="entity.title"
      :api="api"
      :columns="entity.columns"
      :fields="entity.fields"
      :entity-label="entity.title"
    />
  </div>
  <div v-else class="py-20 text-center text-slate-400">
    <i class="pi pi-exclamation-circle text-4xl"></i>
    <p class="mt-2">Entitas master tidak ditemukan.</p>
  </div>
</template>
