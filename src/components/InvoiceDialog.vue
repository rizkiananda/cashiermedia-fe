<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { checkoutApi } from '@/api'
import { rupiah } from '@/utils/format'
import type { Invoice } from '@/types'

const props = defineProps<{ visible: boolean; rekapId: number | null }>()
const emit = defineEmits<{ 'update:visible': [boolean] }>()

const invoice = ref<Invoice | null>(null)
const loading = ref(false)

watch(
  () => props.visible,
  async (v) => {
    if (v && props.rekapId) {
      loading.value = true
      invoice.value = null
      try {
        invoice.value = await checkoutApi.invoice(props.rekapId)
      } finally {
        loading.value = false
      }
    }
  },
)

function printInvoice() {
  window.print()
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '26rem' }"
    class="mx-4"
    header="Faktur"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="loading" class="py-10 text-center text-slate-400">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div v-else-if="invoice" id="invoice-print" class="text-sm">
      <div class="text-center">
        <h3 class="text-lg font-extrabold text-slate-800 dark:text-white">
          {{ invoice.perusahaan.nama_perusahaan }}
        </h3>
        <p class="text-xs text-slate-500">{{ invoice.perusahaan.daerah }}</p>
      </div>

      <div class="my-3 border-y border-dashed border-slate-300 py-2 text-xs text-slate-600 dark:text-slate-300">
        <div class="flex justify-between"><span>No. Faktur</span><span>#{{ invoice.rekap.id }}</span></div>
        <div class="flex justify-between"><span>Tanggal</span><span>{{ invoice.rekap.tanggal?.substring(0, 10) }} {{ invoice.rekap.jam }}</span></div>
        <div class="flex justify-between"><span>Pelanggan</span><span>{{ invoice.pelanggan.nama_pelanggan }}</span></div>
        <div v-if="invoice.rekap.nomor_po" class="flex justify-between"><span>No. PO</span><span>{{ invoice.rekap.nomor_po }}</span></div>
      </div>

      <table class="w-full">
        <tbody>
          <tr v-for="d in invoice.detail" :key="d.id" class="align-top">
            <td class="py-1">
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ d.barang }}</p>
              <p class="text-xs text-slate-500">{{ d.jumlah }} {{ d.satuan }} × {{ rupiah(d.harga_jual) }}</p>
            </td>
            <td class="py-1 text-right font-medium text-slate-700 dark:text-slate-200">{{ rupiah(d.subtotal) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-3 space-y-1 border-t border-dashed border-slate-300 pt-3 text-slate-700 dark:text-slate-200">
        <div class="flex justify-between text-base font-bold">
          <span>Total</span><span>{{ rupiah(invoice.rekap.total) }}</span>
        </div>
        <div class="flex justify-between text-xs"><span>Bayar</span><span>{{ rupiah(invoice.rekap.total_bayar) }}</span></div>
        <div class="flex justify-between text-xs"><span>Metode</span><span>{{ invoice.rekap.metode_bayar || '-' }}</span></div>
        <div class="flex justify-between text-xs">
          <span>Status</span>
          <span :class="invoice.rekap.status === 'lunas' ? 'text-emerald-600' : 'text-amber-600'" class="font-semibold uppercase">
            {{ invoice.rekap.status }}
          </span>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-slate-400">Terima kasih atas transaksinya 🙏</p>
    </div>

    <template #footer>
      <Button label="Tutup" text severity="secondary" @click="emit('update:visible', false)" />
      <Button label="Cetak" icon="pi pi-print" @click="printInvoice" />
    </template>
  </Dialog>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #invoice-print,
  #invoice-print * {
    visibility: visible;
  }
  #invoice-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
