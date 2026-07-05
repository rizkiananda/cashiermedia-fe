<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { isDark, toggle } = useTheme()

// Ilustrasi produk beranimasi (bukan foto asli — mockup demo landing page).
const ICON_NOODLE = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-full w-full overflow-visible">
  <defs>
    <linearGradient id="g-noodle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fda4af"/>
      <stop offset="100%" stop-color="#e11d48"/>
    </linearGradient>
  </defs>
  <ellipse cx="12" cy="21.5" rx="7.5" ry="1.2" fill="black" fill-opacity=".2"/>
  <g class="animate-float">
    <rect x="4" y="9" width="16" height="12.5" rx="2.5" fill="url(#g-noodle)"/>
    <rect x="4" y="9" width="16" height="4" rx="2.5" fill="#fecdd3"/>
    <path d="M7 15c1.4 1 2.4-1 3.8 0s2.4-1 3.8 0s2.4-1 1.9 0" stroke="white" stroke-opacity=".85" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    <path d="M7 18.3c1.4 1 2.4-1 3.8 0s2.4-1 3.8 0s2.4-1 1.9 0" stroke="white" stroke-opacity=".85" stroke-width="1.3" stroke-linecap="round" fill="none"/>
  </g>
  <g stroke="white" stroke-width="1.3" stroke-linecap="round" fill="none">
    <path class="animate-steam" d="M9 7c-1.1-1.4 1.1-2 0-3.6" style="animation-delay:0s"/>
    <path class="animate-steam" d="M12.6 7c-1.1-1.4 1.1-2 0-3.6" style="animation-delay:.5s"/>
    <path class="animate-steam" d="M16.2 7c-1.1-1.4 1.1-2 0-3.6" style="animation-delay:1s"/>
  </g>
</svg>`
const ICON_BOTTLE = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-full w-full overflow-visible">
  <defs>
    <linearGradient id="g-bottle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
    <clipPath id="c-bottle">
      <path d="M10 3.5h4v2.6c0 .5.2 1 .5 1.4l.9 1.1c.4.5.6 1.1.6 1.8V19a2.5 2.5 0 0 1-2.5 2.5h-2A2.5 2.5 0 0 1 9 19V10.4c0-.7.2-1.3.6-1.8l.9-1.1c.3-.4.5-.9.5-1.4V3.5Z"/>
    </clipPath>
  </defs>
  <ellipse cx="12" cy="22.5" rx="6" ry="1.1" fill="black" fill-opacity=".2"/>
  <g class="animate-float">
    <rect x="9.5" y="1.5" width="5" height="2.4" rx=".6" fill="#065f46"/>
    <path d="M10 3.5h4v2.6c0 .5.2 1 .5 1.4l.9 1.1c.4.5.6 1.1.6 1.8V19a2.5 2.5 0 0 1-2.5 2.5h-2A2.5 2.5 0 0 1 9 19V10.4c0-.7.2-1.3.6-1.8l.9-1.1c.3-.4.5-.9.5-1.4V3.5Z" fill="url(#g-bottle)"/>
    <g clip-path="url(#c-bottle)">
      <circle class="animate-bubble" cx="11" cy="19" r=".6" fill="white" fill-opacity=".8" style="animation-delay:0s"/>
      <circle class="animate-bubble" cx="13.2" cy="18" r=".5" fill="white" fill-opacity=".8" style="animation-delay:.7s"/>
      <circle class="animate-bubble" cx="12" cy="20" r=".4" fill="white" fill-opacity=".8" style="animation-delay:1.3s"/>
    </g>
    <rect x="8.7" y="13" width="6.6" height="4.8" rx="1" fill="white" fill-opacity=".18"/>
  </g>
</svg>`
const ICON_RICE = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-full w-full overflow-visible">
  <defs>
    <linearGradient id="g-rice" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <ellipse cx="12" cy="21.7" rx="7" ry="1.2" fill="black" fill-opacity=".2"/>
  <g class="animate-sway">
    <path d="M8.2 3h7.6l1.3 3.6c1 2.7 1.4 4.8 1.4 7.1C18.5 18.6 15.7 21 12 21s-6.5-2.4-6.5-7.3c0-2.3.4-4.4 1.4-7.1L8.2 3Z" fill="url(#g-rice)"/>
    <path d="M9.3 3c0 1.4.5 2.3 2.7 2.3s2.7-.9 2.7-2.3" stroke="#92400e" stroke-width="1.4" fill="none"/>
    <rect x="8.3" y="12.5" width="7.4" height="5" rx="1" fill="white" fill-opacity=".2"/>
  </g>
