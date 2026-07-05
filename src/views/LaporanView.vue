<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { keuanganApi, laporanJurnalApi, crudApi } from '@/api'
import { rupiah, angka } from '@/utils/format'
import { exportCsv } from '@/utils/csv'

type TabKey =
  | 'penjualan' | 'barang' | 'per-sales' | 'pembelian' | 'pembayaran' | 'jurnal'
  | 'jatuh-tempo' | 'laba' | 'kasir' | 'rekap-kasir' | 'stok' | 'stok-pergolongan'

const tab = ref<TabKey>('penjualan')
const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'penjualan', label: 'Penjualan', icon: 'pi pi-receipt' },
  { key: 'barang', label: 'Penjualan Barang', icon: 'pi pi-box' },
  { key: 'per-sales', label: 'Penjualan Persales', icon: 'pi pi-user' },
  { key: 'pembelian', label: 'Pembelian', icon: 'pi pi-shopping-bag' },
  { key: 'pembayaran', label: 'Pembayaran', icon: 'pi pi-wallet' },
  { key: 'jurnal', label: 'Jurnal', icon: 'pi pi-book' },
  { key: 'jatuh-tempo', label: 'Jatuh Tempo', icon: 'pi pi-calendar-times' },
  { key: 'laba', label: 'Estimasi Laba', icon: 'pi pi-chart-line' },
  { key: 'kasir', label: 'Kasir', icon: 'pi pi-money-bill' },
  { key: 'rekap-kasir', label: 'Rekap Kasir', icon: 'pi pi-calculator' },
  { key: 'stok', label: 'Stok', icon: 'pi pi-database' },
  { key: 'stok-pergolongan', label: 'Stok Pergolongan', icon: 'pi pi-sitemap' },
]

const today = new Date()
const startDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const endDate = ref(new Date())
const singleDate = ref(new Date())
const loading = ref(false)

const penjualan = ref<any>({ data: [], total_omzet: 0, total_terbayar: 0, jumlah_faktur: 0 })
const barang = ref<any>({ data: [] })
const perSales = ref<any>({ data: [] })
const pembelian = ref<any>({ data: [], total_pembelian: 0, jumlah_faktur: 0 })
const supplierFilter = ref('')
const pembayaran = ref<any>({ data: [], per_metode: {}, total: 0 })
const jurnal = ref<any>({ data: [], total_debet: 0, total_kredit: 0 })
const akunOpts = ref<{ label: string; value: number }[]>([])
const akunFilter = ref<number | null>(null)
const jatuhTempo = ref<any>({ data: [], total_sisa: 0, jumlah_terlambat: 0 })
const laba = ref<any>({ data: [], total_omzet: 0, total_modal: 0, total_laba: 0 })
const kasir = ref<any>({ data: [], per_metode: {} })
const rekapKasir = ref<any>({ data: [] })
const stok = ref<any>({ data: [], total_nilai: 0 })
const golonganOpts = ref<{ label: string; value: number }[]>([])
const golonganFilter = ref<number | null>(null)
const stokPergolongan = ref<any>({ data: [], total_nilai: 0 })

function fmtDate(d: Date) {
  return d.toISOString().substring(0, 10)
}

onMounted(async () => {
  await load()
  const [akun, golongan] = await Promise.all([
    crudApi<any>('/jurnal/akun').list(),
    crudApi<any>('/master/golongan').list(),
  ])
  akunOpts.value = akun.map((a: any) => ({ label: `${a.kode_akun || ''} ${a.nama_akun}`.trim(), value: a.id }))
  golonganOpts.value = golongan.map((g: any) => ({ label: g.nama_golongan, value: g.id }))
})

async function load() {
  loading.value = true
  const s = fmtDate(startDate.value)
  const e = fmtDate(endDate.value)
  try {
    if (tab.value === 'penjualan') penjualan.value = await keuanganApi.laporanPenjualan(s, e)
    else if (tab.value === 'barang') barang.value = await keuanganApi.laporanPenjualanBarang(s, e)
    else if (tab.value === 'per-sales') perSales.value = await keuanganApi.laporanPerSales(s, e)
    else if (tab.value === 'pembelian') pembelian.value = await keuanganApi.laporanPembelian(s, e, supplierFilter.value)
    else if (tab.value === 'pembayaran') pembayaran.value = await keuanganApi.laporanPembayaran(s, e)
    else if (tab.value === 'jurnal') jurnal.value = await laporanJurnalApi.get(s, e, akunFilter.value ?? undefined)
    else if (tab.value === 'jatuh-tempo') jatuhTempo.value = await keuanganApi.laporanJatuhTempo()
    else if (tab.value === 'laba') laba.value = await keuanganApi.laba(s, e)
    else if (tab.value === 'kasir') kasir.value = await keuanganApi.laporanKasir(s, e)
    else if (tab.value === 'rekap-kasir') rekapKasir.value = await keuanganApi.laporanRekapKasir(fmtDate(singleDate.value))
    else if (tab.value === 'stok') stok.value = await keuanganApi.laporanStok(golonganFilter.value ?? undefined)
    else stokPergolongan.value = await keuanganApi.laporanStokPergolongan()
  } finally {
    loading.value = false
  }
}

