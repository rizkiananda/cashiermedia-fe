<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { rupiah } from '@/utils/format'
import { catalogApi, checkoutApi, type CheckoutPayload } from '@/api'
import { errorMessage } from '@/api/client'
import type { MetodePembayaran } from '@/types'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  'update:visible': [boolean]
  paid: [number] // id_rekap
}>()

const cart = useCartStore()
const toast = useToast()

const metodeList = ref<MetodePembayaran[]>([])
const metode = ref<number>(1)
const bayar = ref<number>(0)
const nomorPO = ref('')
const processing = ref(false)

const total = computed(() => cart.summary.total)
const kembalian = computed(() => Math.max(0, bayar.value - total.value))
const sisa = computed(() => Math.max(0, total.value - bayar.value))
const isPiutang = computed(() => bayar.value < total.value)

const quickAmounts = computed(() => {
  const t = total.value
  const rounded = Math.ceil(t / 50000) * 50000
  return Array.from(new Set([t, rounded, rounded + 50000, Math.ceil(t / 100000) * 100000])).filter((n) => n > 0)
})

watch(
  () => props.visible,
  async (v) => {
    if (v) {
      bayar.value = cart.summary.total
      nomorPO.value = ''
      if (!metodeList.value.length) {
        try {
          metodeList.value = await catalogApi.metodePembayaran()
          if (metodeList.value.length) metode.value = metodeList.value[0].id
        } catch (e) {
          toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
        }
      }
    }
  },
)

async function submit() {
  if (!cart.pelanggan) {
    toast.add({ severity: 'warn', summary: 'Pelanggan kosong', detail: 'Pilih pelanggan dulu', life: 3000 })
    return
  }
  processing.value = true
  try {
    const payload: CheckoutPayload = {
      id_pelanggan: cart.pelanggan.id,
      nomor_po: nomorPO.value,
      bayar: bayar.value,
      metode_pembayaran: metode.value,
    }
    const res = await checkoutApi.checkout(payload)
    toast.add({
      severity: 'success',
      summary: 'Transaksi berhasil',
      detail: res.status === 'lunas' ? 'Pembayaran lunas' : `Sisa piutang ${rupiah(res.sisa)}`,
      life: 3000,
    })
    emit('paid', res.id_rekap)
    emit('update:visible', false)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal checkout', detail: errorMessage(e), life: 4000 })
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Pembayaran"
    :style="{ width: '32rem' }"
    class="mx-4"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-5">
      <!-- Ringkasan total -->
      <div class="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-5 text-white">
        <p class="text-sm text-white/80">Total tagihan</p>
        <p class="text-3xl font-extrabold tracking-tight">{{ rupiah(total) }}</p>
        <p class="mt-1 text-xs text-white/70">
          {{ cart.summary.items.length }} item · Pelanggan: {{ cart.pelanggan?.nama_pelanggan || '—' }}
        </p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Metode pembayaran</label>
        <Select
          v-model="metode"
          :options="metodeList"
          option-label="pembayaran"
          option-value="id"
          placeholder="Pilih metode"
          fluid
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal bayar</label>
        <InputNumber v-model="bayar" :min="0" mode="currency" currency="IDR" locale="id-ID" fluid input-class="text-lg font-semibold" />
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="a in quickAmounts"
            :key="a"
            class="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200
                   dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="bayar = a"
          >
            {{ rupiah(a) }}
          </button>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor PO (opsional)</label>
        <InputText v-model="nomorPO" placeholder="Mis. PO-2026-001" fluid />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
          <p class="text-xs text-emerald-600 dark:text-emerald-400">Kembalian</p>
          <p class="text-lg font-bold text-emerald-700 dark:text-emerald-300">{{ rupiah(kembalian) }}</p>
        </div>
        <div class="rounded-xl p-3" :class="isPiutang ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-slate-100 dark:bg-slate-800/60'">
          <p class="text-xs" :class="isPiutang ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'">
            {{ isPiutang ? 'Sisa (piutang)' : 'Sisa' }}
          </p>
          <p class="text-lg font-bold" :class="isPiutang ? 'text-amber-700 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200'">
            {{ rupiah(sisa) }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Batal" text severity="secondary" @click="emit('update:visible', false)" />
      <Button
        :label="isPiutang ? 'Bayar Sebagian' : 'Bayar & Selesai'"
        icon="pi pi-check"
        :loading="processing"
        @click="submit"
      />
    </template>
  </Dialog>
</template>
