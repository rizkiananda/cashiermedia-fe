<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Tag from 'primevue/tag'
import { dashboardApi, type DashboardSummary } from '@/api'
import { rupiah, angka } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'
import YearlyBarChart from '@/components/charts/YearlyBarChart.vue'
import MonthlyAreaChart from '@/components/charts/MonthlyAreaChart.vue'

const auth = useAuthStore()
const summary = ref<DashboardSummary | null>(null)
const topBarang = ref<Array<{ barang: string; qty: number; total: number }>>([])
const recent = ref<Array<any>>([])
const loading = ref(false)

const now = new Date()
const tahunChart = ref(now.getFullYear())
const yearlyData = ref<Array<{ bulan: number; omzet: number }>>([])
const yearlyLoading = ref(false)

const bulanChart = ref(now.getMonth() + 1)
const tahunBulanChart = ref(now.getFullYear())
const monthlyData = ref<Array<{ tanggal: number; omzet: number }>>([])
const monthlyLoading = ref(false)

const secondaryCards = ref<Array<{ label: string; value: string; icon: string; color: string }>>([])

onMounted(async () => {
  loading.value = true
  try {
    const [s, t, r] = await Promise.all([
      dashboardApi.summary(),
      dashboardApi.topBarang(),
      dashboardApi.recent(),
    ])
    summary.value = s
    topBarang.value = t ?? []
    recent.value = r ?? []
    buildSecondaryCards()
  } finally {
    loading.value = false
  }
  await Promise.all([loadYearly(), loadMonthly()])
})

function buildSecondaryCards() {
  const s = summary.value
  secondaryCards.value = [
    { label: 'Transaksi Hari Ini', value: angka(s?.transaksi_hari_ini ?? 0), icon: 'pi pi-receipt', color: 'from-violet-500 to-violet-600' },
    { label: 'Total Piutang', value: rupiah(s?.total_piutang ?? 0), icon: 'pi pi-hourglass', color: 'from-amber-500 to-amber-600' },
    { label: 'Pelanggan Aktif', value: angka(s?.pelanggan_aktif ?? 0), icon: 'pi pi-users', color: 'from-fuchsia-500 to-fuchsia-600' },
    { label: 'Stok Menipis', value: angka(s?.barang_menipis ?? 0), icon: 'pi pi-exclamation-triangle', color: 'from-rose-500 to-rose-600' },
  ]
}

async function loadYearly(year?: number) {
  if (year) tahunChart.value = year
  yearlyLoading.value = true
  try {
    const res = await dashboardApi.omzetTahunan(tahunChart.value)
    yearlyData.value = res.data
  } finally {
    yearlyLoading.value = false
  }
}

async function loadMonthly(month?: number, year?: number) {
  if (month) bulanChart.value = month
  if (year) tahunBulanChart.value = year
  monthlyLoading.value = true
  try {
    const res = await dashboardApi.omzetBulanan(bulanChart.value, tahunBulanChart.value)
    monthlyData.value = res.data
  } finally {
    monthlyLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-white">
        Halo, {{ auth.user?.nama }} 👋
      </h1>
      <p class="text-sm text-slate-500">Ringkasan aktivitas {{ auth.user?.nama_perusahaan }}.</p>
    </div>

    <!-- Kartu pendapatan utama -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-5 text-white shadow-sm">
        <i class="pi pi-shopping-cart absolute -bottom-3 -right-3 text-7xl opacity-20"></i>
        <p class="relative text-2xl font-extrabold tracking-tight">{{ rupiah(summary?.omzet_hari_ini ?? 0) }}</p>
        <p class="relative mt-1 text-sm text-white/85">Pendapatan hari ini</p>
      </div>
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-sm">
        <i class="pi pi-chart-pie absolute -bottom-3 -right-3 text-7xl opacity-20"></i>
        <p class="relative text-2xl font-extrabold tracking-tight">{{ rupiah(summary?.omzet_bulan_ini ?? 0) }}</p>
        <p class="relative mt-1 text-sm text-white/85">Pendapatan bulan ini</p>
      </div>
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-5 text-white shadow-sm">
        <i class="pi pi-chart-bar absolute -bottom-3 -right-3 text-7xl opacity-20"></i>
        <p class="relative text-2xl font-extrabold tracking-tight">{{ rupiah(summary?.omzet_tahun_ini ?? 0) }}</p>
        <p class="relative mt-1 text-sm text-white/85">Pendapatan tahun ini</p>
        <RouterLink to="/app/laporan" class="relative mt-2 flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white">
          Grafik Estimasi Laba <i class="pi pi-angle-right"></i>
        </RouterLink>
      </div>
    </div>

    <!-- Grafik pendapatan tahunan & bulanan -->
    <div class="grid gap-6 lg:grid-cols-2">
      <YearlyBarChart :data="yearlyData" :year="tahunChart" :loading="yearlyLoading" @search="loadYearly" />
      <MonthlyAreaChart :data="monthlyData" :month="bulanChart" :year="tahunBulanChart" :loading="monthlyLoading" @search="loadMonthly" />
    </div>

    <!-- Kartu sekunder -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="c in secondaryCards"
        :key="c.label"
        class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div :class="`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white`">
          <i :class="c.icon"></i>
        </div>
        <p class="text-xs text-slate-500">{{ c.label }}</p>
        <p class="mt-0.5 truncate text-lg font-extrabold text-slate-800 dark:text-white">{{ c.value }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Top barang -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
        <h2 class="mb-4 font-bold text-slate-800 dark:text-white">Barang Terlaris (Bulan Ini)</h2>
        <div v-if="!topBarang.length" class="py-8 text-center text-sm text-slate-400">Belum ada data.</div>
        <ol v-else class="space-y-3">
          <li v-for="(b, i) in topBarang" :key="b.barang" class="flex items-center gap-3">
            <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{{ b.barang }}</p>
              <p class="text-xs text-slate-400">{{ angka(b.qty) }} terjual</p>
            </div>
            <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">{{ rupiah(b.total) }}</span>
          </li>
        </ol>
      </div>

      <!-- Transaksi terbaru -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <h2 class="mb-4 font-bold text-slate-800 dark:text-white">Transaksi Terbaru</h2>
        <div v-if="!recent.length" class="py-8 text-center text-sm text-slate-400">Belum ada transaksi.</div>
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="r in recent" :key="r.id" class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-200">#{{ r.id }} · {{ r.nama_pelanggan || 'Umum' }}</p>
              <p class="text-xs text-slate-400">{{ r.tanggal?.substring(0, 10) }} {{ r.jam }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ rupiah(r.total) }}</p>
              <Tag :value="r.status" :severity="r.status === 'lunas' ? 'success' : 'warn'" class="!text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
