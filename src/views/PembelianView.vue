<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import { pembelianApi, crudApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'
import LineItemsEditor, { type LineItem } from '@/components/LineItemsEditor.vue'

const toast = useToast()

const rows = ref<any[]>([])
const loading = ref(false)
const supplierOpts = ref<{ label: string; value: number }[]>([])

const formDialog = ref(false)
const detailDialog = ref(false)
const detail = ref<any>(null)
const saving = ref(false)

const form = reactive<{ id_supplier: number; tanggal: Date; ongkos_angkut: number; bayar: number; items: LineItem[] }>({
  id_supplier: 0,
  tanggal: new Date(),
  ongkos_angkut: 0,
  bayar: 0,
  items: [],
})

const totalForm = computed(() => form.items.reduce((n, l) => n + l.harga * l.jumlah, 0) + form.ongkos_angkut)

onMounted(async () => {
  await Promise.all([load(), loadSuppliers()])
})

async function load() {
  loading.value = true
  try {
    rows.value = await pembelianApi.list()
  } finally {
    loading.value = false
  }
}
async function loadSuppliers() {
  const sup = await crudApi<any>('/master/supplier').list()
  supplierOpts.value = sup.map((s: any) => ({ label: s.nama_supplier, value: s.id }))
}

function openForm() {
  Object.assign(form, { id_supplier: 0, tanggal: new Date(), ongkos_angkut: 0, bayar: 0, items: [] })
  formDialog.value = true
}

async function save() {
  if (!form.id_supplier) {
    toast.add({ severity: 'warn', summary: 'Pilih supplier', life: 2500 })
    return
  }
  if (!form.items.length) {
    toast.add({ severity: 'warn', summary: 'Tambah barang', life: 2500 })
    return
  }
  saving.value = true
  try {
    await pembelianApi.create({
      id_supplier: form.id_supplier,
      tanggal: form.tanggal.toISOString().substring(0, 10),
      ongkos_angkut: form.ongkos_angkut,
      bayar: form.bayar,
      items: form.items.map((l) => ({ id_barang: l.id_barang, id_satuan: l.id_satuan, jumlah: l.jumlah, harga: l.harga })),
    })
    toast.add({ severity: 'success', summary: 'Pembelian tersimpan', detail: 'Stok telah ditambahkan', life: 2500 })
    formDialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3500 })
  } finally {
    saving.value = false
  }
}

async function viewDetail(id: number) {
  detail.value = await pembelianApi.detail(id)
  detailDialog.value = true
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <i class="pi pi-shopping-bag"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Pembelian</h1>
          <p class="text-sm text-slate-500">Pembelian barang dari supplier</p>
        </div>
      </div>
      <Button label="Pembelian Baru" icon="pi pi-plus" @click="openForm" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Belum ada pembelian.</div></template>
        <Column field="id" header="No"><template #body="{ data }">#{{ data.id }}</template></Column>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }} {{ data.jam }}</template></Column>
        <Column field="nama_supplier" header="Supplier" />
        <Column field="total" header="Total"><template #body="{ data }">{{ rupiah(data.total) }}</template></Column>
        <Column header="" style="width: 5rem">
          <template #body="{ data }"><Button icon="pi pi-eye" text rounded size="small" @click="viewDetail(data.id)" /></template>
        </Column>
      </DataTable>
    </div>

    <!-- Form pembelian -->
    <Dialog v-model:visible="formDialog" modal header="Pembelian Baru" :style="{ width: '54rem' }" class="mx-4">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Supplier *</label>
            <Select v-model="form.id_supplier" :options="supplierOpts" option-label="label" option-value="value" filter placeholder="Pilih supplier" fluid />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
            <DatePicker v-model="form.tanggal" date-format="dd/mm/yy" fluid />
          </div>
        </div>

        <LineItemsEditor v-model="form.items" harga-label="Harga Beli" />

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Ongkos Angkut</label>
            <InputNumber v-model="form.ongkos_angkut" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Dibayar</label>
            <InputNumber v-model="form.bayar" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
          </div>
        </div>

        <div class="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800/60">
          <span class="text-sm text-slate-500">Total Pembelian</span>
          <span class="text-lg font-bold text-slate-800 dark:text-white">{{ rupiah(totalForm) }}</span>
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="formDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>

    <!-- Detail -->
    <Dialog v-model:visible="detailDialog" modal header="Detail Pembelian" :style="{ width: '40rem' }" class="mx-4">
      <div v-if="detail">
        <p class="mb-3 text-sm text-slate-500">
          #{{ detail.rekap.id }} · {{ detail.supplier?.nama_supplier }} · {{ detail.rekap.tanggal?.substring(0, 10) }}
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
