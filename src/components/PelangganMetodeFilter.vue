<script setup lang="ts">
// Filter pelanggan + metode pembayaran untuk daftar penjualan (Riwayat Transaksi & Laporan Penjualan).
import { ref, onMounted } from 'vue'
import Select from 'primevue/select'
import { catalogApi } from '@/api'

const pelanggan = defineModel<number | null>('pelanggan', { default: null })
const metode = defineModel<string | null>('metode', { default: null })
defineProps<{ labelClass?: string }>()

const pelangganOpts = ref<{ label: string; value: number }[]>([])
const metodeOpts = ref<string[]>([])

onMounted(async () => {
  // ponytail: katalog pelanggan dibatasi 200 baris oleh backend; ganti ke pencarian server bila pelanggan lebih banyak.
  const [p, m] = await Promise.all([catalogApi.pelanggan(), catalogApi.metodePembayaran()])
  pelangganOpts.value = p.map((x) => ({ label: x.nama_pelanggan, value: x.id }))
  metodeOpts.value = [...new Set(m.map((x) => x.pembayaran))] // nama bisa dobel (mis. BNI)
})
</script>

<template>
  <div class="w-full sm:w-56">
    <label for="filter-pelanggan" :class="labelClass">Pelanggan</label>
    <Select
      v-model="pelanggan"
      input-id="filter-pelanggan"
      :options="pelangganOpts"
      option-label="label"
      option-value="value"
      filter
      show-clear
      placeholder="Semua pelanggan"
      fluid
    />
  </div>
  <div class="w-full sm:w-48">
    <label for="filter-metode" :class="labelClass">Metode bayar</label>
    <Select v-model="metode" input-id="filter-metode" :options="metodeOpts" show-clear placeholder="Semua metode" fluid />
  </div>
</template>