function switchTab(k: TabKey) {
  tab.value = k
  load()
}

const dateRangeTabs: TabKey[] = ['penjualan', 'barang', 'per-sales', 'pembelian', 'pembayaran', 'jurnal', 'laba', 'kasir']

function doExport() {
  if (tab.value === 'penjualan')
    exportCsv('laporan-penjualan', penjualan.value.data, [
      { key: 'id', label: 'Faktur' }, { key: 'tanggal', label: 'Tanggal' }, { key: 'nama_pelanggan', label: 'Pelanggan' },
      { key: 'total', label: 'Total' }, { key: 'total_bayar', label: 'Terbayar' }, { key: 'status', label: 'Status' },
    ])
  else if (tab.value === 'barang')
    exportCsv('laporan-penjualan-barang', barang.value.data, [
      { key: 'barang', label: 'Barang' }, { key: 'qty', label: 'Qty' }, { key: 'omzet', label: 'Omzet' },
    ])
  else if (tab.value === 'per-sales')
    exportCsv('laporan-per-sales', perSales.value.data, [
      { key: 'nama_sales', label: 'Sales' }, { key: 'jumlah_faktur', label: 'Jumlah Faktur' }, { key: 'total', label: 'Total' },
    ])
  else if (tab.value === 'pembelian')
    exportCsv('laporan-pembelian', pembelian.value.data, [
      { key: 'id', label: 'No' }, { key: 'tanggal', label: 'Tanggal' }, { key: 'nama_supplier', label: 'Supplier' },
      { key: 'total', label: 'Total' }, { key: 'ongkos_angkut', label: 'Ongkos Angkut' },
    ])
  else if (tab.value === 'pembayaran')
    exportCsv('laporan-pembayaran', pembayaran.value.data, [
      { key: 'id_rekap', label: 'Faktur' }, { key: 'tanggal', label: 'Tanggal' }, { key: 'nama_pelanggan', label: 'Pelanggan' },
      { key: 'metode_bayar', label: 'Metode' }, { key: 'nominal', label: 'Nominal' },
    ])
  else if (tab.value === 'jurnal')
    exportCsv('laporan-jurnal', jurnal.value.data, [
      { key: 'tanggal', label: 'Tanggal' }, { key: 'nama_akun', label: 'Akun' }, { key: 'keterangan', label: 'Keterangan' },
      { key: 'debet', label: 'Debet' }, { key: 'kredit', label: 'Kredit' },
    ])
  else if (tab.value === 'jatuh-tempo')
    exportCsv('laporan-jatuh-tempo', jatuhTempo.value.data, [
      { key: 'id', label: 'Faktur' }, { key: 'nama_pelanggan', label: 'Pelanggan' }, { key: 'jatuh_tempo', label: 'Jatuh Tempo' },
      { key: 'sisa', label: 'Sisa' }, { key: 'hari_terlambat', label: 'Hari Terlambat' },
    ])
  else if (tab.value === 'laba')
    exportCsv('laporan-laba', laba.value.data, [
      { key: 'barang', label: 'Barang' }, { key: 'qty', label: 'Qty' }, { key: 'omzet', label: 'Omzet' },
      { key: 'modal', label: 'Modal' }, { key: 'laba', label: 'Laba' },
    ])
  else if (tab.value === 'kasir')
    exportCsv('laporan-kasir', kasir.value.data, [
      { key: 'id', label: 'Faktur' }, { key: 'tanggal', label: 'Tanggal' }, { key: 'nama_pelanggan', label: 'Pelanggan' },
      { key: 'nama_user', label: 'Kasir' }, { key: 'metode_bayar', label: 'Metode' }, { key: 'bayar', label: 'Bayar' },
    ])
  else if (tab.value === 'rekap-kasir')
    exportCsv('laporan-rekap-kasir', rekapKasir.value.data, [
      { key: 'nama_pelanggan', label: 'Pelanggan' }, { key: 'total_tunai', label: 'Tunai' },
      { key: 'total_transfer', label: 'Transfer' }, { key: 'total_uang_muka', label: 'Uang Muka' }, { key: 'total', label: 'Total' },
    ])
  else if (tab.value === 'stok')
    exportCsv('laporan-stok', stok.value.data, [
      { key: 'kode_barang', label: 'Kode' }, { key: 'nama_barang', label: 'Barang' }, { key: 'nama_golongan', label: 'Golongan' },
      { key: 'stok', label: 'Stok' }, { key: 'harga_beli', label: 'Harga Beli' }, { key: 'nilai_stok', label: 'Nilai Stok' },
    ])
  else
    exportCsv('laporan-stok-pergolongan', stokPergolongan.value.data, [
      { key: 'nama_golongan', label: 'Golongan' }, { key: 'jumlah_barang', label: 'Jumlah Barang' },
      { key: 'total_stok', label: 'Total Stok' }, { key: 'nilai_stok', label: 'Nilai Stok' },
    ])
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i class="pi pi-chart-bar"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Laporan</h1>
        <p class="text-sm text-slate-500">Analisis penjualan, pembelian, keuangan, dan stok</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:flex-wrap sm:items-end">
      <template v-if="dateRangeTabs.includes(tab)">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Dari</label>
          <DatePicker v-model="startDate" date-format="dd/mm/yy" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Sampai</label>
          <DatePicker v-model="endDate" date-format="dd/mm/yy" />
        </div>
      </template>
      <div v-if="tab === 'rekap-kasir'">
        <label class="mb-1 block text-xs font-medium text-slate-500">Tanggal</label>
        <DatePicker v-model="singleDate" date-format="dd/mm/yy" />
      </div>
      <div v-if="tab === 'pembelian'" class="w-48">
        <label class="mb-1 block text-xs font-medium text-slate-500">Supplier</label>
        <InputText v-model="supplierFilter" placeholder="Nama supplier…" fluid />
      </div>
      <div v-if="tab === 'jurnal'" class="w-56">
        <label class="mb-1 block text-xs font-medium text-slate-500">Akun</label>
        <Select v-model="akunFilter" :options="akunOpts" option-label="label" option-value="value" show-clear filter placeholder="Semua akun" fluid />
      </div>
      <div v-if="tab === 'stok'" class="w-56">
        <label class="mb-1 block text-xs font-medium text-slate-500">Golongan</label>
        <Select v-model="golonganFilter" :options="golonganOpts" option-label="label" option-value="value" show-clear filter placeholder="Semua golongan" fluid />
      </div>
      <Button label="Terapkan" icon="pi pi-filter" @click="load" />
      <Button label="Ekspor CSV" icon="pi pi-download" severity="secondary" outlined class="sm:ml-auto" @click="doExport" />
    </div>

    <!-- Tabs -->
    <div class="mb-4 flex gap-2 overflow-x-auto">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        :class="tab === t.key
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="switchTab(t.key)"
      >
        <i :class="t.icon"></i> {{ t.label }}
      </button>
    </div>

    <!-- Penjualan -->
    <div v-if="tab === 'penjualan'">
      <div class="mb-4 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Jumlah Faktur</p><p class="text-xl font-bold">{{ angka(penjualan.jumlah_faktur) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Total Omzet</p><p class="text-xl font-bold text-indigo-600">{{ rupiah(penjualan.total_omzet) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Total Terbayar</p><p class="text-xl font-bold text-emerald-600">{{ rupiah(penjualan.total_terbayar) }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="penjualan.data" :loading="loading" paginator :rows="12" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
          <Column header="Faktur"><template #body="{ data }">#{{ data.id }}</template></Column>
          <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
          <Column field="nama_pelanggan" header="Pelanggan" />
          <Column header="Total"><template #body="{ data }">{{ rupiah(data.total) }}</template></Column>
          <Column header="Status"><template #body="{ data }"><Tag :value="data.status" :severity="data.status === 'lunas' ? 'success' : 'warn'" /></template></Column>
        </DataTable>
      </div>
    </div>

    <!-- Penjualan Barang -->
    <div v-else-if="tab === 'barang'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="barang.data" :loading="loading" paginator :rows="12" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data.</div></template>
        <Column field="barang" header="Barang" />
        <Column header="Qty Terjual"><template #body="{ data }">{{ angka(data.qty) }}</template></Column>
        <Column header="Omzet"><template #body="{ data }">{{ rupiah(data.omzet) }}</template></Column>
      </DataTable>
    </div>

    <!-- Penjualan Persales -->
    <div v-else-if="tab === 'per-sales'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="perSales.data" :loading="loading" paginator :rows="12" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
        <Column field="nama_sales" header="Sales" />
        <Column header="Jumlah Faktur"><template #body="{ data }">{{ angka(data.jumlah_faktur) }}</template></Column>
        <Column header="Total"><template #body="{ data }"><span class="font-semibold text-indigo-600">{{ rupiah(data.total) }}</span></template></Column>
      </DataTable>
    </div>

    <!-- Pembelian -->
    <div v-else-if="tab === 'pembelian'">
      <div class="mb-4 grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Jumlah Faktur</p><p class="text-xl font-bold">{{ angka(pembelian.jumlah_faktur) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Total Pembelian</p><p class="text-xl font-bold text-indigo-600">{{ rupiah(pembelian.total_pembelian) }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="pembelian.data" :loading="loading" paginator :rows="12" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
          <Column header="No"><template #body="{ data }">#{{ data.id }}</template></Column>
          <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
          <Column field="nama_supplier" header="Supplier" />
          <Column header="Ongkos Angkut"><template #body="{ data }">{{ rupiah(data.ongkos_angkut) }}</template></Column>
          <Column header="Total"><template #body="{ data }">{{ rupiah(data.total) }}</template></Column>
        </DataTable>
      </div>
    </div>

    <!-- Pembayaran -->
    <div v-else-if="tab === 'pembayaran'">
      <div class="mb-4 flex flex-wrap gap-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Total Diterima</p><p class="text-lg font-bold text-indigo-600">{{ rupiah(pembayaran.total) }}</p>
        </div>
        <div v-for="(v, k) in pembayaran.per_metode" :key="k" class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">{{ k }}</p>
          <p class="text-lg font-bold text-emerald-600">{{ rupiah(v as number) }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="pembayaran.data" :loading="loading" paginator :rows="12" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Belum ada pembayaran pada rentang ini.</div></template>
          <Column header="Faktur"><template #body="{ data }">#{{ data.id_rekap }}</template></Column>
          <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
          <Column field="nama_pelanggan" header="Pelanggan" />
          <Column field="nama_sales" header="Sales" />
          <Column field="metode_bayar" header="Metode" />
          <Column header="Nominal"><template #body="{ data }">{{ rupiah(data.nominal) }}</template></Column>
        </DataTable>
      </div>
    </div>

    <!-- Jurnal -->
    <div v-else-if="tab === 'jurnal'">
      <div class="mb-4 grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Total Debet</p><p class="text-xl font-bold text-indigo-600">{{ rupiah(jurnal.total_debet) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Total Kredit</p><p class="text-xl font-bold text-emerald-600">{{ rupiah(jurnal.total_kredit) }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="jurnal.data" :loading="loading" paginator :rows="12" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
          <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
          <Column field="nama_akun" header="Akun" />
          <Column field="keterangan" header="Keterangan" />
          <Column header="Debet"><template #body="{ data }">{{ rupiah(data.debet) }}</template></Column>
          <Column header="Kredit"><template #body="{ data }">{{ rupiah(data.kredit) }}</template></Column>
        </DataTable>
      </div>
    </div>

    <!-- Jatuh Tempo -->
    <div v-else-if="tab === 'jatuh-tempo'">
      <div class="mb-4 grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p class="text-xs text-amber-600 dark:text-amber-400">Total Sisa Piutang</p>
          <p class="text-xl font-bold text-amber-700 dark:text-amber-300">{{ rupiah(jatuhTempo.total_sisa) }}</p>
        </div>
        <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
          <p class="text-xs text-rose-600 dark:text-rose-400">Faktur Terlambat</p>
          <p class="text-xl font-bold text-rose-700 dark:text-rose-300">{{ angka(jatuhTempo.jumlah_terlambat) }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="jatuhTempo.data" :loading="loading" paginator :rows="12" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada piutang jatuh tempo. 🎉</div></template>
          <Column header="Faktur"><template #body="{ data }">#{{ data.id }}</template></Column>
          <Column field="nama_pelanggan" header="Pelanggan" />
          <Column header="Jatuh Tempo"><template #body="{ data }">{{ data.jatuh_tempo?.substring(0, 10) }}</template></Column>
          <Column header="Sisa"><template #body="{ data }">{{ rupiah(data.sisa) }}</template></Column>
          <Column header="Keterlambatan">
            <template #body="{ data }">
              <Tag v-if="data.hari_terlambat > 0" :value="`Terlambat ${data.hari_terlambat} hari`" severity="danger" />
              <Tag v-else value="Belum jatuh tempo" severity="info" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Estimasi Laba -->
    <div v-else-if="tab === 'laba'">
      <div class="mb-4 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Omzet</p><p class="text-xl font-bold text-indigo-600">{{ rupiah(laba.total_omzet) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">Modal (HPP)</p><p class="text-xl font-bold text-slate-600 dark:text-slate-300">{{ rupiah(laba.total_modal) }}</p>
        </div>
        <div class="rounded-2xl border p-4"
             :class="laba.total_laba >= 0 ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10'">
          <p class="text-xs text-slate-500">Laba Kotor</p>
          <p class="text-xl font-bold" :class="laba.total_laba >= 0 ? 'text-emerald-600' : 'text-rose-600'">{{ rupiah(laba.total_laba) }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="laba.data" :loading="loading" paginator :rows="12" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data.</div></template>
          <Column field="barang" header="Barang" />
          <Column header="Qty"><template #body="{ data }">{{ angka(data.qty) }}</template></Column>
          <Column header="Omzet"><template #body="{ data }">{{ rupiah(data.omzet) }}</template></Column>
          <Column header="Modal"><template #body="{ data }">{{ rupiah(data.modal) }}</template></Column>
          <Column header="Laba">
            <template #body="{ data }">
              <span :class="data.laba >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="font-semibold">{{ rupiah(data.laba) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Kasir -->
    <div v-else-if="tab === 'kasir'">
      <div class="mb-4 flex flex-wrap gap-3">
        <div v-for="(v, k) in kasir.per_metode" :key="k" class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs text-slate-500">{{ k }}</p>
          <p class="text-lg font-bold text-indigo-600">{{ rupiah(v as number) }}</p>
        </div>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="kasir.data" :loading="loading" paginator :rows="12" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data pada rentang ini.</div></template>
          <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
          <Column field="nama_pelanggan" header="Pelanggan" />
          <Column field="nama_user" header="Kasir" />
          <Column field="metode_bayar" header="Metode" />
          <Column header="Bayar"><template #body="{ data }">{{ rupiah(data.bayar) }}</template></Column>
          <Column header="Total"><template #body="{ data }">{{ rupiah(data.total) }}</template></Column>
        </DataTable>
      </div>
    </div>

    <!-- Rekap Kasir -->
    <div v-else-if="tab === 'rekap-kasir'" class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rekapKasir.data" :loading="loading" paginator :rows="12" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Tidak ada transaksi pada tanggal ini.</div></template>
        <Column field="nama_pelanggan" header="Pelanggan" />
        <Column header="Tunai"><template #body="{ data }">{{ rupiah(data.total_tunai) }}</template></Column>
        <Column header="Transfer"><template #body="{ data }">{{ rupiah(data.total_transfer) }}</template></Column>
        <Column header="Uang Muka"><template #body="{ data }">{{ rupiah(data.total_uang_muka) }}</template></Column>
        <Column header="Total"><template #body="{ data }"><span class="font-semibold">{{ rupiah(data.total) }}</span></template></Column>
      </DataTable>
    </div>

    <!-- Stok -->
    <div v-else-if="tab === 'stok'">
      <div class="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs text-slate-500">Total Nilai Stok</p><p class="text-xl font-bold text-indigo-600">{{ rupiah(stok.total_nilai) }}</p>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="stok.data" :loading="loading" paginator :rows="15" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data.</div></template>
          <Column field="kode_barang" header="Kode" />
          <Column field="nama_barang" header="Barang" />
          <Column field="nama_golongan" header="Golongan" />
          <Column header="Stok"><template #body="{ data }">{{ angka(data.stok) }}</template></Column>
          <Column header="Harga Beli"><template #body="{ data }">{{ rupiah(data.harga_beli) }}</template></Column>
          <Column header="Nilai Stok"><template #body="{ data }"><span class="font-semibold">{{ rupiah(data.nilai_stok) }}</span></template></Column>
        </DataTable>
      </div>
    </div>

    <!-- Stok Pergolongan -->
    <div v-else>
      <div class="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs text-slate-500">Total Nilai Stok</p><p class="text-xl font-bold text-indigo-600">{{ rupiah(stokPergolongan.total_nilai) }}</p>
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="stokPergolongan.data" :loading="loading" paginator :rows="15" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Tidak ada data.</div></template>
          <Column field="nama_golongan" header="Golongan" />
          <Column header="Jumlah Barang"><template #body="{ data }">{{ angka(data.jumlah_barang) }}</template></Column>
          <Column header="Total Stok"><template #body="{ data }">{{ angka(data.total_stok) }}</template></Column>
          <Column header="Nilai Stok"><template #body="{ data }"><span class="font-semibold">{{ rupiah(data.nilai_stok) }}</span></template></Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
