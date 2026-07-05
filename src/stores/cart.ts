import { defineStore } from 'pinia'
import { ref } from 'vue'
import { cartApi, type AddItemPayload } from '@/api'
import type { CartSummary, Pelanggan } from '@/types'

const empty: CartSummary = {
  items: [],
  subtotal: 0,
  total_diskon: 0,
  ppn_persen: 0,
  ppn_nominal: 0,
  total: 0,
  header: { id_pelanggan: 0, id_sales: 0, ppn: 0, id_rit_kendaraan: 0, id_supir: 0, id_kernet: 0 },
}

// Store keranjang: menjaga sinkron dengan keranjang server (tabel `keranjang`).
export const useCartStore = defineStore('cart', () => {
  const summary = ref<CartSummary>({ ...empty })
  const pelanggan = ref<Pelanggan | null>(null)
  const loading = ref(false)

  function set(s: CartSummary) {
    summary.value = s
  }

  async function refresh() {
    loading.value = true
    try {
      set(await cartApi.get())
    } finally {
      loading.value = false
    }
  }

  async function add(payload: AddItemPayload) {
    set(await cartApi.add(payload))
  }

  async function updateQty(id: number, jumlah: number) {
    set(await cartApi.update(id, { jumlah }))
  }

  async function updateItem(id: number, payload: { jumlah?: number; harga?: number; diskon?: number }) {
    set(await cartApi.update(id, payload))
  }

  async function remove(id: number) {
    set(await cartApi.remove(id))
  }

  async function setPPN(ppn: number) {
    set(await cartApi.updateHeader({ ppn }))
  }

  async function setPelanggan(p: Pelanggan | null) {
    pelanggan.value = p
    set(await cartApi.updateHeader({ id_pelanggan: p?.id ?? 0 }))
  }

  async function clear() {
    set(await cartApi.clear())
    pelanggan.value = null
  }

  return {
    summary,
    pelanggan,
    loading,
    refresh,
    add,
    updateQty,
    updateItem,
    remove,
    setPPN,
    setPelanggan,
    clear,
  }
})
