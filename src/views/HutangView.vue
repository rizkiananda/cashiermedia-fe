<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'
import { keuanganApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'

const toast = useToast()
const rows = ref<any[]>([])
const totalSisa = ref(0)
const loading = ref(false)

const dialog = ref(false)
const target = ref<any>(null)
const nominal = ref(0)
const saving = ref(false)

onMounted(load)

async function load() {
  loading.value = true
  try {
    const res = await keuanganApi.hutang()
    rows.value = res.data
    totalSisa.value = res.total_sisa
  } finally {
    loading.value = false
  }
}

function openBayar(row: any) {
  target.value = row
  nominal.value = row.sisa
  dialog.value = true
}

async function bayar() {
  if (!target.value) return
  saving.value = true
  try {
    await keuanganApi.bayarHutang(target.value.id, { nominal: nominal.value })
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
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <i class="pi pi-credit-card"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Hutang</h1>
        <p class="text-sm text-slate-500">Kewajiban yang belum dibayar ke supplier</p>
      </div>
    </div>

    <div class="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-rose-500/10">
      <p class="text-sm text-rose-700 dark:text-rose-300">Total Hutang Berjalan</p>
      <p class="text-2xl font-extrabold text-rose-800 dark:text-rose-200">{{ rupiah(totalSisa) }}</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada hutang berjalan. 🎉</div></template>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column field="nama_supplier" header="Supplier" />
        <Column field="hutang" header="Hutang"><template #body="{ data }">{{ rupiah(data.hutang) }}</template></Column>
        <Column field="bayar" header="Terbayar"><template #body="{ data }">{{ rupiah(data.bayar) }}</template></Column>
        <Column field="sisa" header="Sisa"><template #body="{ data }">{{ rupiah(data.sisa) }}</template></Column>
        <Column header="" style="width: 8rem">
          <template #body="{ data }"><Button label="Bayar" icon="pi pi-wallet" size="small" @click="openBayar(data)" /></template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="dialog" modal header="Bayar Hutang" :style="{ width: '26rem' }" class="mx-4">
      <div v-if="target" class="space-y-4">
        <p class="text-sm text-slate-500">{{ target.nama_supplier }} · Sisa {{ rupiah(target.sisa) }}</p>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal Bayar</label>
          <InputNumber v-model="nominal" :min="0" :max="target.sisa" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialog = false" />
        <Button label="Bayar" icon="pi pi-check" :loading="saving" @click="bayar" />
      </template>
    </Dialog>
  </div>
</template>
