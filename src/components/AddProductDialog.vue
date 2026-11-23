<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import SelectButton from 'primevue/selectbutton'
import { rupiah } from '@/utils/format'
import { useTipePelanggan } from '@/composables/useTipePelanggan'
import type { Barang, HargaItem } from '@/types'

const props = defineProps<{ visible: boolean; barang: Barang | null }>()
const emit = defineEmits<{
  'update:visible': [boolean]
  add: [{ item: HargaItem; harga: number; jumlah: number; diskon: number }]
}>()

const selected = ref<HargaItem | null>(null)
const harga = ref(0)
const jumlah = ref(1)
const diskon = ref(0)

// Tipe pelanggan menentukan daftar harga yang tampil; default Retail.
const { list: tipeList, label: tipeLabel, defaultId: tipeDefault, ready: tipeReady } = useTipePelanggan()
const tipe = ref(1)
const items = computed(() => props.barang?.items.filter((i) => i.tipe_pelanggan === tipe.value) ?? [])

// Ganti tipe → pertahankan satuan yang sama bila ada, selain itu satuan pertama.
watch(tipe, () => {
  const satuan = selected.value?.id_satuan
  selected.value = items.value.find((i) => i.id_satuan === satuan) ?? items.value[0] ?? null
})

// Ganti satuan → harga kembali ke harga jual satuan tsb.
watch(selected, (it) => (harga.value = it?.harga_jual ?? 0))

watch(
  () => props.visible,
  async (v) => {
    if (v && props.barang) {
      await tipeReady()
      tipe.value = tipeDefault()
      selected.value = items.value[0] ?? null
      harga.value = selected.value?.harga_jual ?? 0
      jumlah.value = 1
      diskon.value = 0
    }
  },
)

const subtotal = computed(() => {
  return (harga.value ?? 0) * jumlah.value - diskon.value
})

function submit() {
  if (!selected.value) return
  emit('add', { item: selected.value, harga: harga.value ?? 0, jumlah: jumlah.value, diskon: diskon.value })
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

      <div v-if="tipeList.length > 1">
        <label class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Tipe pelanggan</label>
        <SelectButton
          v-model="tipe"
          :options="tipeList"
          option-label="nama"
          option-value="id"
          :allow-empty="false"
          aria-label="Tipe pelanggan"
          class="w-full"
          :pt="{ pcToggleButton: { root: 'flex-1' } }"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Pilih satuan & harga
        </label>
        <div class="space-y-2">
          <label
            v-for="it in items"
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
            </div>
            <span class="font-semibold text-indigo-600 dark:text-indigo-400">{{ rupiah(it.harga_jual) }}</span>
          </label>
          <p v-if="!items.length" class="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            {{ barang.items.length ? `Belum ada harga ${tipeLabel(tipe)} untuk barang ini.` : 'Barang ini belum memiliki harga/satuan.' }}
          </p>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Harga satuan (Rp)</label>
        <InputNumber v-model="harga" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
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
