import { ref } from 'vue'
import { catalogApi } from '@/api'
import type { TipePelanggan } from '@/types'

// Daftar tipe pelanggan (tingkat harga) dari tabel tipe_pelanggan, dimuat sekali per sesi.
const list = ref<TipePelanggan[]>([])
let loading: Promise<void> | null = null

export function useTipePelanggan() {
  if (!loading) {
    loading = catalogApi
      .tipePelanggan()
      .then((d) => {
        list.value = d
      })
      .catch(() => {
        loading = null // coba lagi saat dipakai berikutnya
      })
  }
  const label = (id: number) => list.value.find((t) => t.id === id)?.nama ?? `Tipe ${id}`
  // Default: yang bernama "Retail", selain itu tipe pertama.
  const defaultId = () => (list.value.find((t) => /retail/i.test(t.nama)) ?? list.value[0])?.id ?? 1
  return { list, label, defaultId, ready: () => loading ?? Promise.resolve() }
}
