<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import { jurnalApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'
import CrudTable from '@/components/CrudTable.vue'

const toast = useToast()

type TabKey = 'entri' | 'akun' | 'kas'
const tab = ref<TabKey>('entri')
const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'entri', label: 'Entri Jurnal', icon: 'pi pi-book' },
  { key: 'akun', label: 'Akun', icon: 'pi pi-list' },
  { key: 'kas', label: 'Kas / Bank', icon: 'pi pi-wallet' },
]

const jenisOptions = [
  { label: 'Debet', value: 'D' },
  { label: 'Kredit', value: 'K' },
]
const akunColumns = [
  { field: 'kode_akun', header: 'Kode' },
  { field: 'nama_akun', header: 'Nama Akun' },
  { field: 'status', header: 'Status', type: 'status' as const },
]
const akunFields = [
  { key: 'kode_akun', label: 'Kode Akun', type: 'text' as const },
  { key: 'nama_akun', label: 'Nama Akun', type: 'text' as const, required: true },
  { key: 'jenis', label: 'Jenis', type: 'select' as const, options: jenisOptions, default: 'D' },
]
const kasColumns = [
  { field: 'kode_kas', header: 'Kode' },
  { field: 'nama_kas', header: 'Nama Kas' },
  { field: 'status', header: 'Status', type: 'status' as const },
]
const kasFields = [
  { key: 'kode_kas', label: 'Kode Kas', type: 'text' as const },
  { key: 'nama_kas', label: 'Nama Kas/Bank', type: 'text' as const, required: true },
]

// Entri
const entri = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const akunOpts = ref<{ label: string; value: number }[]>([])
const kasOpts = ref<{ label: string; value: number }[]>([])

const form = reactive<{
  tanggal: Date
  keterangan: string
  id_master_kas: number
  lines: { id_master_akun: number; keterangan: string; debet: number; kredit: number }[]
}>({
  tanggal: new Date(),
  keterangan: '',
  id_master_kas: 0,
  lines: [
    { id_master_akun: 0, keterangan: '', debet: 0, kredit: 0 },
    { id_master_akun: 0, keterangan: '', debet: 0, kredit: 0 },
  ],
})

const totalDebet = computed(() => form.lines.reduce((n, l) => n + (l.debet || 0), 0))
const totalKredit = computed(() => form.lines.reduce((n, l) => n + (l.kredit || 0), 0))
const balanced = computed(() => totalDebet.value === totalKredit.value && totalDebet.value > 0)

onMounted(() => {
  loadEntri()
})

async function loadRefs() {
  if (akunOpts.value.length) return
  const [akun, kas] = await Promise.all([jurnalApi.akun.list(), jurnalApi.kas.list()])
  akunOpts.value = (akun as any[]).map((a) => ({ label: `${a.kode_akun || ''} ${a.nama_akun}`.trim(), value: a.id }))
  kasOpts.value = (kas as any[]).map((k) => ({ label: k.nama_kas, value: k.id }))
}

async function loadEntri() {
  loading.value = true
  try {
    const res = await jurnalApi.entriList()
    entri.value = res.data
  } finally {
    loading.value = false
  }
}

async function openForm() {
  await loadRefs()
  Object.assign(form, {
    tanggal: new Date(),
    keterangan: '',
    id_master_kas: 0,
    lines: [
      { id_master_akun: 0, keterangan: '', debet: 0, kredit: 0 },
      { id_master_akun: 0, keterangan: '', debet: 0, kredit: 0 },
    ],
  })
  dialog.value = true
}
function addLine() {
  form.lines.push({ id_master_akun: 0, keterangan: '', debet: 0, kredit: 0 })
}
function removeLine(i: number) {
  if (form.lines.length > 2) form.lines.splice(i, 1)
}

