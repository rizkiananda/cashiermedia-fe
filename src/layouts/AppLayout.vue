<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { isDark, toggle } = useTheme()

const mobileOpen = ref(false)
const userMenu = ref()

interface NavItem { label: string; icon: string; to: string }
interface NavGroup { title: string; items: NavItem[] }

// Navigasi bergrup — akan bertambah seiring modul baru.
const navGroups: NavGroup[] = [
  {
    title: 'Utama',
    items: [
      { label: 'Dashboard', icon: 'pi pi-th-large', to: '/app' },
      { label: 'Kasir', icon: 'pi pi-shopping-cart', to: '/app/kasir' },
      { label: 'Penjualan Hari Ini', icon: 'pi pi-receipt', to: '/app/penjualan' },
      { label: 'Order Online', icon: 'pi pi-globe', to: '/app/order-online' },
    ],
  },
  {
    title: 'Inventori',
    items: [
      { label: 'Stok', icon: 'pi pi-database', to: '/app/stok' },
      { label: 'Kartu Stok', icon: 'pi pi-book', to: '/app/kartu-stok' },
      { label: 'Pembelian', icon: 'pi pi-shopping-bag', to: '/app/pembelian' },
      { label: 'Retur Penjualan', icon: 'pi pi-replay', to: '/app/retur' },
      { label: 'Mutasi Gudang', icon: 'pi pi-arrow-right-arrow-left', to: '/app/mutasi' },
      { label: 'Pengiriman', icon: 'pi pi-truck', to: '/app/pengiriman' },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Piutang', icon: 'pi pi-hourglass', to: '/app/piutang' },
      { label: 'Hutang', icon: 'pi pi-credit-card', to: '/app/hutang' },
      { label: 'Uang Muka', icon: 'pi pi-wallet', to: '/app/uang-muka' },
      { label: 'Jurnal', icon: 'pi pi-book', to: '/app/jurnal' },
      { label: 'Laporan', icon: 'pi pi-chart-bar', to: '/app/laporan' },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { label: 'Barang', icon: 'pi pi-box', to: '/app/barang' },
      { label: 'Diskon & Promo', icon: 'pi pi-percentage', to: '/app/diskon' },
      { label: 'Golongan', icon: 'pi pi-sitemap', to: '/app/master/golongan' },
      { label: 'Satuan', icon: 'pi pi-tags', to: '/app/master/satuan' },
      { label: 'Supplier', icon: 'pi pi-truck', to: '/app/master/supplier' },
      { label: 'Pelanggan', icon: 'pi pi-users', to: '/app/master/pelanggan' },
      { label: 'Sales', icon: 'pi pi-user', to: '/app/master/sales' },
      { label: 'Metode Bayar', icon: 'pi pi-credit-card', to: '/app/master/metode-pembayaran' },
    ],
  },
  {
    title: 'Armada',
    items: [
      { label: 'Kendaraan', icon: 'pi pi-car', to: '/app/master/kendaraan' },
      { label: 'Jenis Kendaraan', icon: 'pi pi-tag', to: '/app/master/jenis-kendaraan' },
      { label: 'Supir', icon: 'pi pi-id-card', to: '/app/master/supir' },
      { label: 'Kernet', icon: 'pi pi-users', to: '/app/master/kernet' },
      { label: 'Laporan Ritase', icon: 'pi pi-map', to: '/app/ritase' },
    ],
  },
]

const allItems = computed(() => navGroups.flatMap((g) => g.items))
const currentLabel = computed(() => {
  const match = allItems.value
    .filter((i) => isActive(i.to))
    .sort((a, b) => b.to.length - a.to.length)[0]
  return match?.label || 'CashierMedia'
})

const initials = computed(() => {
  const n = auth.user?.nama || auth.user?.username || '?'
  return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
})

const userMenuItems = [
  { label: auth.user?.nama || 'Pengguna' },
  { separator: true },
  {
    label: 'Keluar',
    icon: 'pi pi-sign-out',
    command: () => {
      auth.logout()
      router.replace('/login')
    },
  },
]

function go(to: string) {
  router.push(to)
  mobileOpen.value = false
}

function isActive(to: string) {
  return to === '/app' ? route.path === '/app' : route.path === to
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950">
    <!-- Sidebar desktop -->
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-slate-50
             dark:border-slate-800 dark:bg-slate-900 lg:flex"
    >
      <div class="flex h-16 shrink-0 items-center gap-3 px-5">
        <div class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
          <i class="pi pi-shopping-cart"></i>
        </div>
        <span class="text-lg font-extrabold text-slate-800 dark:text-white">CashierMedia</span>
      </div>

      <nav class="scroll-area flex-1 space-y-5 px-3 py-4">
        <div v-for="group in navGroups" :key="group.title">
          <p class="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{{ group.title }}</p>
          <div class="space-y-0.5">
            <button
              v-for="item in group.items"
              :key="item.to"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              :class="isActive(item.to)
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'"
              @click="go(item.to)"
            >
              <i :class="item.icon" class="text-base"></i>
              {{ item.label }}
            </button>
          </div>
        </div>
      </nav>

      <div class="shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
        <div class="rounded-xl bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <p class="truncate font-semibold text-slate-700 dark:text-slate-200">{{ auth.user?.nama_perusahaan }}</p>
          <p class="mt-0.5 capitalize">{{ auth.user?.role }}</p>
        </div>
      </div>
    </aside>

    <!-- Drawer mobile -->
    <Drawer v-model:visible="mobileOpen" position="left" class="!w-72">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white">
            <i class="pi pi-shopping-cart"></i>
          </div>
          <span class="text-lg font-extrabold">CashierMedia</span>
        </div>
      </template>
      <nav class="space-y-5">
        <div v-for="group in navGroups" :key="group.title">
          <p class="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{{ group.title }}</p>
          <div class="space-y-0.5">
            <button
              v-for="item in group.items"
              :key="item.to"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              :class="isActive(item.to)
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'"
              @click="go(item.to)"
            >
              <i :class="item.icon"></i>
              {{ item.label }}
            </button>
          </div>
        </div>
      </nav>
    </Drawer>

    <!-- Konten -->
    <div class="lg:pl-64">
      <header
        class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-4
               backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6"
      >
        <Button icon="pi pi-bars" text rounded class="lg:hidden" aria-label="Menu" @click="mobileOpen = true" />
        <div class="min-w-0">
          <h1 class="truncate text-base font-bold text-slate-800 dark:text-white">{{ currentLabel }}</h1>
          <p class="truncate text-xs text-slate-500 dark:text-slate-400 lg:hidden">{{ auth.user?.nama_perusahaan }}</p>
        </div>

        <div class="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
            text rounded
            aria-label="Ganti tema"
            v-tooltip.bottom="isDark ? 'Mode terang' : 'Mode gelap'"
            @click="toggle"
          />
          <button
            class="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="userMenu.toggle($event)"
          >
            <Avatar :label="initials" shape="circle" class="!bg-indigo-600 !text-white" />
            <span class="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">{{ auth.user?.nama }}</span>
            <i class="pi pi-chevron-down hidden text-xs text-slate-400 sm:block"></i>
          </button>
          <Menu ref="userMenu" :model="userMenuItems" popup />
        </div>
      </header>

      <main class="p-4 pb-24 sm:p-6 lg:pb-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
