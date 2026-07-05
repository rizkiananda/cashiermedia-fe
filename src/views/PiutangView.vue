<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { keuanganApi, catalogApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'
import type { MetodePembayaran } from '@/types'

const toast = useToast()
const rows = ref<any[]>([])
const totalSisa = ref(0)
const loading = ref(false)

const dialog = ref(false)
const target = ref<any>(null)
const nominal = ref(0)
const metode = ref('')
const metodeList = ref<MetodePembayaran[]>([])
const saving = ref(false)

onMounted(async () => {
  await load()
  metodeList.value = await catalogApi.metodePembayaran()
})

async function load() {
  loading.value = true
  try {
    const res = await keuanganApi.piutang()
    rows.value = res.data
    totalSisa.value = res.total_sisa
  } finally {
    loading.value = false
  }
}

function openBayar(row: any) {
  target.value = row
  nominal.value = row.sisa
  metode.value = metodeList.value[0]?.pembayaran ?? 'Cash'
  dialog.value = true
}

async function bayar() {
  if (!target.value) return
  saving.value = true
  try {
    await keuanganApi.bayarPiutang(target.value.id, { nominal: nominal.value, metode_bayar: metode.value })
    toast.add({ severity: 'success', summary: 'Pembayaran tercatat', life: 2000 })
    dialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        <i class="pi pi-hourglass"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Piutang</h1>
        <p class="text-sm text-slate-500">Tagihan yang belum dilunasi pelanggan</p>
      </div>
    </div>

    <div class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
      <p class="text-sm text-amber-700 dark:text-amber-300">Total Piutang Berjalan</p>
      <p class="text-2xl font-extrabold text-amber-800 dark:text-amber-200">{{ rupiah(totalSisa) }}</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada piutang berjalan. 🎉</div></template>
        <Column header="Faktur"><template #body="{ data }">#{{ data.id_rekap }}</template></Column>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column field="sisa" header="Sisa"><template #body="{ data }">{{ rupiah(data.sisa) }}</template></Column>
        <Column header="" style="width: 8rem">
          <template #body="{ data }"><Button label="Bayar" icon="pi pi-wallet" size="small" @click="openBayar(data)" /></template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="dialog" modal header="Bayar Piutang" :style="{ width: '26rem' }" class="mx-4">
      <div v-if="target" class="space-y-4">
        <p class="text-sm text-slate-500">{{ target.nama_pelanggan }} · Sisa {{ rupiah(target.sisa) }}</p>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal Bayar</label>
          <InputNumber v-model="nominal" :min="0" :max="target.sisa" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Metode</label>
          <Select v-model="metode" :options="metodeList" option-label="pembayaran" option-value="pembayaran" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialog = false" />
        <Button label="Bayar" icon="pi pi-check" :loading="saving" @click="bayar" />
      </template>
    </Dialog>
  </div>
</template>
