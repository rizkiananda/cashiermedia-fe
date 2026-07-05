<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Badge from 'primevue/badge'
import { useToast } from 'primevue/usetoast'
import { catalogApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'
import type { Barang, HargaItem } from '@/types'
import { useCartStore } from '@/stores/cart'
import AddProductDialog from '@/components/AddProductDialog.vue'
import PaymentDialog from '@/components/PaymentDialog.vue'
import InvoiceDialog from '@/components/InvoiceDialog.vue'
import CartPanel from '@/components/CartPanel.vue'

const cart = useCartStore()
const toast = useToast()

const barangList = ref<Barang[]>([])
const loadingBarang = ref(false)
const search = ref('')

const selectedBarang = ref<Barang | null>(null)
const addDialog = ref(false)
const paymentDialog = ref(false)
const invoiceDialog = ref(false)
const lastRekapId = ref<number | null>(null)
const mobileCartOpen = ref(false)

let searchTimer: ReturnType<typeof setTimeout>

const itemCount = computed(() => cart.summary.items.reduce((n, i) => n + i.jumlah, 0))

onMounted(async () => {
  await Promise.all([loadBarang(), cart.refresh()])
})

async function loadBarang() {
  loadingBarang.value = true
  try {
    barangList.value = await catalogApi.barang(search.value)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat barang', detail: errorMessage(e), life: 3000 })
  } finally {
    loadingBarang.value = false
  }
}

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadBarang, 350)
})

function openAdd(barang: Barang) {
  if (!barang.items?.length) {
    toast.add({ severity: 'warn', summary: 'Belum ada harga', detail: 'Barang ini belum memiliki harga/satuan', life: 3000 })
    return
  }
  selectedBarang.value = barang
  addDialog.value = true
}

async function handleAdd(payload: { item: HargaItem; jumlah: number; diskon: number }) {
  if (!selectedBarang.value) return
  try {
    await cart.add({
      id_barang: selectedBarang.value.id,
      id_satuan: payload.item.id_satuan,
      tipe_pelanggan: payload.item.tipe_pelanggan,
      jumlah: payload.jumlah,
      harga: payload.item.harga_jual,
      diskon: payload.diskon,
      id_pelanggan: cart.pelanggan?.id ?? 0,
    })
    toast.add({ severity: 'success', summary: 'Ditambahkan', detail: selectedBarang.value.nama_barang, life: 1500 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  }
}

function onPay() {
  mobileCartOpen.value = false
  paymentDialog.value = true
}

async function onPaid(rekapId: number) {
  lastRekapId.value = rekapId
  invoiceDialog.value = true
  await cart.refresh()
}

// Harga termurah untuk ditampilkan di kartu produk.
function hargaMulai(b: Barang): number {
  if (!b.items?.length) return 0
  return Math.min(...b.items.map((i) => i.harga_jual))
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_380px]">
    <!-- Kolom produk -->
    <section class="min-w-0">
      <!-- Pencarian -->
      <div class="mb-4 flex items-center gap-2">
        <span class="relative flex-1">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <InputText
            v-model="search"
            placeholder="Cari nama atau kode barang…"
            class="w-full !pl-10"
            size="large"
          />
        </span>
        <Button icon="pi pi-refresh" severity="secondary" outlined :loading="loadingBarang" @click="loadBarang" v-tooltip.bottom="'Muat ulang'" />
      </div>

      <!-- Grid produk -->
      <div v-if="loadingBarang && !barangList.length" class="py-20 text-center text-slate-400">
        <i class="pi pi-spin pi-spinner text-3xl"></i>
        <p class="mt-2 text-sm">Memuat barang…</p>
      </div>

      <div v-else-if="!barangList.length" class="py-20 text-center text-slate-400">
        <i class="pi pi-inbox text-4xl opacity-40"></i>
        <p class="mt-2 text-sm">Barang tidak ditemukan.</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <button
          v-for="b in barangList"
          :key="b.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left
                 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg
                 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50"
          @click="openAdd(b)"
        >
          <div class="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img v-if="b.gambar" :src="b.gambar" :alt="b.nama_barang" class="h-full w-full object-cover" />
            <div v-else class="grid h-full w-full place-items-center text-slate-300 dark:text-slate-600">
              <i class="pi pi-box text-3xl"></i>
            </div>
            <span
              class="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 backdrop-blur dark:bg-slate-900/80"
            >
              {{ b.nama_golongan || 'Umum' }}
            </span>
            <span
              class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white
                     opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              <i class="pi pi-plus text-sm"></i>
            </span>
          </div>
          <div class="flex flex-1 flex-col p-3">
            <p class="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{{ b.nama_barang }}</p>
            <div class="mt-auto pt-2">
              <p class="text-[11px] text-slate-400">Mulai dari</p>
              <p class="font-bold text-indigo-600 dark:text-indigo-400">{{ rupiah(hargaMulai(b)) }}</p>
            </div>
          </div>
        </button>
      </div>
    </section>

    <!-- Panel keranjang (desktop) -->
    <aside class="hidden lg:block">
      <div
        class="sticky top-24 flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50
               dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 class="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <i class="pi pi-shopping-cart text-indigo-600"></i> Keranjang
          </h2>
          <Badge v-if="itemCount" :value="itemCount" />
        </div>
        <CartPanel class="flex-1" @pay="onPay" />
      </div>
    </aside>

    <!-- Bar keranjang (mobile) -->
    <div class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-slate-50 p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:hidden">
      <Button class="w-full" size="large" :disabled="!cart.summary.items.length" @click="mobileCartOpen = true">
        <div class="flex w-full items-center justify-between">
          <span class="flex items-center gap-2">
            <i class="pi pi-shopping-cart"></i>
            <Badge :value="itemCount" severity="contrast" />
            Lihat Keranjang
          </span>
          <span class="font-bold">{{ rupiah(cart.summary.total) }}</span>
        </div>
      </Button>
    </div>

    <!-- Drawer keranjang (mobile) -->
    <Drawer v-model:visible="mobileCartOpen" position="right" class="!w-full sm:!w-96" header="Keranjang">
      <CartPanel class="-mx-5 -mb-5 h-[calc(100vh-6rem)]" @pay="onPay" />
    </Drawer>

    <!-- Dialog -->
    <AddProductDialog v-model:visible="addDialog" :barang="selectedBarang" @add="handleAdd" />
    <PaymentDialog v-model:visible="paymentDialog" @paid="onPaid" />
    <InvoiceDialog v-model:visible="invoiceDialog" :rekap-id="lastRekapId" />
  </div>
</template>
