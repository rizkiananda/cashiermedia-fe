<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import { ritaseApi } from '@/api'
import { rupiah, angka } from '@/utils/format'

type TabKey = 'detail' | 'sopir' | 'kernet'
const tab = ref<TabKey>('sopir')
const tabs: { key: TabKey; label: string }[] = [
  { key: 'sopir', label: 'Rekap Sopir' },
  { key: 'kernet', label: 'Rekap Kernet' },
  { key: 'detail', label: 'Detail Ritase' },
]

const today = new Date()
const startDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const endDate = ref(new Date())
const loading = ref(false)
const rows = ref<any[]>([])

function fmt(d: Date) {
  return d.toISOString().substring(0, 10)
}

async function load() {
  loading.value = true
  const s = fmt(startDate.value)
  const e = fmt(endDate.value)
  try {
    const res = tab.value === 'sopir' ? await ritaseApi.sopir(s, e) : tab.value === 'kernet' ? await ritaseApi.kernet(s, e) : await ritaseApi.list(s, e)
    rows.value = res.data
  } finally {
    loading.value = false
  }
}

function switchTab(k: TabKey) {
  tab.value = k
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i class="pi pi-map"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Laporan Ritase</h1>
        <p class="text-sm text-slate-500">Rekap ritase kendaraan, sopir & kernet</p>
      </div>
    </div>

    <div class="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end">
      <div>
        <label class="mb-1 block text-xs font-medium text-slate-500">Dari</label>
        <DatePicker v-model="startDate" date-format="dd/mm/yy" />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-slate-500">Sampai</label>
        <DatePicker v-model="endDate" date-format="dd/mm/yy" />
      </div>
      <Button label="Terapkan" icon="pi pi-filter" @click="load" />
    </div>

    <div class="mb-4 flex gap-2 overflow-x-auto">
      <button v-for="t in tabs" :key="t.key"
        class="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium"
        :class="tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="switchTab(t.key)"
      >{{ t.label }}</button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable v-if="tab === 'sopir'" :value="rows" :loading="loading" paginator :rows="12" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column field="sopir" header="Sopir" />
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column header="Rit 1"><template #body="{ data }">{{ rupiah(data.rit1) }}</template></Column>
        <Column header="Rit 2"><template #body="{ data }">{{ rupiah(data.rit2) }}</template></Column>
        <Column header="Rit 3"><template #body="{ data }">{{ rupiah(data.rit3) }}</template></Column>
        <Column header="Rit 4"><template #body="{ data }">{{ rupiah(data.rit4) }}</template></Column>
        <Column header="Total"><template #body="{ data }"><span class="font-semibold">{{ rupiah(data.total) }}</span></template></Column>
      </DataTable>

      <DataTable v-else-if="tab === 'kernet'" :value="rows" :loading="loading" paginator :rows="12" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column field="kernet" header="Kernet" />
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column header="Rit 1"><template #body="{ data }">{{ rupiah(data.rit1) }}</template></Column>
        <Column header="Rit 2"><template #body="{ data }">{{ rupiah(data.rit2) }}</template></Column>
        <Column header="Rit 3"><template #body="{ data }">{{ rupiah(data.rit3) }}</template></Column>
        <Column header="Rit 4"><template #body="{ data }">{{ rupiah(data.rit4) }}</template></Column>
        <Column header="Total"><template #body="{ data }"><span class="font-semibold">{{ rupiah(data.total) }}</span></template></Column>
      </DataTable>

      <DataTable v-else :value="rows" :loading="loading" paginator :rows="12" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column field="no_polisi" header="No. Polisi" />
        <Column field="sopir" header="Sopir" />
        <Column field="kernet" header="Kernet" />
        <Column field="nama_barang" header="Barang" />
        <Column header="Jumlah"><template #body="{ data }">{{ angka(data.jumlah) }} {{ data.satuan }}</template></Column>
        <Column field="rit" header="Rit" />
      </DataTable>
    </div>
  </div>
</template>
