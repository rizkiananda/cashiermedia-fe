<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { orderApi, catalogApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'
import type { MetodePembayaran } from '@/types'

const toast = useToast()
const confirm = useConfirm()

const rows = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref('')
const statusOpts = [
  { label: 'Semua', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Diproses', value: 'diproses' },
  { label: 'Lunas', value: 'lunas' },
]

const detailDialog = ref(false)
const detail = ref<any>(null)

const payDialog = ref(false)
const payTarget = ref<any>(null)
const payForm = reactive({ bayar: 0, metode_pembayaran: 0 })
const metodeList = ref<MetodePembayaran[]>([])
const saving = ref(false)

onMounted(async () => {
  await load()
  metodeList.value = await catalogApi.metodePembayaran()
})

async function load() {
  loading.value = true
  try {
    rows.value = await orderApi.list(statusFilter.value || undefined)
  } finally {
    loading.value = false
  }
}

async function viewDetail(id: number) {
  detail.value = await orderApi.detail(id)
  detailDialog.value = true
}

async function proses(row: any) {
  try {
    await orderApi.proses(row.id)
    toast.add({ severity: 'success', summary: 'Pesanan diproses', detail: 'Stok telah dipotong', life: 2500 })
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  }
}

function openBayar(row: any) {
  payTarget.value = row
  payForm.bayar = row.total
  payForm.metode_pembayaran = metodeList.value[0]?.id ?? 0
  payDialog.value = true
}

async function bayar() {
  if (!payTarget.value) return
  saving.value = true
  try {
    await orderApi.bayar(payTarget.value.id, payForm)
    toast.add({ severity: 'success', summary: 'Pembayaran tercatat', life: 2000 })
    payDialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  } finally {
    saving.value = false
  }
}

function confirmBatalkan(row: any) {
  confirm.require({
    message: `Batalkan pesanan #${row.id}?`,
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Tidak',
    acceptLabel: 'Ya, batalkan',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await orderApi.batalkan(row.id)
      toast.add({ severity: 'success', summary: 'Pesanan dibatalkan', life: 2000 })
      await load()
    },
  })
}

function statusSeverity(s: string) {
  if (s === 'lunas') return 'success'
  if (s === 'diproses') return 'info'
  if (s === 'belum lunas') return 'warn'
  return 'secondary'
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <i class="pi pi-globe"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Order Online</h1>
          <p class="text-sm text-slate-500">Daftar pesanan dari pelanggan</p>
        </div>
      </div>
      <Select v-model="statusFilter" :options="statusOpts" option-label="label" option-value="value" @change="load" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Belum ada pesanan.</div></template>
        <Column header="No"><template #body="{ data }">#{{ data.id }}</template></Column>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }} {{ data.jam }}</template></Column>
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column header="Total"><template #body="{ data }">{{ rupiah(data.total) }}</template></Column>
        <Column header="Status">
          <template #body="{ data }"><Tag :value="data.status" :severity="statusSeverity(data.status)" /></template>
        </Column>
        <Column header="Aksi" style="width: 12rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-eye" text rounded size="small" @click="viewDetail(data.id)" v-tooltip.top="'Detail'" />
              <Button v-if="data.status === 'pending'" icon="pi pi-box" text rounded size="small" severity="info" @click="proses(data)" v-tooltip.top="'Proses (potong stok)'" />
              <Button v-if="data.status === 'diproses'" icon="pi pi-wallet" text rounded size="small" severity="success" @click="openBayar(data)" v-tooltip.top="'Bayar'" />
              <Button v-if="data.status === 'pending'" icon="pi pi-times" text rounded size="small" severity="danger" @click="confirmBatalkan(data)" v-tooltip.top="'Batalkan'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Detail -->
    <Dialog v-model:visible="detailDialog" modal header="Detail Pesanan" :style="{ width: '36rem' }" class="mx-4">
      <div v-if="detail">
        <p class="mb-3 text-sm text-slate-500">#{{ detail.rekap.id }} · {{ detail.pelanggan?.nama_pelanggan }}</p>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th class="p-2">Barang</th><th class="p-2">Qty</th><th class="p-2 text-right">Harga</th><th class="p-2 text-right">Subtotal</th></tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in detail.detail" :key="i" class="border-t border-slate-100 dark:border-slate-800">
              <td class="p-2">{{ d.barang }}</td>
              <td class="p-2">{{ d.jumlah }} {{ d.satuan }}</td>
              <td class="p-2 text-right">{{ rupiah(d.harga_jual) }}</td>
              <td class="p-2 text-right font-semibold">{{ rupiah(d.subtotal) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-3 flex justify-between border-t border-dashed pt-2 font-bold">
          <span>Total</span><span>{{ rupiah(detail.rekap.total) }}</span>
        </div>
      </div>
    </Dialog>

    <!-- Bayar -->
    <Dialog v-model:visible="payDialog" modal header="Bayar Pesanan" :style="{ width: '26rem' }" class="mx-4">
      <div v-if="payTarget" class="space-y-4">
        <p class="text-sm text-slate-500">#{{ payTarget.id }} · Total {{ rupiah(payTarget.total) }}</p>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal Bayar</label>
          <InputNumber v-model="payForm.bayar" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Metode</label>
          <Select v-model="payForm.metode_pembayaran" :options="metodeList" option-label="pembayaran" option-value="id" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="payDialog = false" />
        <Button label="Bayar" icon="pi pi-check" :loading="saving" @click="bayar" />
      </template>
    </Dialog>
  </div>
</template>
