<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { rupiah } from '@/utils/format'

interface Point { tanggal: number; omzet: number }

const props = defineProps<{ data: Point[]; month: number; year: number; loading?: boolean }>()
const emit = defineEmits<{ search: [month: number, year: number] }>()

const bulanNama = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const selectedMonth = ref(props.month)
const selectedYear = ref(props.year)
const monthOptions = bulanNama.map((label, i) => ({ label, value: i + 1 }))
const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  const years = []
  for (let y = current; y >= current - 5; y--) years.push({ label: String(y), value: y })
  return years
})

const W = 640
const H = 200
const padLeft = 52
const padBottom = 24
const plotW = W - padLeft - 12
const plotH = H - padBottom - 12

const maxVal = computed(() => {
  const m = Math.max(1, ...props.data.map((d) => d.omzet))
  const pow = Math.pow(10, Math.floor(Math.log10(m)))
  return Math.ceil(m / (pow / 2)) * (pow / 2)
})
const ticks = computed(() => {
  const n = 4
  return Array.from({ length: n + 1 }, (_, i) => (maxVal.value / n) * i)
})
function fmtTick(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(v % 1_000_000_000 === 0 ? 0 : 1)}M`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}Jt`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}Rb`
  return String(v)
}

function xAt(i: number) {
  const n = Math.max(1, props.data.length - 1)
  return padLeft + (plotW * i) / n
}
function yAt(v: number) {
  return 12 + plotH - (v / maxVal.value) * plotH
}

const linePath = computed(() =>
  props.data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.omzet)}`).join(' '),
)
const areaPath = computed(() => {
  if (!props.data.length) return ''
  const base = 12 + plotH
  return `${linePath.value} L ${xAt(props.data.length - 1)} ${base} L ${xAt(0)} ${base} Z`
})

// Tampilkan label sumbu-X tiap beberapa hari agar tidak sesak.
const xLabelStep = computed(() => Math.ceil(props.data.length / 10))

const hoverIdx = ref<number | null>(null)
const svgEl = ref<SVGSVGElement | null>(null)

function onMove(evt: PointerEvent) {
  if (!svgEl.value || !props.data.length) return
  const rect = svgEl.value.getBoundingClientRect()
  const relX = ((evt.clientX - rect.left) / rect.width) * W
  const n = Math.max(1, props.data.length - 1)
  let idx = Math.round(((relX - padLeft) / plotW) * n)
  idx = Math.min(props.data.length - 1, Math.max(0, idx))
  hoverIdx.value = idx
}
function onLeave() {
  hoverIdx.value = null
}

function doSearch() {
  emit('search', selectedMonth.value, selectedYear.value)
}

watch(() => [props.month, props.year], () => {
  selectedMonth.value = props.month
  selectedYear.value = props.year
})
</script>

<template>
  <div class="viz-root rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-bold text-slate-800 dark:text-white">Pendapatan {{ bulanNama[month - 1] }} {{ year }}</h3>
    </div>

    <svg
      ref="svgEl"
      :viewBox="`0 0 ${W} ${H + 12}`"
      class="w-full select-none"
      role="img"
      :aria-label="`Grafik pendapatan harian ${bulanNama[month - 1]} ${year}`"
      @pointermove="onMove"
      @pointerleave="onLeave"
    >
      <!-- Gridlines -->
      <g>
        <template v-for="(t, i) in ticks" :key="i">
          <line
            :x1="padLeft" :x2="W - 4" :y1="yAt(t)" :y2="yAt(t)"
            class="stroke-slate-200 dark:stroke-slate-700" stroke-width="1"
          />
          <text :x="padLeft - 8" :y="yAt(t) + 3" text-anchor="end" class="fill-slate-400 text-[9px] dark:fill-slate-500">
            {{ fmtTick(t) }}
          </text>
        </template>
      </g>

      <!-- Area + line -->
      <path :d="areaPath" fill="var(--chart-series)" opacity="0.1" />
      <path :d="linePath" fill="none" stroke="var(--chart-series)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

      <!-- X labels -->
      <g>
        <text
          v-for="(d, i) in data" :key="d.tanggal"
          v-show="i % xLabelStep === 0"
          :x="xAt(i)" :y="H + 8" text-anchor="middle" class="fill-slate-500 text-[9px] dark:fill-slate-400"
        >{{ d.tanggal }}</text>
      </g>

      <!-- Crosshair + hover point -->
      <template v-if="hoverIdx !== null && data[hoverIdx]">
        <line :x1="xAt(hoverIdx)" :x2="xAt(hoverIdx)" y1="12" :y2="12 + plotH" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="1" />
        <circle :cx="xAt(hoverIdx)" :cy="yAt(data[hoverIdx].omzet)" r="4" fill="var(--chart-series)" stroke="white" stroke-width="2" class="dark:stroke-slate-900" />
        <g :transform="`translate(${Math.min(Math.max(xAt(hoverIdx) - 55, 4), W - 118)}, 4)`">
          <rect width="112" height="30" rx="6" class="fill-slate-800 dark:fill-slate-100" />
          <text x="8" y="12" class="fill-white text-[9px] dark:fill-slate-800">Tgl {{ data[hoverIdx].tanggal }}</text>
          <text x="8" y="24" class="fill-white text-[10px] font-semibold dark:fill-slate-800">{{ rupiah(data[hoverIdx].omzet) }}</text>
        </g>
      </template>
    </svg>

    <!-- Filter -->
    <div class="mt-3 flex flex-col gap-2 sm:flex-row">
      <Select v-model="selectedMonth" :options="monthOptions" option-label="label" option-value="value" placeholder="Pilih bulan" class="flex-1" />
      <Select v-model="selectedYear" :options="yearOptions" option-label="label" option-value="value" placeholder="Pilih tahun" class="flex-1" />
      <Button label="Cari" icon="pi pi-search" :loading="loading" @click="doSearch" />
    </div>
  </div>
</template>

<style scoped>
.viz-root {
  --chart-series: #2a78d6;
}
:root[data-theme='dark'] .viz-root,
.dark .viz-root {
  --chart-series: #3987e5;
}
</style>
