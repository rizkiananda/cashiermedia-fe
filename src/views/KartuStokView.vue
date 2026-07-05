<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import AutoComplete from 'primevue/autocomplete'
import { catalogApi, stokApi } from '@/api'
import { angka } from '@/utils/format'
import type { Barang } from '@/types'

const suggestions = ref<Barang[]>([])
const picked = ref<Barang | null>(null)
const rows = ref<any[]>([])
const loading = ref(false)

async function searchBarang(e: { query: string }) {
  suggestions.value = await catalogApi.barang(e.query)
}

async function onPick() {
  if (!picked.value) return
  loading.value = true
  try {
    rows.value = await stokApi.kartu(picked.value.id)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i class="pi pi-book"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Kartu Stok</h1>
        <p class="text-sm text-slate-500">Riwayat mutasi stok per barang (opname, beli, jual, retur, mutasi)</p>
      </div>
    </div>

    <div class="mb-4 max-w-md">
      <AutoComplete
        v-model="picked"
        :suggestions="suggestions"
        option-label="nama_barang"
        placeholder="Cari barang untuk melihat kartu stok…"
        fluid
        complete-on-focus
        @complete="searchBarang"
        @item-select="onPick"
      >
        <template #option="{ option }">
          <div>
            <p class="font-medium">{{ option.nama_barang }}</p>
            <p class="text-xs text-slate-400">{{ option.kode_barang }}</p>
          </div>
        </template>
      </AutoComplete>
    </div>

    <div v-if="picked" class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="15" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Belum ada riwayat mutasi untuk barang ini.</div></template>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }} {{ data.jam }}</template></Column>
        <Column field="nama_golongan" header="Golongan" />
        <Column header="Opname"><template #body="{ data }">{{ angka(data.opname) }}</template></Column>
        <Column header="Beli"><template #body="{ data }">{{ angka(data.beli) }}</template></Column>
        <Column header="Retur"><template #body="{ data }">{{ angka(data.retur) }}</template></Column>
        <Column header="Jual"><template #body="{ data }">{{ angka(data.jual) }}</template></Column>
        <Column header="Mutasi Masuk"><template #body="{ data }">{{ angka(data.mutasi_masuk) }}</template></Column>
        <Column header="Mutasi Keluar"><template #body="{ data }">{{ angka(data.mutasi_keluar) }}</template></Column>
        <Column header="Sisa"><template #body="{ data }"><span class="font-semibold">{{ angka(data.sisa1) }}</span></template></Column>
      </DataTable>
    </div>
    <div v-else class="py-20 text-center text-slate-400">
      <i class="pi pi-search text-3xl opacity-40"></i>
      <p class="mt-2 text-sm">Pilih barang untuk melihat kartu stoknya.</p>
    </div>
  </div>
</template>
