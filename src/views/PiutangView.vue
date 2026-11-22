<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { keuanganApi, catalogApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'
import type { MetodePembayaran, RiwayatPiutang } from '@/types'

const toast = useToast()
const rows = ref<any[]>([])
const totalSisa = ref(0)
const loading = ref(false)
const status = ref<'hutang' | 'lunas'>('hutang')
const expanded = ref<Record<string, boolean>>({})

// Ringkasan per pelanggan; faktur tetap urut sesuai backend (tanggal).
const perPelanggan = computed(() => {
  const map = new Map<number, { id_pelanggan: number; nama_pelanggan: string; faktur: any[]; nominal: number; retur: number; sisa: number }>()
  for (const r of rows.value) {
    let g = map.get(r.id_pelanggan)
    if (!g) map.set(r.id_pelanggan, (g = { id_pelanggan: r.id_pelanggan, nama_pelanggan: r.nama_pelanggan || 'Umum', faktur: [], nominal: 0, retur: 0, sisa: 0 }))
    g.faktur.push(r)
    g.nominal += r.nominal
    g.retur += r.retur
    g.sisa += r.sisa
  }
  return [...map.values()].sort((a, b) => b.sisa - a.sisa || a.nama_pelanggan.localeCompare(b.nama_pelanggan))
})

const riwayatDialog = ref(false)
const riwayatTarget = ref<any>(null)
const riwayat = ref<RiwayatPiutang | null>(null)
const loadingRiwayat = ref(false)

function tgl(s: string) {
  return s ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
}

async function openRiwayat(row: any) {
  riwayatTarget.value = row
  riwayat.value = null
  riwayatDialog.value = true
  loadingRiwayat.value = true
  try {
    riwayat.value = await keuanganApi.riwayatPiutang(row.id)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat riwayat', detail: errorMessage(e), life: 3000 })
  } finally {
    loadingRiwayat.value = false
  }
}

function setStatus(s: 'hutang' | 'lunas') {
  status.value = s
  expanded.value = {}
  load()
}

const dialog = ref(false)
const target = ref<any>(null)
const nominal = ref(0)
const metode = ref('')
const metodeList = ref<MetodePembayaran[]>([])
const saving = ref(false)

onMounted(async () => {
  await load()
  metodeList.value = await catalogApi.metodePembayaran()
})

async function load() {
  loading.value = true
  try {
    const res = await keuanganApi.piutang(status.value)
    rows.value = res.data
    totalSisa.value = res.total_sisa
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat', detail: errorMessage(e), life: 3000 })
  } finally {
    loading.value = false
  }
}

function openBayar(row: any) {
  target.value = row
  nominal.value = row.sisa
  metode.value = metodeList.value[0]?.pembayaran ?? 'Cash'
  dialog.value = true
}

async function bayar() {
  if (!target.value) return
  saving.value = true
  try {
    await keuanganApi.bayarPiutang(target.value.id, { nominal: nominal.value, metode_bayar: metode.value })
    toast.add({ severity: 'success', summary: 'Pembayaran tercatat', life: 2000 })
    dialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        <i class="pi pi-hourglass"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Piutang</h1>
        <p class="text-sm text-slate-500">Tagihan yang belum dilunasi pelanggan</p>
      </div>
    </div>

    <div class="mb-4 flex gap-2" role="tablist" aria-label="Status piutang">
      <button
        v-for="t in ([{ key: 'hutang', label: 'Belum Lunas', icon: 'pi pi-hourglass' }, { key: 'lunas', label: 'Lunas', icon: 'pi pi-check-circle' }] as const)"
        :key="t.key"
        role="tab"
        :aria-selected="status === t.key"
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        :class="status === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="setStatus(t.key)"
      >
        <i :class="t.icon"></i> {{ t.label }}
      </button>
    </div>

    <div v-if="status === 'hutang'" class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
      <p class="text-sm text-amber-700 dark:text-amber-300">Total Piutang Berjalan</p>
      <p class="text-2xl font-extrabold text-amber-800 dark:text-amber-200">{{ rupiah(totalSisa) }}</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable
        v-model:expanded-rows="expanded"
        :value="perPelanggan"
        data-key="id_pelanggan"
        :loading="loading"
        paginator
        :rows="10"
        class="text-sm"
      >
        <template #empty>
          <div class="py-10 text-center text-slate-400">
            {{ status === 'hutang' ? 'Tidak ada piutang berjalan. 🎉' : 'Belum ada piutang yang lunas.' }}
          </div>
        </template>
        <Column expander style="width: 3rem" />
        <Column header="Pelanggan">
          <template #body="{ data }">
            <span class="font-semibold">{{ data.nama_pelanggan }}</span>
          </template>
        </Column>
        <Column header="Faktur"><template #body="{ data }">{{ data.faktur.length }} faktur</template></Column>
        <Column header="Piutang"><template #body="{ data }">{{ rupiah(data.nominal) }}</template></Column>
        <Column header="Terbayar"><template #body="{ data }">{{ rupiah(data.retur) }}</template></Column>
        <Column v-if="status === 'hutang'" header="Sisa">
          <template #body="{ data }"><span class="font-bold text-amber-700 dark:text-amber-300">{{ rupiah(data.sisa) }}</span></template>
        </Column>

        <template #expansion="{ data: g }">
          <div class="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
            <DataTable :value="g.faktur" data-key="id" class="text-sm">
              <Column header="Faktur"><template #body="{ data }">#{{ data.id_rekap }}</template></Column>
              <Column header="Tanggal"><template #body="{ data }">{{ tgl(data.tanggal) }}</template></Column>
              <Column header="Piutang"><template #body="{ data }">{{ rupiah(data.nominal) }}</template></Column>
              <Column header="Terbayar"><template #body="{ data }">{{ rupiah(data.retur) }}</template></Column>
              <Column v-if="status === 'hutang'" header="Sisa"><template #body="{ data }">{{ rupiah(data.sisa) }}</template></Column>
              <Column header="" style="width: 13rem">
                <template #body="{ data }">
                  <div class="flex justify-end gap-2">
                    <Button label="Riwayat" icon="pi pi-history" size="small" severity="secondary" outlined @click="openRiwayat(data)" />
                    <Button v-if="status === 'hutang'" label="Bayar" icon="pi pi-wallet" size="small" @click="openBayar(data)" />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Riwayat Pembayaran -->
    <Dialog v-model:visible="riwayatDialog" modal :header="`Riwayat Pembayaran #${riwayatTarget?.id_rekap ?? ''}`" :style="{ width: '34rem' }" class="mx-4">
      <div v-if="loadingRiwayat" class="py-10 text-center text-slate-400"><i class="pi pi-spin pi-spinner text-2xl"></i></div>
      <div v-else-if="riwayat" class="space-y-4">
        <p class="text-sm text-slate-500">{{ riwayatTarget?.nama_pelanggan }} · {{ tgl(riwayatTarget?.tanggal) }}</p>

        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800/60">
          <dt class="text-slate-500">Total faktur</dt><dd class="text-right font-medium">{{ rupiah(riwayat.total_faktur) }}</dd>
          <dt class="text-slate-500">Dibayar saat transaksi</dt><dd class="text-right font-medium">{{ rupiah(riwayat.bayar_awal) }}</dd>
          <dt class="text-slate-500">Jumlah piutang</dt><dd class="text-right font-medium">{{ rupiah(riwayat.nominal) }}</dd>
          <dt class="text-slate-500">Total cicilan</dt><dd class="text-right font-medium text-emerald-600 dark:text-emerald-400">{{ rupiah(riwayat.terbayar) }}</dd>
          <dt class="border-t border-slate-200 pt-2 font-semibold dark:border-slate-700">Sisa</dt>
          <dd class="border-t border-slate-200 pt-2 text-right font-bold text-amber-700 dark:border-slate-700 dark:text-amber-300">{{ rupiah(riwayat.sisa) }}</dd>
        </dl>

        <div>
          <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Pembayaran cicilan</p>
          <ol v-if="riwayat.pembayaran.length" class="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            <li v-for="(b, i) in riwayat.pembayaran" :key="b.id" class="flex items-center justify-between gap-3 p-3 text-sm">
              <div class="min-w-0">
                <p class="font-medium text-slate-800 dark:text-slate-100">Cicilan ke-{{ i + 1 }}</p>
                <p class="text-xs text-slate-500">
                  {{ tgl(b.tanggal) }} · {{ b.jam }}<span v-if="b.metode_bayar"> · {{ b.metode_bayar }}</span>
                </p>
                <p v-if="b.keterangan" class="mt-0.5 text-xs text-slate-500">{{ b.keterangan }}</p>
              </div>
              <span class="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">{{ rupiah(b.nominal) }}</span>
            </li>
          </ol>
          <p v-else class="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400 dark:border-slate-700">
            Belum ada pembayaran cicilan.
          </p>
        </div>
      </div>
      <template #footer>
        <Button label="Tutup" severity="secondary" @click="riwayatDialog = false" />
      </template>
    </Dialog>

    <Dialog v-model:visible="dialog" modal header="Bayar Piutang" :style="{ width: '26rem' }" class="mx-4">
      <div v-if="target" class="space-y-4">
        <p class="text-sm text-slate-500">{{ target.nama_pelanggan }} · Sisa {{ rupiah(target.sisa) }}</p>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nominal Bayar</label>
          <InputNumber v-model="nominal" :min="0" :max="target.sisa" mode="currency" currency="IDR" locale="id-ID" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Metode</label>
          <Select v-model="metode" :options="metodeList" option-label="pembayaran" option-value="pembayaran" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialog = false" />
        <Button label="Bayar" icon="pi pi-check" :loading="saving" @click="bayar" />
      </template>
    </Dialog>
  </div>
</template>
