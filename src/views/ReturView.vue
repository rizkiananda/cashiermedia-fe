<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import { returApi, catalogApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'
import LineItemsEditor, { type LineItem } from '@/components/LineItemsEditor.vue'
import type { Pelanggan } from '@/types'

const toast = useToast()

const rows = ref<any[]>([])
const loading = ref(false)
const pelangganOpts = ref<{ label: string; value: number }[]>([])

const formDialog = ref(false)
const detailDialog = ref(false)
const detail = ref<any>(null)
const saving = ref(false)

const form = reactive<{ id_pelanggan: number; tanggal: Date; keterangan: string; items: LineItem[] }>({
  id_pelanggan: 0,
  tanggal: new Date(),
  keterangan: '',
  items: [],
})

onMounted(async () => {
  await Promise.all([load(), loadPelanggan()])
})

async function load() {
  loading.value = true
  try {
    rows.value = await returApi.list()
  } finally {
    loading.value = false
  }
}
async function loadPelanggan() {
  const p: Pelanggan[] = await catalogApi.pelanggan()
  pelangganOpts.value = p.map((x) => ({ label: x.nama_pelanggan, value: x.id }))
}

function openForm() {
  Object.assign(form, { id_pelanggan: 0, tanggal: new Date(), keterangan: '', items: [] })
  formDialog.value = true
}

async function save() {
  if (!form.id_pelanggan) {
    toast.add({ severity: 'warn', summary: 'Pilih pelanggan', life: 2500 })
    return
  }
  if (!form.items.length) {
    toast.add({ severity: 'warn', summary: 'Tambah barang', life: 2500 })
    return
  }
  saving.value = true
  try {
    await returApi.create({
      id_pelanggan: form.id_pelanggan,
      tanggal: form.tanggal.toISOString().substring(0, 10),
      keterangan: form.keterangan,
      items: form.items.map((l) => ({ id_barang: l.id_barang, id_satuan: l.id_satuan, jumlah: l.jumlah, harga: l.harga, diskon: l.diskon })),
    })
    toast.add({ severity: 'success', summary: 'Retur tersimpan', detail: 'Stok telah dikembalikan', life: 2500 })
    formDialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3500 })
  } finally {
    saving.value = false
  }
}

async function viewDetail(id: number) {
  detail.value = await returApi.detail(id)
  detailDialog.value = true
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <i class="pi pi-replay"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Retur Penjualan</h1>
          <p class="text-sm text-slate-500">Barang kembali dari pelanggan</p>
        </div>
      </div>
      <Button label="Retur Baru" icon="pi pi-plus" @click="openForm" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Belum ada retur.</div></template>
        <Column field="id" header="No"><template #body="{ data }">#{{ data.id }}</template></Column>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }} {{ data.jam }}</template></Column>
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column field="total" header="Total"><template #body="{ data }">{{ rupiah(data.total) }}</template></Column>
        <Column header="" style="width: 5rem">
          <template #body="{ data }"><Button icon="pi pi-eye" text rounded size="small" @click="viewDetail(data.id)" /></template>
        </Column>
      </DataTable>
    </div>

    <!-- Form retur -->
    <Dialog v-model:visible="formDialog" modal header="Retur Baru" :style="{ width: '54rem' }" class="mx-4">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="sm:col-span-1">
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Pelanggan *</label>
            <Select v-model="form.id_pelanggan" :options="pelangganOpts" option-label="label" option-value="value" filter placeholder="Pilih pelanggan" fluid />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
            <DatePicker v-model="form.tanggal" date-format="dd/mm/yy" fluid />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Keterangan</label>
            <InputText v-model="form.keterangan" placeholder="Alasan retur" fluid />
          </div>
        </div>

        <LineItemsEditor v-model="form.items" show-diskon harga-label="Harga Jual" />
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="formDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>

    <!-- Detail -->
    <Dialog v-model:visible="detailDialog" modal header="Detail Retur" :style="{ width: '40rem' }" class="mx-4">
      <div v-if="detail">
        <p class="mb-3 text-sm text-slate-500">
          #{{ detail.rekap.id }} · {{ detail.pelanggan?.nama_pelanggan }} · {{ detail.rekap.tanggal?.substring(0, 10) }}
        </p>
        <table class="w-full text-sm">
          <thead class="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th class="p-2">Barang</th><th class="p-2">Qty</th><th class="p-2 text-right">Harga</th><th class="p-2 text-right">Total</th></tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in detail.detail" :key="i" class="border-t border-slate-100 dark:border-slate-800">
              <td class="p-2">{{ d.barang }}</td>
              <td class="p-2">{{ d.jumlah }} {{ d.satuan }}</td>
              <td class="p-2 text-right">{{ rupiah(d.harga) }}</td>
              <td class="p-2 text-right font-semibold">{{ rupiah(d.total) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-3 flex justify-between border-t border-dashed pt-2 font-bold">
          <span>Total</span><span>{{ rupiah(detail.rekap.total) }}</span>
        </div>
      </div>
    </Dialog>
  </div>
</template>
