<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { catalogApi } from '@/api'
import { rupiah } from '@/utils/format'
import type { Barang, HargaItem } from '@/types'

export interface LineItem {
  id_barang: number
  id_satuan: number
  jumlah: number
  harga: number
  diskon: number
  _nama: string
  _satuan: string
}

const props = defineProps<{ modelValue: LineItem[]; showDiskon?: boolean; hargaLabel?: string }>()
const emit = defineEmits<{ 'update:modelValue': [LineItem[]] }>()

const toast = useToast()

const suggestions = ref<Barang[]>([])
const picked = ref<Barang | null>(null)
const form = reactive({ id_satuan: 0, jumlah: 1, harga: 0, diskon: 0 })

const satuanOpts = computed<HargaItem[]>(() => picked.value?.items ?? [])

async function searchBarang(e: { query: string }) {
  suggestions.value = await catalogApi.barang(e.query)
}

function onPick() {
  const opt = satuanOpts.value[0]
  form.id_satuan = opt?.id_satuan ?? 0
  form.harga = opt?.harga_jual ?? 0
}

watch(
  () => form.id_satuan,
  (id) => {
    const opt = satuanOpts.value.find((o) => o.id_satuan === id)
    if (opt && !props.showDiskon) form.harga = opt.harga_jual
  },
)

function addLine() {
  if (!picked.value || !form.id_satuan) {
    toast.add({ severity: 'warn', summary: 'Lengkapi', detail: 'Pilih barang & satuan', life: 2500 })
    return
  }
  const opt = satuanOpts.value.find((o) => o.id_satuan === form.id_satuan)
  const line: LineItem = {
    id_barang: picked.value.id,
    id_satuan: form.id_satuan,
    jumlah: form.jumlah,
    harga: form.harga,
    diskon: form.diskon,
    _nama: picked.value.nama_barang,
    _satuan: opt?.nama_satuan ?? '',
  }
  emit('update:modelValue', [...props.modelValue, line])
  picked.value = null
  Object.assign(form, { id_satuan: 0, jumlah: 1, harga: 0, diskon: 0 })
}

function removeLine(idx: number) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}

const total = computed(() =>
  props.modelValue.reduce((n, l) => n + (l.harga * l.jumlah - (l.diskon || 0)), 0),
)
</script>

<template>
  <div>
    <!-- Form tambah baris -->
    <div class="rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-12">
        <div class="col-span-2 lg:col-span-4">
          <label class="mb-1 block text-xs font-medium text-slate-500">Barang</label>
          <AutoComplete
            v-model="picked"
            :suggestions="suggestions"
            option-label="nama_barang"
            placeholder="Cari barang…"
            fluid
            complete-on-focus
            @complete="searchBarang"
            @item-select="onPick"
          >
            <template #option="{ option }">
              <div>
                <p class="font-medium">{{ option.nama_barang }}</p>
                <p class="text-xs text-slate-400">{{ option.kode_barang }} · stok {{ option.stok }}</p>
              </div>
            </template>
          </AutoComplete>
        </div>
        <div class="lg:col-span-2">
          <label class="mb-1 block text-xs font-medium text-slate-500">Satuan</label>
          <Select v-model="form.id_satuan" :options="satuanOpts" option-label="nama_satuan" option-value="id_satuan" placeholder="Satuan" fluid />
        </div>
        <div class="lg:col-span-1">
          <label class="mb-1 block text-xs font-medium text-slate-500">Qty</label>
          <InputNumber v-model="form.jumlah" :min="1" fluid />
        </div>
        <div class="lg:col-span-2">
          <label class="mb-1 block text-xs font-medium text-slate-500">{{ hargaLabel || 'Harga' }}</label>
          <InputNumber v-model="form.harga" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
        <div v-if="showDiskon" class="lg:col-span-2">
          <label class="mb-1 block text-xs font-medium text-slate-500">Diskon</label>
          <InputNumber v-model="form.diskon" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
        <div class="col-span-2 flex items-end lg:col-span-1">
          <Button icon="pi pi-plus" label="Tambah" class="w-full" @click="addLine" />
        </div>
      </div>
    </div>

    <!-- Daftar baris -->
    <div class="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table class="w-full min-w-[520px] text-sm">
        <thead class="bg-slate-100 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
          <tr>
            <th class="p-3">Barang</th>
            <th class="p-3">Satuan</th>
            <th class="p-3 text-center">Qty</th>
            <th class="p-3 text-right">Harga</th>
            <th v-if="showDiskon" class="p-3 text-right">Diskon</th>
            <th class="p-3 text-right">Subtotal</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, i) in modelValue" :key="i" class="border-t border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium text-slate-700 dark:text-slate-200">{{ l._nama }}</td>
            <td class="p-3">{{ l._satuan }}</td>
            <td class="p-3 text-center">{{ l.jumlah }}</td>
            <td class="p-3 text-right">{{ rupiah(l.harga) }}</td>
            <td v-if="showDiskon" class="p-3 text-right">{{ rupiah(l.diskon) }}</td>
            <td class="p-3 text-right font-semibold">{{ rupiah(l.harga * l.jumlah - (l.diskon || 0)) }}</td>
            <td class="p-3 text-right">
              <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeLine(i)" />
            </td>
          </tr>
          <tr v-if="!modelValue.length">
            <td :colspan="showDiskon ? 7 : 6" class="p-6 text-center text-slate-400">Belum ada barang ditambahkan.</td>
          </tr>
        </tbody>
        <tfoot v-if="modelValue.length" class="border-t border-slate-200 dark:border-slate-700">
          <tr>
            <td :colspan="showDiskon ? 5 : 4"></td>
            <td class="p-3 text-right text-xs font-semibold uppercase text-slate-500">Total</td>
            <td class="p-3 text-right text-base font-bold text-indigo-600 dark:text-indigo-400">{{ rupiah(total) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
