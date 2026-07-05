<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { checkoutApi } from '@/api'
import { rupiah } from '@/utils/format'
import type { TodaySale } from '@/types'
import InvoiceDialog from '@/components/InvoiceDialog.vue'

const sales = ref<TodaySale[]>([])
const loading = ref(false)
const invoiceDialog = ref(false)
const selectedId = ref<number | null>(null)

const totalOmzet = computed(() => sales.value.reduce((n, s) => n + s.total, 0))
const totalLunas = computed(() => sales.value.filter((s) => s.status === 'lunas').length)

onMounted(load)

async function load() {
  loading.value = true
  try {
    sales.value = await checkoutApi.todaySales()
  } finally {
    loading.value = false
  }
}

function viewInvoice(id: number) {
  selectedId.value = id
  invoiceDialog.value = true
}
</script>

<template>
  <div class="space-y-6">
    <!-- Ringkasan -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm text-slate-500">Total Transaksi</p>
        <p class="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{{ sales.length }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm text-slate-500">Omzet Hari Ini</p>
        <p class="mt-1 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{{ rupiah(totalOmzet) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm text-slate-500">Lunas</p>
        <p class="mt-1 text-2xl font-extrabold text-emerald-600">{{ totalLunas }} / {{ sales.length }}</p>
      </div>
    </div>

    <!-- Tabel -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h2 class="font-bold text-slate-800 dark:text-white">Daftar Penjualan Hari Ini</h2>
        <Button icon="pi pi-refresh" text rounded :loading="loading" @click="load" />
      </div>
      <DataTable :value="sales" :loading="loading" paginator :rows="10" data-key="id" class="text-sm" responsive-layout="scroll">
        <template #empty>
          <div class="py-10 text-center text-slate-400">Belum ada transaksi hari ini.</div>
        </template>
        <Column field="id" header="No. Faktur">
          <template #body="{ data }">#{{ data.id }}</template>
        </Column>
        <Column field="jam" header="Jam" />
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column field="total" header="Total">
          <template #body="{ data }">{{ rupiah(data.total) }}</template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="data.status === 'lunas' ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column header="" style="width: 6rem">
          <template #body="{ data }">
            <Button icon="pi pi-eye" text rounded size="small" v-tooltip.left="'Lihat faktur'" @click="viewInvoice(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <InvoiceDialog v-model:visible="invoiceDialog" :rekap-id="selectedId" />
  </div>
</template>
