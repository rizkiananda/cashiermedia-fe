<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import AutoComplete from 'primevue/autocomplete'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { diskonApi, promoApi, catalogApi, type StrataInput } from '@/api'
import { errorMessage } from '@/api/client'
import type { Barang } from '@/types'

const toast = useToast()
const confirm = useConfirm()

type TabKey = 'strata' | 'promo'
const tab = ref<TabKey>('strata')

// ==== Diskon strata ====
const diskonRows = ref<any[]>([])
const loadingDiskon = ref(false)
const diskonDialog = ref(false)
const savingDiskon = ref(false)
const pickedBarang = ref<Barang | null>(null)
const suggestions = ref<Barang[]>([])
const satuanOpts = ref<{ label: string; value: number }[]>([])

const diskonForm = reactive<{
  id_satuan: number
  tanggal_awal: Date
  tanggal_akhir: Date
  strata: StrataInput[]
}>({
  id_satuan: 0,
  tanggal_awal: new Date(),
  tanggal_akhir: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  strata: [{ min_transaksi: 1, harga_diskon: 0 }],
})

async function searchBarang(e: { query: string }) {
  suggestions.value = await catalogApi.barang(e.query)
}
function onPickBarang() {
  satuanOpts.value = (pickedBarang.value?.items ?? []).map((it) => ({ label: it.nama_satuan, value: it.id_satuan }))
  diskonForm.id_satuan = satuanOpts.value[0]?.value ?? 0
}

async function loadDiskon() {
  loadingDiskon.value = true
  try {
    diskonRows.value = await diskonApi.list()
  } finally {
    loadingDiskon.value = false
  }
}

function openDiskonForm() {
  pickedBarang.value = null
  satuanOpts.value = []
  Object.assign(diskonForm, {
    id_satuan: 0,
    tanggal_awal: new Date(),
    tanggal_akhir: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    strata: [{ min_transaksi: 1, harga_diskon: 0 }],
  })
  diskonDialog.value = true
}
function addStrata() {
  diskonForm.strata.push({ min_transaksi: 1, harga_diskon: 0 })
}
function removeStrata(i: number) {
  if (diskonForm.strata.length > 1) diskonForm.strata.splice(i, 1)
}

async function saveDiskon() {
  if (!pickedBarang.value || !diskonForm.id_satuan) {
    toast.add({ severity: 'warn', summary: 'Lengkapi', detail: 'Pilih barang & satuan', life: 2500 })
    return
  }
  savingDiskon.value = true
  try {
    await diskonApi.create({
      id_barang: pickedBarang.value.id,
      id_satuan: diskonForm.id_satuan,
      tanggal_awal: diskonForm.tanggal_awal.toISOString().substring(0, 10),
      tanggal_akhir: diskonForm.tanggal_akhir.toISOString().substring(0, 10),
      strata: diskonForm.strata,
    })
    toast.add({ severity: 'success', summary: 'Diskon tersimpan', life: 2000 })
    diskonDialog.value = false
    await loadDiskon()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3500 })
  } finally {
    savingDiskon.value = false
  }
}

function confirmDeleteDiskon(row: any) {
  confirm.require({
    message: 'Hapus diskon ini?',
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await diskonApi.remove(row.id)
      toast.add({ severity: 'success', summary: 'Terhapus', life: 2000 })
      await loadDiskon()
    },
  })
}

// ==== Promo hadiah ====
const promoRows = ref<any[]>([])
const loadingPromo = ref(false)
const promoDialog = ref(false)
const savingPromo = ref(false)
const pickedBarangPromo = ref<Barang | null>(null)
const pickedHadiah = ref<Barang | null>(null)
const suggestionsPromo = ref<Barang[]>([])
const suggestionsHadiah = ref<Barang[]>([])

const promoForm = reactive({
  kelipatan_beli: 1,
  tanggal_awal: new Date(),
  tanggal_akhir: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  jumlah_hadiah: 1,
  satuan_hadiah: 0,
})
const hadiahSatuanOpts = ref<{ label: string; value: number }[]>([])