</svg>`
const ICON_OIL = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-full w-full overflow-visible">
  <defs>
    <linearGradient id="g-oil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <clipPath id="c-oil">
      <path d="M7.3 8.3h9.4l1 2.6c.5 1.3.8 2.7.8 4.1V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2v-4c0-1.4.3-2.8.8-4.1l1-2.6Z"/>
    </clipPath>
  </defs>
  <ellipse cx="12" cy="22.5" rx="7" ry="1.1" fill="black" fill-opacity=".2"/>
  <g class="animate-float">
    <rect x="10.3" y="1.5" width="3.4" height="2.4" rx=".6" fill="#78350f"/>
    <rect x="9.3" y="3.9" width="5.4" height="4.6" rx="1" fill="#d97706"/>
    <path d="M7.3 8.3h9.4l1 2.6c.5 1.3.8 2.7.8 4.1V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2v-4c0-1.4.3-2.8.8-4.1l1-2.6Z" fill="url(#g-oil)"/>
    <g clip-path="url(#c-oil)">
      <rect class="animate-shine" x="10" y="6" width="2.4" height="18" fill="white" fill-opacity=".55"/>
    </g>
    <rect x="7.8" y="13" width="8.4" height="5.4" rx="1" fill="white" fill-opacity=".16"/>
  </g>
</svg>`

const mockProducts = [
  { nama: 'Indomie Goreng', harga: 'Rp 3.500', svg: ICON_NOODLE, bg: 'from-rose-50 to-orange-50 dark:from-rose-500/10 dark:to-orange-500/5' },
  { nama: 'Teh Botol Sosro', harga: 'Rp 5.000', svg: ICON_BOTTLE, bg: 'from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/5' },
  { nama: 'Beras Premium 5kg', harga: 'Rp 68.000', svg: ICON_RICE, bg: 'from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/5' },
  { nama: 'Minyak Goreng 2L', harga: 'Rp 32.000', svg: ICON_OIL, bg: 'from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/5' },
]

const mockCart = [
  { nama: 'Indomie Goreng', qty: 2, harga: 'Rp 7.000' },
  { nama: 'Teh Botol Sosro', qty: 1, harga: 'Rp 5.000' },
  { nama: 'Roti Tawar', qty: 1, harga: 'Rp 7.500' },
]

