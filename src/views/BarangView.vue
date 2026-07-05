<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { barangApi, crudApi, type BarangListRow, type BarangHarga } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah, tipePelangganLabel } from '@/utils/format'

const toast = useToast()
const confirm = useConfirm()

const rows = ref<BarangListRow[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const first = ref(0)
const search = ref('')
let searchTimer: ReturnType<typeof setTimeout>

const golonganOpts = ref<{ label: string; value: number }[]>([])
const supplierOpts = ref<{ label: string; value: number }[]>([])
const satuanOpts = ref<{ label: string; value: number }[]>([])

// Dialog barang
const barangDialog = ref(false)
const editingBarang = ref<BarangListRow | null>(null)
const barangForm = reactive({ kode_barang: '', nama_barang: '', id_golongan: 0, id_supplier: 0, status: 'aktif' })
const savingBarang = ref(false)

// Dialog harga
const hargaDialog = ref(false)
const hargaBarang = ref<BarangListRow | null>(null)
const hargaList = ref<BarangHarga[]>([])
const hargaForm = reactive({ id_satuan: 0, harga_jual: 0, konversi: 1, tipe_pelanggan: 3, kode: '' })
const savingHarga = ref(false)

const tipeOpts = [
  { label: 'Grosir', value: 1 },
  { label: 'Semi Grosir', value: 2 },
  { label: 'Retail', value: 3 },
]

onMounted(async () => {
  await Promise.all([load(), loadRefs()])
})

async function loadRefs() {
  const [gol, sup, sat] = await Promise.all([
    crudApi<any>('/master/golongan').list(),
    crudApi<any>('/master/supplier').list(),
    crudApi<any>('/master/satuan').list(),
  ])
  golonganOpts.value = gol.map((g: any) => ({ label: g.nama_golongan, value: g.id }))
  supplierOpts.value = sup.map((s: any) => ({ label: s.nama_supplier, value: s.id }))
  satuanOpts.value = sat.map((s: any) => ({ label: s.nama_satuan, value: s.id }))
}

async function load() {
  loading.value = true
  try {
    const res = await barangApi.list({ search: search.value, page: page.value, limit: limit.value })
    rows.value = res.data
    total.value = res.total
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat', detail: errorMessage(e), life: 3000 })
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
  searchTimer = setTimeout(() => {
    page.value = 1
    first.value = 0
    load()
  }, 350)
}

function openCreateBarang() {
  editingBarang.value = null
  Object.assign(barangForm, { kode_barang: '', nama_barang: '', id_golongan: 0, id_supplier: 0, status: 'aktif' })
  barangDialog.value = true
}
function openEditBarang(row: BarangListRow) {
  editingBarang.value = row
  Object.assign(barangForm, {
    kode_barang: row.kode_barang,
    nama_barang: row.nama_barang,
    id_golongan: row.id_golongan,
    id_supplier: row.id_supplier,
    status: row.status,
  })
  barangDialog.value = true
}
async function saveBarang() {
  if (!barangForm.nama_barang.trim()) {
    toast.add({ severity: 'warn', summary: 'Lengkapi', detail: 'Nama barang wajib diisi', life: 3000 })
    return
  }
  savingBarang.value = true
  try {
    if (editingBarang.value) await barangApi.update(editingBarang.value.id, barangForm)
    else await barangApi.create(barangForm)
    toast.add({ severity: 'success', summary: 'Tersimpan', life: 2000 })
    barangDialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  } finally {
    savingBarang.value = false
  }
}
function confirmDeleteBarang(row: BarangListRow) {
  confirm.require({
    message: `Hapus barang "${row.nama_barang}" beserta seluruh harganya?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await barangApi.remove(row.id)
        toast.add({ severity: 'success', summary: 'Terhapus', life: 2000 })
        await load()
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
      }
    },
  })
}

async function openHarga(row: BarangListRow) {
  hargaBarang.value = row
  hargaDialog.value = true
  Object.assign(hargaForm, { id_satuan: 0, harga_jual: 0, konversi: 1, tipe_pelanggan: 3, kode: '' })
  await refreshHarga()
}
async function refreshHarga() {
  if (!hargaBarang.value) return
  const detail = await barangApi.detail(hargaBarang.value.id)
  hargaList.value = detail.harga
}
async function addHarga() {
  if (!hargaBarang.value) return
  if (!hargaForm.id_satuan) {
    toast.add({ severity: 'warn', summary: 'Pilih satuan', life: 2500 })
    return
  }
  savingHarga.value = true
  try {
    await barangApi.addHarga(hargaBarang.value.id, hargaForm)
    Object.assign(hargaForm, { id_satuan: 0, harga_jual: 0, konversi: 1, tipe_pelanggan: 3, kode: '' })
    await refreshHarga()
    toast.add({ severity: 'success', summary: 'Harga ditambahkan', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  } finally {
    savingHarga.value = false
  }
}
async function removeHarga(h: BarangHarga) {
  try {
    await barangApi.removeHarga(h.id)
    await refreshHarga()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  }
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i class="pi pi-box"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Master Barang</h1>
        <p class="text-sm text-slate-500">Kelola barang & harga jual per satuan</p>
      </div>
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span class="relative w-full sm:max-w-xs">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <InputText v-model="search" placeholder="Cari nama / kode barang…" class="w-full !pl-10" @input="onSearch" />
      </span>
      <Button label="Tambah Barang" icon="pi pi-plus" @click="openCreateBarang" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable
        :value="rows"
        :loading="loading"
        lazy
        paginator
        :rows="limit"
        :total-records="total"
        :first="first"
        :rows-per-page-options="[10, 20, 50]"
        data-key="id"
        class="text-sm"
        @page="onPage"
      >
        <template #empty><div class="py-10 text-center text-slate-400">Barang tidak ditemukan.</div></template>
        <Column field="kode_barang" header="Kode" style="width: 8rem" />
        <Column field="nama_barang" header="Nama Barang" />
        <Column field="nama_golongan" header="Golongan" />
        <Column header="Harga">
          <template #body="{ data }">
            <span v-if="data.jumlah_harga">{{ rupiah(data.harga_terendah) }}
              <span class="text-xs text-slate-400">({{ data.jumlah_harga }} satuan)</span>
            </span>
            <Tag v-else value="Belum ada" severity="warn" />
          </template>
        </Column>
        <Column field="stok" header="Stok" style="width: 6rem" />
        <Column field="status" header="Status" style="width: 7rem">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="data.status === 'aktif' ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="Aksi" style="width: 10rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-dollar" text rounded size="small" severity="help" @click="openHarga(data)" v-tooltip.top="'Kelola harga'" />
              <Button icon="pi pi-pencil" text rounded size="small" @click="openEditBarang(data)" v-tooltip.top="'Ubah'" />
              <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeleteBarang(data)" v-tooltip.top="'Hapus'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog Barang -->
    <Dialog v-model:visible="barangDialog" modal :header="editingBarang ? 'Ubah Barang' : 'Tambah Barang'" :style="{ width: '32rem' }" class="mx-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Barang *</label>
          <InputText v-model="barangForm.nama_barang" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Kode Barang</label>
          <InputText v-model="barangForm.kode_barang" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <Select v-model="barangForm.status" :options="[{label:'Aktif',value:'aktif'},{label:'Nonaktif',value:'nonaktif'}]" option-label="label" option-value="value" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Golongan</label>
          <Select v-model="barangForm.id_golongan" :options="golonganOpts" option-label="label" option-value="value" filter placeholder="Pilih golongan" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Supplier</label>
          <Select v-model="barangForm.id_supplier" :options="supplierOpts" option-label="label" option-value="value" filter placeholder="Pilih supplier" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="barangDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="savingBarang" @click="saveBarang" />
      </template>
    </Dialog>

    <!-- Dialog Harga -->
    <Dialog v-model:visible="hargaDialog" modal :header="`Harga: ${hargaBarang?.nama_barang}`" :style="{ width: '42rem' }" class="mx-4">
      <!-- Daftar harga -->
      <div class="mb-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table class="w-full text-sm">
          <thead class="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th class="p-2">Satuan</th><th class="p-2">Tipe</th><th class="p-2">Isi</th><th class="p-2 text-right">Harga</th><th class="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hargaList" :key="h.id" class="border-t border-slate-100 dark:border-slate-800">
              <td class="p-2 font-medium">{{ h.nama_satuan }}</td>
              <td class="p-2">{{ tipePelangganLabel(h.tipe_pelanggan) }}</td>
              <td class="p-2">{{ h.konversi }}</td>
              <td class="p-2 text-right font-semibold">{{ rupiah(h.harga_jual) }}</td>
              <td class="p-2 text-right">
                <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeHarga(h)" />
              </td>
            </tr>
            <tr v-if="!hargaList.length"><td colspan="5" class="p-4 text-center text-slate-400">Belum ada harga.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Form tambah harga -->
      <div class="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/60">
        <p class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Tambah harga</p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Select v-model="hargaForm.id_satuan" :options="satuanOpts" option-label="label" option-value="value" filter placeholder="Satuan" class="col-span-2 sm:col-span-1" fluid />
          <Select v-model="hargaForm.tipe_pelanggan" :options="tipeOpts" option-label="label" option-value="value" placeholder="Tipe" fluid />
          <InputNumber v-model="hargaForm.konversi" :min="1" placeholder="Isi" fluid />
          <InputNumber v-model="hargaForm.harga_jual" mode="currency" currency="IDR" locale="id-ID" placeholder="Harga" fluid />
          <Button label="Tambah" icon="pi pi-plus" :loading="savingHarga" @click="addHarga" />
        </div>
      </div>

      <template #footer>
        <Button label="Selesai" @click="hargaDialog = false" />
      </template>
    </Dialog>
  </div>
</template>
