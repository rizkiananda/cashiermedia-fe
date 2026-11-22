<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { checkoutApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah, ymd } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'
import type { TodaySale, LogHapusTransaksi } from '@/types'
import InvoiceDialog from '@/components/InvoiceDialog.vue'
import PelangganMetodeFilter from '@/components/PelangganMetodeFilter.vue'

const toast = useToast()
const confirm = useConfirm()
const auth = useAuthStore()
// Hanya untuk menyembunyikan tombol; penegakan sebenarnya di backend (middleware.AdminOnly).
const isAdmin = computed(() => ['admin', 'owner'].includes(auth.user?.role ?? ''))

const logDialog = ref(false)
const logRows = ref<LogHapusTransaksi[]>([])
const loadingLog = ref(false)

async function openLog() {
  logDialog.value = true
  loadingLog.value = true
  try {
    logRows.value = await checkoutApi.logHapus()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat log', detail: errorMessage(e), life: 3000 })
  } finally {
    loadingLog.value = false
  }
}
function waktu(s: string) {
  return new Date(s).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

const sales = ref<TodaySale[]>([])
const loading = ref(false)
const invoiceDialog = ref(false)
const selectedId = ref<number | null>(null)
const startDate = ref(new Date())
const endDate = ref(new Date())
const filterPelanggan = ref<number | null>(null)
const filterMetode = ref<string | null>(null)

const totalOmzet = computed(() => sales.value.reduce((n, s) => n + s.total, 0))
const totalLunas = computed(() => sales.value.filter((s) => s.status === 'lunas').length)

function tgl(s: string) {
  return s ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
}

onMounted(load)

async function load() {
  if (!startDate.value || !endDate.value) return
  loading.value = true
  try {
    sales.value = await checkoutApi.sales(ymd(startDate.value), ymd(endDate.value), { pelanggan: filterPelanggan.value, metode: filterMetode.value })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat', detail: errorMessage(e), life: 3000 })
  } finally {
    loading.value = false
  }
}

function viewInvoice(id: number) {
  selectedId.value = id
  invoiceDialog.value = true
}

function confirmDelete(s: TodaySale) {
  const efek = s.status === 'pending'
    ? 'Pesanan ini belum memotong stok, jadi stok tidak berubah.'
    : 'Stok barang akan dikembalikan.'
  confirm.require({
    header: `Hapus transaksi #${s.id}?`,
    message:
      `${efek} Piutang beserta riwayat pembayarannya ikut terhapus dan transaksi hilang dari laporan. ` +
      'Penghapusan dicatat di Log Penghapusan dan tidak bisa dibatalkan.',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await checkoutApi.deleteSale(s.id)
        toast.add({ severity: 'success', summary: 'Transaksi dihapus', detail: `#${s.id}`, life: 2500 })
        await load()
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Gagal menghapus', detail: errorMessage(e), life: 4000 })
      }
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filter -->
    <div class="flex flex-wrap items-end gap-3">
      <div>
        <label for="tgl-awal" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Dari tanggal</label>
        <DatePicker v-model="startDate" input-id="tgl-awal" date-format="dd/mm/yy" :max-date="endDate" show-icon />
      </div>
      <div>
        <label for="tgl-akhir" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Sampai tanggal</label>
        <DatePicker v-model="endDate" input-id="tgl-akhir" date-format="dd/mm/yy" :min-date="startDate" show-icon />
      </div>
      <PelangganMetodeFilter
        v-model:pelanggan="filterPelanggan"
        v-model:metode="filterMetode"
        label-class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      />
      <Button label="Tampilkan" icon="pi pi-search" :loading="loading" @click="load" />
      <Button v-if="isAdmin" label="Log Penghapusan" icon="pi pi-history" severity="secondary" outlined class="sm:ml-auto" @click="openLog" />
    </div>

    <!-- Ringkasan -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm text-slate-500">Total Transaksi</p>
        <p class="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{{ sales.length }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm text-slate-500">Omzet</p>
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
        <h2 class="font-bold text-slate-800 dark:text-white">Daftar Transaksi</h2>
        <Button icon="pi pi-refresh" text rounded :loading="loading" aria-label="Muat ulang" @click="load" />
      </div>
      <DataTable :value="sales" :loading="loading" paginator :rows="10" data-key="id" class="text-sm" responsive-layout="scroll">
        <template #empty>
          <div class="py-10 text-center text-slate-400">Tidak ada transaksi pada rentang tanggal ini.</div>
        </template>
        <Column field="id" header="No. Faktur">
          <template #body="{ data }">#{{ data.id }}</template>
        </Column>
        <Column header="Tanggal">
          <template #body="{ data }">{{ tgl(data.tanggal) }} <span class="text-slate-400">{{ data.jam }}</span></template>
        </Column>
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column field="total" header="Total">
          <template #body="{ data }">{{ rupiah(data.total) }}</template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="data.status === 'lunas' ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column header="" style="width: 7rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-eye" text rounded size="small" aria-label="Lihat faktur" v-tooltip.left="'Lihat faktur'" @click="viewInvoice(data.id)" />
              <span v-if="isAdmin" v-tooltip.left="data.ada_retur ? 'Sudah diretur, tidak bisa dihapus' : 'Hapus'">
                <Button icon="pi pi-trash" text rounded size="small" severity="danger" aria-label="Hapus transaksi" :disabled="data.ada_retur" @click="confirmDelete(data)" />
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <InvoiceDialog v-model:visible="invoiceDialog" :rekap-id="selectedId" />

    <Dialog v-model:visible="logDialog" modal header="Log Penghapusan Transaksi" :style="{ width: '52rem' }" class="mx-4">
      <DataTable :value="logRows" :loading="loadingLog" paginator :rows="10" data-key="id" class="text-sm" responsive-layout="scroll">
        <template #empty><div class="py-8 text-center text-slate-400">Belum ada transaksi yang dihapus.</div></template>
        <Column header="Dihapus"><template #body="{ data }">{{ waktu(data.dihapus_pada) }}</template></Column>
        <Column field="username" header="Oleh" />
        <Column header="Faktur"><template #body="{ data }">#{{ data.id_rekap }}</template></Column>
        <Column header="Tgl. Transaksi"><template #body="{ data }">{{ tgl(data.tanggal_transaksi) }}</template></Column>
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column header="Total"><template #body="{ data }">{{ rupiah(data.total) }}</template></Column>
        <Column field="status" header="Status" />
      </DataTable>
    </Dialog>
  </div>
</template>
