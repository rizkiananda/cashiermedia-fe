<script setup lang="ts">
import { ref, computed } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { rupiah } from '@/utils/format'

interface Point { bulan: number; omzet: number }

const props = defineProps<{ data: Point[]; year: number; loading?: boolean }>()
const emit = defineEmits<{ search: [year: number] }>()

const bulanLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const selectedYear = ref(props.year)
const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  const years = []
  for (let y = current; y >= current - 5; y--) years.push({ label: String(y), value: y })
  return years
})

// Layout geometri chart (viewBox 0..640 x 0..220 area plot).
const W = 640
const H = 200
const padLeft = 52
const padBottom = 24
const plotW = W - padLeft - 12
const plotH = H - padBottom - 12

const maxVal = computed(() => {
  const m = Math.max(1, ...props.data.map((d) => d.omzet))
  // Bulatkan ke atas ke kelipatan "rapi" agar tick bersih.
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

const barSlot = computed(() => plotW / 12)
const barWidth = computed(() => Math.min(24, barSlot.value * 0.55))

function barX(i: number) {
  return padLeft + barSlot.value * i + (barSlot.value - barWidth.value) / 2
}
function barY(v: number) {
  return 12 + plotH - (v / maxVal.value) * plotH
}
function barH(v: number) {
  return (v / maxVal.value) * plotH
}

const hover = ref<number | null>(null)

function doSearch() {
  emit('search', selectedYear.value)
}
</script>

<template>
  <div class="viz-root rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-bold text-slate-800 dark:text-white">Pendapatan {{ year }}</h3>
    </div>

    <svg :viewBox="`0 0 ${W} ${H + 12}`" class="w-full select-none" role="img" :aria-label="`Grafik pendapatan bulanan tahun ${year}`">
      <!-- Gridlines + tick labels -->
      <g>
        <template v-for="(t, i) in ticks" :key="i">
          <line
            :x1="padLeft" :x2="W - 4"
            :y1="12 + plotH - (t / maxVal) * plotH" :y2="12 + plotH - (t / maxVal) * plotH"
            class="stroke-slate-200 dark:stroke-slate-700" stroke-width="1"
          />
          <text
            :x="padLeft - 8" :y="12 + plotH - (t / maxVal) * plotH + 3"
            text-anchor="end" class="fill-slate-400 text-[9px] dark:fill-slate-500"
          >{{ fmtTick(t) }}</text>
        </template>
      </g>

      <!-- Bars -->
      <g>
        <rect
          v-for="(d, i) in data" :key="i"
          :x="barX(i)" :y="barY(d.omzet)" :width="barWidth" :height="Math.max(0, barH(d.omzet))"
          rx="4" ry="4"
          :fill="hover === i ? 'var(--chart-series-hover)' : 'var(--chart-series)'"
          class="cursor-pointer transition-colors"
          @pointerenter="hover = i" @pointerleave="hover = null"
        />
        <!-- hit target lebih besar dari bar untuk hover -->
        <rect
          v-for="(_, i) in data" :key="`hit-${i}`"
          :x="padLeft + barSlot * i" :y="12" :width="barSlot" :height="plotH"
          fill="transparent"
          @pointerenter="hover = i" @pointerleave="hover = null"
        />
      </g>

      <!-- X axis labels -->
      <g>
        <text
          v-for="(label, i) in bulanLabel" :key="label"
          :x="padLeft + barSlot * i + barSlot / 2" :y="H + 8"
          text-anchor="middle" class="fill-slate-500 text-[10px] dark:fill-slate-400"
        >{{ label }}</text>
      </g>

      <!-- Tooltip -->
      <g v-if="hover !== null" :transform="`translate(${Math.min(Math.max(barX(hover) - 30, 4), W - 128)}, ${Math.max(barY(data[hover].omzet) - 34, 4)})`">
        <rect width="128" height="30" rx="6" class="fill-slate-800 dark:fill-slate-100" />
        <text x="8" y="12" class="fill-white text-[9px] dark:fill-slate-800">{{ bulanLabel[hover] }} {{ year }}</text>
        <text x="8" y="24" class="fill-white text-[10px] font-semibold dark:fill-slate-800">{{ rupiah(data[hover].omzet) }}</text>
      </g>
    </svg>

    <!-- Filter -->
    <div class="mt-3 flex items-center gap-2">
      <Select v-model="selectedYear" :options="yearOptions" option-label="label" option-value="value" placeholder="Pilih tahun" class="flex-1" />
      <Button label="Cari" icon="pi pi-search" :loading="loading" @click="doSearch" />
    </div>
  </div>
</template>

<style scoped>
.viz-root {
  --chart-series: #2a78d6;
  --chart-series-hover: #1c5cab;
}
:root[data-theme='dark'] .viz-root,
.dark .viz-root {
  --chart-series: #3987e5;
  --chart-series-hover: #5598e7;
}
</style>
