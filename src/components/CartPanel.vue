<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import { useConfirm } from 'primevue/useconfirm'
import { catalogApi } from '@/api'
import { rupiah } from '@/utils/format'
import type { Pelanggan } from '@/types'
import { useCartStore } from '@/stores/cart'

defineEmits<{ pay: [] }>()

const cart = useCartStore()
const confirm = useConfirm()

const pelangganList = ref<Pelanggan[]>([])
const selectedPelangganId = ref<number | null>(null)
const ppnAktif = ref(false)

onMounted(async () => {
  pelangganList.value = await catalogApi.pelanggan()
})

watch(selectedPelangganId, (id) => {
  const p = pelangganList.value.find((x) => x.id === id) ?? null
  cart.setPelanggan(p)
})

watch(ppnAktif, (v) => cart.setPPN(v ? 11 : 0))

function incQty(id: number, qty: number) {
  cart.updateQty(id, qty + 1)
}
function decQty(id: number, qty: number) {
  if (qty <= 1) return
  cart.updateQty(id, qty - 1)
}
function confirmClear() {
  confirm.require({
    message: 'Kosongkan seluruh keranjang?',
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, kosongkan',
    acceptClass: 'p-button-danger',
    accept: () => {
      cart.clear()
      selectedPelangganId.value = null
      ppnAktif.value = false
    },
  })
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Pelanggan -->
    <div class="border-b border-slate-200 p-4 dark:border-slate-800">
      <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Pelanggan</label>
      <Select
        v-model="selectedPelangganId"
        :options="pelangganList"
        option-label="nama_pelanggan"
        option-value="id"
        filter
        placeholder="Pilih pelanggan"
        fluid
        :pt="{ root: 'w-full' }"
      >
        <template #option="{ option }">
          <div>
            <p class="font-medium">{{ option.nama_pelanggan }}</p>
            <p class="text-xs text-slate-400">{{ option.alamat || 'Tanpa alamat' }}</p>
          </div>
        </template>
      </Select>
    </div>

    <!-- Daftar item -->
    <div class="scroll-area flex-1 p-4">
      <div v-if="!cart.summary.items.length" class="flex h-full flex-col items-center justify-center text-center text-slate-400">
        <i class="pi pi-shopping-cart mb-3 text-4xl opacity-40"></i>
        <p class="text-sm">Keranjang masih kosong.<br />Pilih barang untuk memulai.</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in cart.summary.items"
          :key="item.id"
          class="animate-pop rounded-xl border border-slate-200 p-3 dark:border-slate-800"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate font-semibold text-slate-800 dark:text-slate-100">{{ item.barang }}</p>
              <p class="text-xs text-slate-500">{{ item.satuan }} · {{ rupiah(item.harga) }}</p>
            </div>
            <button class="text-slate-400 hover:text-red-500" @click="cart.remove(item.id)">
              <i class="pi pi-trash"></i>
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Button icon="pi pi-minus" text rounded size="small" @click="decQty(item.id, item.jumlah)" />
              <span class="w-8 text-center font-semibold text-slate-700 dark:text-slate-200">{{ item.jumlah }}</span>
              <Button icon="pi pi-plus" text rounded size="small" @click="incQty(item.id, item.jumlah)" />
            </div>
            <span class="font-bold text-slate-800 dark:text-white">{{ rupiah(item.subtotal) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ringkasan & aksi -->
    <div class="border-t border-slate-200 p-4 dark:border-slate-800">
      <div class="mb-3 flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
        <div>
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200">PPN 11%</p>
          <p class="text-xs text-slate-400">Aktifkan bila faktur pajak</p>
        </div>
        <ToggleSwitch v-model="ppnAktif" />
      </div>

      <div class="space-y-1 text-sm">
        <div class="flex justify-between text-slate-500">
          <span>Subtotal</span><span>{{ rupiah(cart.summary.subtotal) }}</span>
        </div>
        <div v-if="cart.summary.total_diskon" class="flex justify-between text-slate-500">
          <span>Diskon</span><span>- {{ rupiah(cart.summary.total_diskon) }}</span>
        </div>
        <div v-if="cart.summary.ppn_nominal" class="flex justify-between text-slate-500">
          <span>PPN</span><span>{{ rupiah(cart.summary.ppn_nominal) }}</span>
        </div>
        <div class="flex justify-between border-t border-dashed border-slate-200 pt-2 text-base font-bold text-slate-800 dark:border-slate-700 dark:text-white">
          <span>Total</span><span>{{ rupiah(cart.summary.total) }}</span>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <Button
          icon="pi pi-trash"
          severity="secondary"
          outlined
          :disabled="!cart.summary.items.length"
          @click="confirmClear"
        />
        <Button
          label="Bayar"
          icon="pi pi-wallet"
          class="flex-1"
          size="large"
          :disabled="!cart.summary.items.length"
          @click="$emit('pay')"
        />
      </div>
    </div>
  </div>
</template>
