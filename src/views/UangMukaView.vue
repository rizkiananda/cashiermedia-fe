<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import { uangMukaApi, catalogApi, crudApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'

const toast = useToast()

type TabKey = 'penjualan' | 'pembelian'
const tab = ref<TabKey>('penjualan')

const rows = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)

const pelangganOpts = ref<{ label: string; value: number }[]>([])
const supplierOpts = ref<{ label: string; value: number }[]>([])
const metodeOpts = ref<{ label: string; value: number }[]>([])

const form = reactive({ id_target: 0, masuk: 0, metode_bayar: 0, keterangan: '' })
const saldo = ref<number | null>(null)

async function loadRefs() {
  if (!pelangganOpts.value.length) {
    const p = await catalogApi.pelanggan()
    pelangganOpts.value = p.map((x) => ({ label: x.nama_pelanggan, value: x.id }))
  }
  if (!supplierOpts.value.length) {
    const s = await crudApi<any>('/master/supplier').list()
    supplierOpts.value = s.map((x: any) => ({ label: x.nama_supplier, value: x.id }))
  }
  if (!metodeOpts.value.length) {
    const m = await catalogApi.metodePembayaran()
    metodeOpts.value = m.map((x: any) => ({ label: x.pembayaran, value: x.id }))
  }
}

async function load() {
  loading.value = true
  try {
    rows.value = tab.value === 'penjualan' ? await uangMukaApi.penjualan.list() : await uangMukaApi.pembelian.list()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([load(), loadRefs()])
})
watch(tab, load)

function openForm() {
  Object.assign(form, { id_target: 0, masuk: 0, metode_bayar: metodeOpts.value[0]?.value ?? 0, keterangan: '' })
  saldo.value = null
  dialog.value = true
}

async function onTargetChange() {
  if (!form.id_target) {
    saldo.value = null
    return
  }
  const res = tab.value === 'penjualan'
    ? await uangMukaApi.penjualan.saldo(form.id_target)
    : await uangMukaApi.pembelian.saldo(form.id_target)
  saldo.value = res.saldo
}

async function save() {
  if (!form.id_target || form.masuk <= 0) {
    toast.add({ severity: 'warn', summary: 'Lengkapi', detail: 'Pilih target & isi nominal', life: 2500 })
    return
  }
  saving.value = true
  try {
    if (tab.value === 'penjualan') {
      await uangMukaApi.penjualan.create({ id_pelanggan: form.id_target, masuk: form.masuk, metode_bayar: form.metode_bayar, keterangan: form.keterangan })
    } else {
      await uangMukaApi.pembelian.create({ id_supplier: form.id_target, masuk: form.masuk, metode_bayar: form.metode_bayar, keterangan: form.keterangan })
    }
    toast.add({ severity: 'success', summary: 'Uang muka tercatat', life: 2000 })
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
          <i class="pi pi-wallet"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Uang Muka</h1>
          <p class="text-sm text-slate-500">Deposit dari pelanggan & ke supplier</p>
        </div>
      </div>
      <Button label="Catat Uang Muka" icon="pi pi-plus" @click="openForm" />
    </div>

    <div class="mb-4 flex gap-2">
      <button class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        :class="tab === 'penjualan' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="tab = 'penjualan'">
        <i class="pi pi-arrow-down"></i> Dari Pelanggan
      </button>
      <button class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        :class="tab === 'pembelian' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="tab = 'pembelian'">
        <i class="pi pi-arrow-up"></i> Ke Supplier
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Belum ada riwayat.</div></template>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column :field="tab === 'penjualan' ? 'nama_pelanggan' : 'nama_supplier'" :header="tab === 'penjualan' ? 'Pelanggan' : 'Supplier'" />
        <Column header="Masuk"><template #body="{ data }">{{ rupiah(data.masuk) }}</template></Column>
        <Column header="Keluar"><template #body="{ data }">{{ rupiah(data.keluar) }}</template></Column>
        <Column field="keterangan" header="Keterangan" />
      </DataTable>
    </div>

    <Dialog v-model:visible="dialog" modal :header="tab === 'penjualan' ? 'Uang Muka dari Pelanggan' : 'Uang Muka ke Supplier'" :style="{ width: '28rem' }" class="mx-4">
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{{ tab === 'penjualan' ? 'Pelanggan' : 'Supplier' }}</label>
          <Select v-model="form.id_target" :options="tab === 'penjualan' ? pelangganOpts : supplierOpts" option-label="label" option-value="value" filter placeholder="Pilih" fluid @change="onTargetChange" />
          <p v-if="saldo !== null" class="mt-1 text-xs text-slate-500">Saldo berjalan: <span class="font-semibold">{{ rupiah(saldo) }}</span></p>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal</label>
          <InputNumber v-model="form.masuk" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Metode</label>
          <Select v-model="form.metode_bayar" :options="metodeOpts" option-label="label" option-value="value" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Keterangan</label>
          <InputText v-model="form.keterangan" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