async function searchBarangPromo(e: { query: string }) {
  suggestionsPromo.value = await catalogApi.barang(e.query)
}
async function searchHadiah(e: { query: string }) {
  suggestionsHadiah.value = await catalogApi.barang(e.query)
}
function onPickHadiah() {
  hadiahSatuanOpts.value = (pickedHadiah.value?.items ?? []).map((it) => ({ label: it.nama_satuan, value: it.id_satuan }))
  promoForm.satuan_hadiah = hadiahSatuanOpts.value[0]?.value ?? 0
}

async function loadPromo() {
  loadingPromo.value = true
  try {
    promoRows.value = await promoApi.list()
  } finally {
    loadingPromo.value = false
  }
}
function openPromoForm() {
  pickedBarangPromo.value = null
  pickedHadiah.value = null
  hadiahSatuanOpts.value = []
  Object.assign(promoForm, {
    kelipatan_beli: 1,
    tanggal_awal: new Date(),
    tanggal_akhir: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    jumlah_hadiah: 1,
    satuan_hadiah: 0,
  })
  promoDialog.value = true
}
async function savePromo() {
  if (!pickedBarangPromo.value || !pickedHadiah.value) {
    toast.add({ severity: 'warn', summary: 'Lengkapi', detail: 'Pilih barang & hadiah', life: 2500 })
    return
  }
  savingPromo.value = true
  try {
    await promoApi.create({
      barang: pickedBarangPromo.value.id,
      kelipatan_beli: promoForm.kelipatan_beli,
      tanggal_awal: promoForm.tanggal_awal.toISOString().substring(0, 10),
      tanggal_akhir: promoForm.tanggal_akhir.toISOString().substring(0, 10),
      hadiah: pickedHadiah.value.id,
      jumlah_hadiah: promoForm.jumlah_hadiah,
      satuan_hadiah: promoForm.satuan_hadiah,
    })
    toast.add({ severity: 'success', summary: 'Promo tersimpan', life: 2000 })
    promoDialog.value = false
    await loadPromo()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3500 })
  } finally {
    savingPromo.value = false
  }
}
function confirmDeletePromo(row: any) {
  confirm.require({
    message: 'Hapus promo ini?',
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await promoApi.remove(row.id)
      toast.add({ severity: 'success', summary: 'Terhapus', life: 2000 })
      await loadPromo()
    },
  })
}

