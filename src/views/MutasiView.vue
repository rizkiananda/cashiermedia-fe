<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import AutoComplete from 'primevue/autocomplete'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { mutasiApi, catalogApi, perusahaanApi } from '@/api'
import { errorMessage } from '@/api/client'
import { angka } from '@/utils/format'
import type { Barang } from '@/types'

const toast = useToast()

const rows = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)

const perusahaanOpts = ref<{ label: string; value: number }[]>([])
const suggestions = ref<Barang[]>([])
const picked = ref<Barang | null>(null)
const satuanOpts = ref<{ label: string; value: number }[]>([])

const form = reactive({ id_satuan: 0, jumlah: 1, perusahaan_tujuan: 0 })

onMounted(async () => {
  await Promise.all([load(), loadPerusahaan()])
})

async function load() {
  loading.value = true
  try {
    rows.value = await mutasiApi.list()
  } finally {
    loading.value = false
  }
}
async function loadPerusahaan() {
  const p = await perusahaanApi.list()
  perusahaanOpts.value = p.map((x) => ({ label: x.nama_perusahaan, value: x.id }))
}

async function searchBarang(e: { query: string }) {
  suggestions.value = await catalogApi.barang(e.query)
}
function onPickBarang() {
  satuanOpts.value = (picked.value?.items ?? []).map((it) => ({ label: it.nama_satuan, value: it.id_satuan }))
  form.id_satuan = satuanOpts.value[0]?.value ?? 0
}

function openForm() {
  picked.value = null
  satuanOpts.value = []
  Object.assign(form, { id_satuan: 0, jumlah: 1, perusahaan_tujuan: 0 })
  dialog.value = true
}

async function save() {
  if (!picked.value || !form.id_satuan || !form.perusahaan_tujuan) {
    toast.add({ severity: 'warn', summary: 'Lengkapi', detail: 'Pilih barang, satuan, dan tujuan', life: 2500 })
    return
  }
  saving.value = true
  try {
    await mutasiApi.create({ id_barang: picked.value.id, id_satuan: form.id_satuan, jumlah: form.jumlah, perusahaan_tujuan: form.perusahaan_tujuan })
    toast.add({ severity: 'success', summary: 'Mutasi berhasil', detail: 'Stok telah dipindahkan', life: 2500 })
    dialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3500 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <i class="pi pi-arrow-right-arrow-left"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Mutasi Antar Gudang</h1>
          <p class="text-sm text-slate-500">Transfer stok antar perusahaan/gudang</p>
        </div>
      </div>
      <Button label="Mutasi Baru" icon="pi pi-plus" @click="openForm" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Belum ada mutasi.</div></template>
        <Column field="no_mutasi" header="No" style="width: 5rem" />
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column field="nama_barang" header="Barang" />
        <Column field="perusahaan_awal" header="Dari" />
        <Column field="perusahaan_mutasi" header="Ke" />
        <Column header="Jumlah"><template #body="{ data }">{{ angka(data.jumlah) }} {{ data.nama_satuan }}</template></Column>
        <Column header="Status">
          <template #body="{ data }"><Tag :value="data.status" severity="success" /></template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="dialog" modal header="Mutasi Barang Baru" :style="{ width: '30rem' }" class="mx-4">
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Barang</label>
          <AutoComplete v-model="picked" :suggestions="suggestions" option-label="nama_barang" placeholder="Cari barang…" fluid complete-on-focus @complete="searchBarang" @item-select="onPickBarang" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <Select v-model="form.id_satuan" :options="satuanOpts" option-label="label" option-value="value" placeholder="Satuan" fluid />
          <InputNumber v-model="form.jumlah" :min="1" placeholder="Jumlah" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Perusahaan/Gudang Tujuan</label>
          <Select v-model="form.perusahaan_tujuan" :options="perusahaanOpts" option-label="label" option-value="value" filter placeholder="Pilih tujuan" fluid />
        </div>
        <p class="rounded-lg bg-sky-50 p-3 text-xs text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          Stok akan langsung dikurangi dari gudang Anda dan ditambahkan ke gudang tujuan.
        </p>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