// Contoh tampilan dashboard (data dummy demo, bukan data toko sungguhan).
const mockStats = [
  { label: 'Pendapatan hari ini', value: 'Rp 4.250.000', icon: 'pi pi-shopping-cart', color: 'from-sky-500 to-sky-600' },
  { label: 'Pendapatan bulan ini', value: 'Rp 128.600.000', icon: 'pi pi-chart-pie', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Pendapatan tahun ini', value: 'Rp 1,42 M', icon: 'pi pi-chart-bar', color: 'from-rose-500 to-rose-600' },
]

const mockSecondary = [
  { label: 'Transaksi Hari Ini', value: '128', icon: 'pi pi-receipt', color: 'from-violet-500 to-violet-600' },
  { label: 'Total Piutang', value: 'Rp 6,2 Jt', icon: 'pi pi-hourglass', color: 'from-amber-500 to-amber-600' },
  { label: 'Pelanggan Aktif', value: '312', icon: 'pi pi-users', color: 'from-fuchsia-500 to-fuchsia-600' },
  { label: 'Stok Menipis', value: '7', icon: 'pi pi-exclamation-triangle', color: 'from-rose-500 to-rose-600' },
]

const mockChart = [40, 55, 48, 62, 58, 70, 65, 80, 74, 90, 85, 96]

const features = [
  {
    icon: 'pi pi-bolt',
    title: 'Kasir Kilat',
    desc: 'Cari barang, tambah keranjang, dan selesaikan pembayaran dalam hitungan detik. Dirancang untuk antrean yang sibuk.',
  },
  {
    icon: 'pi pi-database',
    title: 'Stok Real-time',
    desc: 'Setiap transaksi otomatis memperbarui stok. Pantau barang menipis dan lakukan opname langsung dari sistem.',
  },
  {
    icon: 'pi pi-tags',
    title: 'Multi-satuan & Harga Fleksibel',
    desc: 'Satu barang, banyak satuan (pcs, dus, karton) dengan harga berbeda per tipe pelanggan — grosir maupun eceran.',
  },
  {
    icon: 'pi pi-truck',
    title: 'Pembelian & Retur',
    desc: 'Kelola pembelian dari supplier dan retur penjualan pelanggan tanpa ribet, semua tercatat rapi.',
  },
  {
    icon: 'pi pi-wallet',
    title: 'Piutang, Hutang & Jurnal',
    desc: 'Pantau piutang pelanggan, hutang supplier, hingga jurnal keuangan — semua dalam satu dashboard.',
  },
  {
    icon: 'pi pi-chart-bar',
    title: 'Laporan Lengkap',
    desc: 'Laporan penjualan, laba, dan performa barang siap ekspor kapan saja untuk pengambilan keputusan.',
  },
  {
    icon: 'pi pi-percentage',
    title: 'Diskon & Promo',
    desc: 'Atur diskon per barang atau promo khusus untuk mendorong penjualan tanpa proses manual.',
  },
  {
    icon: 'pi pi-mobile',
    title: 'Multi-perangkat',
    desc: 'Akses dari PC, tablet, maupun ponsel. Tampilan responsif menyesuaikan layar kasir Anda.',
  },
]

const highlights = [
  { icon: 'pi pi-gauge', title: 'Cepat', desc: 'Alur transaksi diringkas seminim mungkin klik.' },
  { icon: 'pi pi-shield', title: 'Akurat', desc: 'Stok, harga, dan laporan selalu sinkron dan konsisten.' },
  { icon: 'pi pi-sitemap', title: 'Fleksibel', desc: 'Menyesuaikan alur bisnis distribusi & grosir Anda.' },
]

function goLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
    <!-- Navbar -->
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2.5">
          <div class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
            <i class="pi pi-shopping-cart"></i>
          </div>
          <span class="text-lg font-extrabold tracking-tight">CashierMedia</span>
        </div>

        <nav class="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a href="#fitur" class="hover:text-indigo-600 dark:hover:text-indigo-400">Fitur</a>
          <a href="#kenapa" class="hover:text-indigo-600 dark:hover:text-indigo-400">Kenapa Kami</a>
        </nav>

        <div class="flex items-center gap-1 sm:gap-2">
          <Button
            :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
            text rounded
            aria-label="Ganti tema"
            @click="toggle"
          />
          <Button label="Masuk" icon="pi pi-sign-in" @click="goLogin" />
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="pointer-events-none absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl"></div>
      <div class="pointer-events-none absolute top-40 left-[-10%] h-96 w-96 rounded-full bg-sky-400/20 blur-3xl"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div class="animate-pop">
          <span class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <i class="pi pi-star-fill text-[10px]"></i> Point of Sale untuk Distribusi & Grosir
          </span>

          <h1 class="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Kelola kasir, stok, dan
            <span class="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">keuangan toko</span>
            dalam satu sistem.
          </h1>

          <p class="mt-5 max-w-lg text-base text-slate-600 dark:text-slate-400 sm:text-lg">
            CashierMedia membantu transaksi jadi lebih cepat, stok selalu akurat, dan laporan
            selalu siap — cocok untuk toko grosir, distributor, maupun ritel dengan banyak
            satuan dan tipe pelanggan.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <Button label="Mulai Sekarang" icon="pi pi-arrow-right" icon-pos="right" size="large" @click="goLogin" />
            <Button label="Lihat Fitur" severity="secondary" outlined size="large" @click="$el.ownerDocument.querySelector('#fitur')?.scrollIntoView({ behavior: 'smooth' })" />
          </div>

          <div class="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-2"><i class="pi pi-check-circle text-emerald-500"></i> Multi-satuan & harga per pelanggan</span>
            <span class="flex items-center gap-2"><i class="pi pi-check-circle text-emerald-500"></i> Stok & laporan real-time</span>
          </div>
        </div>

        <!-- Mock preview kasir -->
        <div class="relative animate-pop">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span class="ml-3 text-xs font-medium text-slate-400">Kasir — CashierMedia</span>
            </div>
            <div class="grid grid-cols-5 gap-4 p-4">
              <div class="col-span-3 grid grid-cols-2 gap-3">
                <div
                  v-for="p in mockProducts"
                  :key="p.nama"
                  class="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div class="aspect-square w-full rounded-lg bg-gradient-to-br p-3" :class="p.bg">
                    <div v-html="p.svg"></div>
                  </div>
                  <p class="mt-2 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{{ p.nama }}</p>
                  <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ p.harga }}</p>
                </div>
              </div>
              <div class="col-span-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <i class="pi pi-shopping-cart text-indigo-500"></i> Keranjang
                </div>
                <div class="mt-3 space-y-2.5">
                  <div v-for="c in mockCart" :key="c.nama" class="flex items-center justify-between gap-2 text-xs">
                    <span class="truncate text-slate-600 dark:text-slate-300">{{ c.qty }}× {{ c.nama }}</span>
                    <span class="shrink-0 font-semibold text-slate-700 dark:text-slate-200">{{ c.harga }}</span>
                  </div>
                </div>
                <div class="mt-4 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
                  <div class="flex items-center justify-between text-xs text-slate-400">
                    <span>Total</span>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Rp 19.500</span>
                  </div>
                  <div class="mt-2 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 text-xs font-semibold text-white">
                    <i class="pi pi-wallet text-xs"></i> Bayar
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="absolute -bottom-5 -left-5 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div class="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <i class="pi pi-check"></i>
            </div>
            <div>
              <p class="text-sm font-bold leading-none">Transaksi Selesai</p>
              <p class="mt-1 text-xs text-slate-400">Stok otomatis terupdate</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fitur -->
    <section id="fitur" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">Semua yang toko Anda butuhkan</h2>
        <p class="mt-4 text-slate-600 dark:text-slate-400">
          Dari transaksi harian sampai laporan keuangan, satu sistem yang menyatukan seluruh operasional toko.
        </p>
      </div>

      <div class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="f in features"
          :key="f.title"
          class="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50"
        >
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400">
            <i :class="f.icon" class="text-lg"></i>
          </div>
          <h3 class="mt-4 font-bold text-slate-800 dark:text-white">{{ f.title }}</h3>
          <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Preview Dashboard -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div class="order-2 lg:order-1">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-center gap-1.5 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span class="ml-3 text-xs font-medium text-slate-400">Dashboard — CashierMedia</span>
            </div>

            <div class="p-4">
              <div class="grid grid-cols-3 gap-2.5">
                <div
                  v-for="s in mockStats"
                  :key="s.label"
                  class="relative overflow-hidden rounded-xl bg-gradient-to-br p-3 text-white"
                  :class="s.color"
                >
                  <i :class="s.icon" class="absolute -bottom-2 -right-2 text-3xl opacity-20"></i>
                  <p class="relative truncate text-sm font-extrabold">{{ s.value }}</p>
                  <p class="relative mt-0.5 truncate text-[10px] text-white/85">{{ s.label }}</p>
                </div>
              </div>

              <div class="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Omzet Tahunan</span>
                  <span class="text-slate-400">2026</span>
                </div>
                <div class="mt-3 flex h-20 items-end gap-1.5">
                  <div
                    v-for="(h, i) in mockChart"
                    :key="i"
                    class="animate-grow-bar flex-1 rounded-t bg-gradient-to-t from-indigo-600 to-sky-400"
                    :style="{ height: `${h}%`, animationDelay: `${i * 0.06}s` }"
                  ></div>
                </div>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div
                  v-for="c in mockSecondary"
                  :key="c.label"
                  class="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div class="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br text-white" :class="c.color">
                    <i :class="c.icon" class="text-xs"></i>
                  </div>
                  <p class="mt-1.5 truncate text-[10px] text-slate-400">{{ c.label }}</p>
                  <p class="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{{ c.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <span class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <i class="pi pi-th-large text-[10px]"></i> Dashboard
          </span>
          <h2 class="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Pantau performa toko dalam sekali lihat</h2>
          <p class="mt-4 text-slate-600 dark:text-slate-400">
            Pendapatan harian, bulanan, hingga tahunan, grafik omzet, transaksi terbaru, sampai barang
            terlaris — semua tersaji rapi di satu dashboard tanpa perlu buka banyak menu.
          </p>
          <div class="mt-6 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <p class="flex items-center gap-2"><i class="pi pi-check-circle text-emerald-500"></i> Grafik omzet tahunan & bulanan real-time</p>
            <p class="flex items-center gap-2"><i class="pi pi-check-circle text-emerald-500"></i> Peringatan stok menipis & piutang jatuh tempo</p>
            <p class="flex items-center gap-2"><i class="pi pi-check-circle text-emerald-500"></i> Barang terlaris & transaksi terbaru sekilas pandang</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Kenapa Kami -->
    <section id="kenapa" class="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">Dibangun untuk kecepatan operasional toko</h2>
            <p class="mt-4 text-slate-600 dark:text-slate-400">
              CashierMedia dirancang khusus untuk alur kerja toko grosir & distribusi: banyak satuan,
              banyak tipe pelanggan, dan volume transaksi tinggi — tanpa mengorbankan kecepatan.
            </p>

            <div class="mt-8 space-y-5">
              <div v-for="h in highlights" :key="h.title" class="flex gap-4">
                <div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
                  <i :class="h.icon"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-800 dark:text-white">{{ h.title }}</h3>
                  <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ h.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <i class="pi pi-receipt text-2xl text-indigo-600 dark:text-indigo-400"></i>
              <p class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Penjualan Harian</p>
              <p class="text-xs text-slate-400">Rekap otomatis per hari</p>
            </div>
            <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <i class="pi pi-car text-2xl text-sky-600 dark:text-sky-400"></i>
              <p class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Armada & Ritase</p>
              <p class="text-xs text-slate-400">Kendaraan, supir, pengiriman</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <i class="pi pi-sync text-2xl text-emerald-600 dark:text-emerald-400"></i>
              <p class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Mutasi Gudang</p>
              <p class="text-xs text-slate-400">Pindah stok antar gudang</p>
            </div>
            <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
              <i class="pi pi-globe text-2xl text-amber-600 dark:text-amber-400"></i>
              <p class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Order Online</p>
              <p class="text-xs text-slate-400">Terima pesanan dari luar toko</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 px-6 py-14 text-center text-white sm:px-12">
        <div class="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl"></div>
        <h2 class="relative text-3xl font-extrabold tracking-tight sm:text-4xl">Siap merapikan operasional toko Anda?</h2>
        <p class="relative mx-auto mt-4 max-w-xl text-white/80">
          Masuk ke sistem dan mulai kelola kasir, stok, dan laporan dalam satu tempat.
        </p>
        <Button
          label="Masuk ke Sistem"
          icon="pi pi-sign-in"
          size="large"
          class="!bg-white !text-indigo-700 !border-white hover:!bg-white/90 relative mt-8"
          @click="goLogin"
        />
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-200 dark:border-slate-800">
      <div class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div class="flex items-center gap-2">
          <div class="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
            <i class="pi pi-shopping-cart text-xs"></i>
          </div>
          <span class="font-semibold text-slate-700 dark:text-slate-300">CashierMedia</span>
        </div>
        <p>© {{ new Date().getFullYear() }} CashierMedia POS. Seluruh hak cipta dilindungi.</p>
      </div>
    </footer>
  </div>
</template>