onMounted(() => {
  loadDiskon()
  loadPromo()
})
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i class="pi pi-percentage"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Diskon & Promo</h1>
        <p class="text-sm text-slate-500">Diskon strata per barang dan promo beli-kelipatan-dapat-hadiah</p>
      </div>
    </div>

    <div class="mb-4 flex gap-2">
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        :class="tab === 'strata' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="tab = 'strata'"
      >
        <i class="pi pi-list"></i> Diskon Strata
      </button>
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        :class="tab === 'promo' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="tab = 'promo'"
      >
        <i class="pi pi-gift"></i> Promo Hadiah
      </button>
    </div>

    <!-- Diskon strata -->
    <div v-if="tab === 'strata'">
      <div class="mb-4 flex justify-end"><Button label="Tambah Diskon" icon="pi pi-plus" @click="openDiskonForm" /></div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="diskonRows" :loading="loadingDiskon" paginator :rows="10" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Belum ada diskon strata.</div></template>
          <Column field="nama_barang" header="Barang" />
          <Column field="nama_satuan" header="Satuan" />
          <Column header="Periode">
            <template #body="{ data }">{{ data.tanggal_awal?.substring(0, 10) }} s/d {{ data.tanggal_akhir?.substring(0, 10) }}</template>
          </Column>
          <Column header="Aksi" style="width: 5rem">
            <template #body="{ data }"><Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeleteDiskon(data)" /></template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Promo -->
    <div v-else>
      <div class="mb-4 flex justify-end"><Button label="Tambah Promo" icon="pi pi-plus" @click="openPromoForm" /></div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="promoRows" :loading="loadingPromo" paginator :rows="10" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Belum ada promo.</div></template>
          <Column field="nama_barang" header="Beli Barang" />
          <Column field="kelipatan_beli" header="Kelipatan" />
          <Column field="nama_hadiah" header="Hadiah" />
          <Column field="jumlah_hadiah" header="Jumlah Hadiah" />
          <Column header="Periode">
            <template #body="{ data }">{{ data.tanggal_awal?.substring(0, 10) }} s/d {{ data.tanggal_akhir?.substring(0, 10) }}</template>
          </Column>
          <Column header="Aksi" style="width: 5rem">
            <template #body="{ data }"><Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeletePromo(data)" /></template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Dialog diskon strata -->
    <Dialog v-model:visible="diskonDialog" modal header="Tambah Diskon Strata" :style="{ width: '34rem' }" class="mx-4">
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Barang</label>
          <AutoComplete v-model="pickedBarang" :suggestions="suggestions" option-label="nama_barang" placeholder="Cari barang…" fluid complete-on-focus @complete="searchBarang" @item-select="onPickBarang" />
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select v-model="diskonForm.id_satuan" :options="satuanOpts" option-label="label" option-value="value" placeholder="Satuan" fluid />
          <DatePicker v-model="diskonForm.tanggal_awal" date-format="dd/mm/yy" placeholder="Mulai" fluid />
          <DatePicker v-model="diskonForm.tanggal_akhir" date-format="dd/mm/yy" placeholder="Sampai" fluid />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Strata Harga (min. qty → harga)</label>
          <div v-for="(s, i) in diskonForm.strata" :key="i" class="flex items-center gap-2">
            <InputNumber v-model="s.min_transaksi" :min="1" placeholder="Min. Qty" class="flex-1" fluid />
            <InputNumber v-model="s.harga_diskon" :min="0" mode="currency" currency="IDR" locale="id-ID" placeholder="Harga" class="flex-1" fluid />
            <Button icon="pi pi-times" text rounded severity="danger" @click="removeStrata(i)" />
          </div>
          <Button label="Tambah Strata" icon="pi pi-plus" text size="small" @click="addStrata" />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="diskonDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="savingDiskon" @click="saveDiskon" />
      </template>
    </Dialog>

    <!-- Dialog promo -->
    <Dialog v-model:visible="promoDialog" modal header="Tambah Promo Hadiah" :style="{ width: '34rem' }" class="mx-4">
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Barang (syarat pembelian)</label>
          <AutoComplete v-model="pickedBarangPromo" :suggestions="suggestionsPromo" option-label="nama_barang" placeholder="Cari barang…" fluid complete-on-focus @complete="searchBarangPromo" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Kelipatan Pembelian (Rp)</label>
          <InputNumber v-model="promoForm.kelipatan_beli" :min="1" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DatePicker v-model="promoForm.tanggal_awal" date-format="dd/mm/yy" placeholder="Mulai" fluid />
          <DatePicker v-model="promoForm.tanggal_akhir" date-format="dd/mm/yy" placeholder="Sampai" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Barang Hadiah</label>
          <AutoComplete v-model="pickedHadiah" :suggestions="suggestionsHadiah" option-label="nama_barang" placeholder="Cari barang hadiah…" fluid complete-on-focus @complete="searchHadiah" @item-select="onPickHadiah" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <Select v-model="promoForm.satuan_hadiah" :options="hadiahSatuanOpts" option-label="label" option-value="value" placeholder="Satuan Hadiah" fluid />
          <InputNumber v-model="promoForm.jumlah_hadiah" :min="1" placeholder="Jumlah Hadiah" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="promoDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="savingPromo" @click="savePromo" />
      </template>
    </Dialog>
  </div>
</template>