async function save() {
  if (!balanced.value) {
    toast.add({ severity: 'warn', summary: 'Tidak seimbang', detail: 'Total debet & kredit harus sama', life: 3000 })
    return
  }
  saving.value = true
  try {
    await jurnalApi.createEntri({
      tanggal: form.tanggal.toISOString().substring(0, 10),
      keterangan: form.keterangan,
      id_master_kas: form.id_master_kas,
      lines: form.lines.filter((l) => l.id_master_akun),
    })
    toast.add({ severity: 'success', summary: 'Entri tersimpan', life: 2000 })
    dialog.value = false
    await loadEntri()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3500 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i class="pi pi-book"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Jurnal Keuangan</h1>
        <p class="text-sm text-slate-500">Catatan akuntansi & kas</p>
      </div>
    </div>

    <div class="mb-4 flex gap-2 overflow-x-auto">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        :class="tab === t.key ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'"
        @click="tab = t.key"
      >
        <i :class="t.icon"></i> {{ t.label }}
      </button>
    </div>

    <!-- Entri -->
    <div v-if="tab === 'entri'">
      <div class="mb-4 flex justify-end">
        <Button label="Entri Baru" icon="pi pi-plus" @click="openForm" />
      </div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="entri" :loading="loading" paginator :rows="10" class="text-sm">
          <template #empty><div class="py-10 text-center text-slate-400">Belum ada entri jurnal.</div></template>
          <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
          <Column field="keterangan" header="Keterangan" />
          <Column field="nama_kas" header="Kas" />
          <Column header="Debet"><template #body="{ data }">{{ rupiah(data.debet) }}</template></Column>
          <Column header="Kredit"><template #body="{ data }">{{ rupiah(data.kredit) }}</template></Column>
        </DataTable>
      </div>
    </div>

    <!-- Akun -->
    <CrudTable
      v-else-if="tab === 'akun'"
      title="Akun"
      :api="jurnalApi.akun"
      :columns="akunColumns"
      :fields="akunFields"
      entity-label="Akun"
    />

    <!-- Kas -->
    <CrudTable
      v-else
      title="Kas"
      :api="jurnalApi.kas"
      :columns="kasColumns"
      :fields="kasFields"
      entity-label="Kas"
    />

    <!-- Dialog entri -->
    <Dialog v-model:visible="dialog" modal header="Entri Jurnal Baru" :style="{ width: '46rem' }" class="mx-4">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
            <DatePicker v-model="form.tanggal" date-format="dd/mm/yy" fluid />
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Keterangan</label>
            <InputText v-model="form.keterangan" placeholder="Keterangan entri" fluid />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Kas / Bank</label>
          <Select v-model="form.id_master_kas" :options="kasOpts" option-label="label" option-value="value" placeholder="Pilih kas" fluid />
        </div>

        <!-- Baris debet/kredit -->
        <div class="space-y-2">
          <div v-for="(l, i) in form.lines" :key="i" class="grid grid-cols-12 items-center gap-2">
            <Select v-model="l.id_master_akun" :options="akunOpts" option-label="label" option-value="value" filter placeholder="Akun" class="col-span-12 sm:col-span-4" fluid />
            <InputText v-model="l.keterangan" placeholder="Ket." class="col-span-6 sm:col-span-3" fluid />
            <InputNumber v-model="l.debet" :min="0" placeholder="Debet" class="col-span-3 sm:col-span-2" fluid />
            <InputNumber v-model="l.kredit" :min="0" placeholder="Kredit" class="col-span-3 sm:col-span-2" fluid />
            <Button icon="pi pi-times" text rounded severity="danger" class="col-span-12 sm:col-span-1" @click="removeLine(i)" />
          </div>
          <Button label="Tambah Baris" icon="pi pi-plus" text size="small" @click="addLine" />
        </div>

        <div class="flex items-center justify-between rounded-xl p-3"
             :class="balanced ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'">
          <span class="text-sm font-medium" :class="balanced ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'">
            {{ balanced ? 'Seimbang ✓' : 'Belum seimbang' }}
          </span>
          <span class="text-sm text-slate-600 dark:text-slate-300">D: {{ rupiah(totalDebet) }} · K: {{ rupiah(totalKredit) }}</span>
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" :disabled="!balanced" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
