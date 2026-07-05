<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import { rupiah, tipePelangganLabel } from '@/utils/format'
import type { Barang, HargaItem } from '@/types'

const props = defineProps<{ visible: boolean; barang: Barang | null }>()
const emit = defineEmits<{
  'update:visible': [boolean]
  add: [{ item: HargaItem; jumlah: number; diskon: number }]
}>()

const selected = ref<HargaItem | null>(null)
const jumlah = ref(1)
const diskon = ref(0)

watch(
  () => props.visible,
  (v) => {
    if (v && props.barang) {
      selected.value = props.barang.items[0] ?? null
      jumlah.value = 1
      diskon.value = 0
    }
  },
)

const subtotal = computed(() => {
  const h = selected.value?.harga_jual ?? 0
  return h * jumlah.value - diskon.value
})

function submit() {
  if (!selected.value) return
  emit('add', { item: selected.value, jumlah: jumlah.value, diskon: diskon.value })
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '30rem' }"
    class="mx-4"
    :header="barang?.nama_barang || 'Tambah Barang'"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="barang" class="space-y-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Kode: {{ barang.kode_barang || '-' }} · Stok: {{ barang.stok }}
      </p>

      <div>
        <label class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Pilih satuan & harga
        </label>
        <div class="space-y-2">
          <label
            v-for="it in barang.items"
            :key="it.id_item_barang"
            class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors"
            :class="selected?.id_item_barang === it.id_item_barang
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
              : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'"
          >
            <RadioButton v-model="selected" :value="it" :input-id="`it-${it.id_item_barang}`" />
            <div class="min-w-0 flex-1">
              <p class="font-medium text-slate-800 dark:text-slate-100">
                {{ it.nama_satuan }}
                <span class="ml-1 text-xs text-slate-400">(isi {{ it.konversi }})</span>
              </p>
              <p class="text-xs text-slate-500">{{ tipePelangganLabel(it.tipe_pelanggan) }}</p>
            </div>
            <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ rupiah(it.harga_jual) }}</span>
          </label>
          <p v-if="!barang.items.length" class="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Barang ini belum memiliki harga/satuan.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah</label>
          <InputNumber v-model="jumlah" :min="1" show-buttons button-layout="horizontal" fluid>
            <template #incrementbuttonicon><i class="pi pi-plus" /></template>
            <template #decrementbuttonicon><i class="pi pi-minus" /></template>
          </InputNumber>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Diskon (Rp)</label>
          <InputNumber v-model="diskon" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
      </div>

      <div class="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800/60">
        <span class="text-sm text-slate-500">Subtotal</span>
        <span class="text-lg font-bold text-slate-800 dark:text-white">{{ rupiah(subtotal) }}</span>
      </div>
    </div>

    <template #footer>
      <Button label="Batal" text severity="secondary" @click="emit('update:visible', false)" />
      <Button label="Tambah" icon="pi pi-cart-plus" :disabled="!selected" @click="submit" />
    </template>
  </Dialog>
</template>
