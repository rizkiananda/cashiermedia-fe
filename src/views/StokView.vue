<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import AutoComplete from 'primevue/autocomplete'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { stokApi, catalogApi } from '@/api'
import { errorMessage } from '@/api/client'
import { angka } from '@/utils/format'
import type { Barang, HargaItem } from '@/types'

const toast = useToast()

const rows = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const first = ref(0)
const search = ref('')
const lowOnly = ref(false)
let searchTimer: ReturnType<typeof setTimeout>

const opnameDialog = ref(false)
const suggestions = ref<Barang[]>([])
const picked = ref<Barang | null>(null)
const opnameForm = reactive({ id_satuan: 0, jumlah_fisik: 0 })
const saving = ref(false)

const historyDialog = ref(false)
const history = ref<any[]>([])

onMounted(load)

async function load() {
  loading.value = true
  try {
    const res = await stokApi.list({ search: search.value, page: page.value, limit: limit.value, low: lowOnly.value ? '1' : '' })
    rows.value = res.data
    total.value = res.total
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  } finally {
    loading.value = false
  }
}

function onPage(e: { page: number; rows: number; first: number }) {
  page.value = e.page + 1
  limit.value = e.rows
  first.value = e.first
  load()
}
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; first.value = 0; load() }, 350)
}
function toggleLow() {
  page.value = 1; first.value = 0; load()
}

async function searchBarang(e: { query: string }) {
  suggestions.value = await catalogApi.barang(e.query)
}
function onPickBarang() {
  const opt: HargaItem | undefined = picked.value?.items[0]
  opnameForm.id_satuan = opt?.id_satuan ?? 0
}
function openOpname(row?: any) {
  picked.value = null
  Object.assign(opnameForm, { id_satuan: 0, jumlah_fisik: 0 })
  if (row) {
    // preload the barang
    catalogApi.barang(row.nama_barang).then((list) => {
      picked.value = list.find((b) => b.id === row.id) ?? null
      if (picked.value?.items[0]) opnameForm.id_satuan = picked.value.items[0].id_satuan
    })
  }
  opnameDialog.value = true
}
async function saveOpname() {
  if (!picked.value || !opnameForm.id_satuan) {
    toast.add({ severity: 'warn', summary: 'Lengkapi', detail: 'Pilih barang & satuan', life: 2500 })
    return
  }
  saving.value = true
  try {
    await stokApi.opname({ id_barang: picked.value.id, id_satuan: opnameForm.id_satuan, jumlah_fisik: opnameForm.jumlah_fisik })
    toast.add({ severity: 'success', summary: 'Stok disesuaikan', life: 2000 })
    opnameDialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  } finally {
    saving.value = false
  }
}

async function openHistory() {
  historyDialog.value = true
  history.value = await stokApi.riwayatOpname()
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <i class="pi pi-database"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Stok Barang</h1>
          <p class="text-sm text-slate-500">Pantau & sesuaikan stok</p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button label="Riwayat" icon="pi pi-history" outlined severity="secondary" @click="openHistory" />
        <Button label="Opname" icon="pi pi-check-square" @click="openOpname()" />
      </div>
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span class="relative w-full sm:max-w-xs">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <InputText v-model="search" placeholder="Cari barang…" class="w-full !pl-10" @input="onSearch" />
      </span>
      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <ToggleSwitch v-model="lowOnly" @change="toggleLow" /> Hanya stok menipis (≤10)
      </label>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" lazy paginator :rows="limit" :total-records="total" :first="first"
                 :rows-per-page-options="[10, 20, 50]" data-key="id" class="text-sm" @page="onPage">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data.</div></template>
        <Column field="kode_barang" header="Kode" style="width: 8rem" />
        <Column field="nama_barang" header="Nama Barang" />
        <Column field="nama_golongan" header="Golongan" />
        <Column field="stok" header="Stok" style="width: 8rem">
          <template #body="{ data }">
            <Tag :value="angka(data.stok)" :severity="data.stok <= 0 ? 'danger' : data.stok <= 10 ? 'warn' : 'success'" />
          </template>
        </Column>
        <Column header="Aksi" style="width: 6rem">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" text rounded size="small" v-tooltip.left="'Opname'" @click="openOpname(data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog opname -->
    <Dialog v-model:visible="opnameDialog" modal header="Stok Opname / Penyesuaian" :style="{ width: '30rem' }" class="mx-4">
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Barang</label>
          <AutoComplete v-model="picked" :suggestions="suggestions" option-label="nama_barang" placeholder="Cari barang…" fluid complete-on-focus @complete="searchBarang" @item-select="onPickBarang" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Satuan</label>
            <Select v-model="opnameForm.id_satuan" :options="picked?.items ?? []" option-label="nama_satuan" option-value="id_satuan" placeholder="Satuan" fluid />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah Fisik</label>
            <InputNumber v-model="opnameForm.jumlah_fisik" :min="0" fluid />
          </div>
        </div>
        <p class="rounded-lg bg-sky-50 p-3 text-xs text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          Stok akan diset sesuai jumlah fisik (dikali konversi satuan ke satuan dasar).
        </p>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="opnameDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="saveOpname" />
      </template>
    </Dialog>

    <!-- Dialog riwayat -->
    <Dialog v-model:visible="historyDialog" modal header="Riwayat Opname" :style="{ width: '40rem' }" class="mx-4">
      <DataTable :value="history" paginator :rows="8" class="text-sm">
        <template #empty><div class="py-6 text-center text-slate-400">Belum ada riwayat.</div></template>
        <Column field="nama_barang" header="Barang" />
        <Column field="nama_satuan" header="Satuan" />
        <Column field="stok_awal" header="Awal" />
        <Column field="stok" header="Jadi" />
        <Column header="Tanggal">
          <template #body="{ data }">{{ data.tanggal?.substring(0, 10) }} {{ data.jam }}</template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template>
