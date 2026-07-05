<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { errorMessage } from '@/api/client'
import { crudApi } from '@/api'
import { rupiah } from '@/utils/format'

export interface CrudColumn {
  field: string
  header: string
  type?: 'text' | 'currency' | 'number' | 'status'
}
export interface CrudField {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'textarea' | 'select'
  options?: { label: string; value: any }[]
  // Untuk select dengan opsi dinamis dari endpoint (mis. jenis kendaraan).
  optionsPath?: string
  optionsLabel?: string
  optionsValue?: string
  required?: boolean
  placeholder?: string
  default?: any
}
interface CrudApi {
  list: (search?: string) => Promise<any[]>
  create: (payload: any) => Promise<any>
  update: (id: number, payload: any) => Promise<any>
  remove: (id: number) => Promise<any>
}

const props = defineProps<{
  title: string
  api: CrudApi
  columns: CrudColumn[]
  fields: CrudField[]
  searchable?: boolean
  entityLabel?: string // untuk pesan, mis. "satuan"
}>()

const toast = useToast()
const confirm = useConfirm()

const rows = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const dialogOpen = ref(false)
const editing = ref<any | null>(null)
const form = reactive<Record<string, any>>({})
const saving = ref(false)

let searchTimer: ReturnType<typeof setTimeout>

// Opsi select dinamis yang dimuat dari endpoint (per field key).
const dynamicOptions = ref<Record<string, { label: string; value: any }[]>>({})

function optionsOf(f: CrudField) {
  return f.options ?? dynamicOptions.value[f.key] ?? []
}

onMounted(async () => {
  await Promise.all([load(), loadDynamicOptions()])
})

async function loadDynamicOptions() {
  for (const f of props.fields) {
    if (f.type === 'select' && f.optionsPath) {
      const rows = await crudApi<any>(f.optionsPath).list()
      const labelKey = f.optionsLabel ?? 'nama'
      const valueKey = f.optionsValue ?? 'id'
      dynamicOptions.value[f.key] = rows.map((r: any) => ({ label: r[labelKey], value: r[valueKey] }))
    }
  }
}

async function load() {
  loading.value = true
  try {
    rows.value = await props.api.list(search.value)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat', detail: errorMessage(e), life: 3000 })
  } finally {
    loading.value = false
  }
}

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 350)
})

function openCreate() {
  editing.value = null
  props.fields.forEach((f) => (form[f.key] = f.default ?? (f.type === 'number' || f.type === 'currency' ? 0 : '')))
  dialogOpen.value = true
}

function openEdit(row: any) {
  editing.value = row
  props.fields.forEach((f) => (form[f.key] = row[f.key] ?? (f.type === 'number' || f.type === 'currency' ? 0 : '')))
  dialogOpen.value = true
}

async function save() {
  for (const f of props.fields) {
    if (f.required && (form[f.key] === '' || form[f.key] === null || form[f.key] === undefined)) {
      toast.add({ severity: 'warn', summary: 'Lengkapi data', detail: `${f.label} wajib diisi`, life: 3000 })
      return
    }
  }
  saving.value = true
  try {
    const payload = { ...form }
    if (editing.value) await props.api.update(editing.value.id, payload)
    else await props.api.create(payload)
    toast.add({ severity: 'success', summary: 'Tersimpan', detail: `${props.entityLabel || 'Data'} berhasil disimpan`, life: 2000 })
    dialogOpen.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal menyimpan', detail: errorMessage(e), life: 3500 })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row: any) {
  confirm.require({
    message: `Hapus data ini?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await props.api.remove(row.id)
        toast.add({ severity: 'success', summary: 'Terhapus', life: 2000 })
        await load()
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Gagal menghapus', detail: errorMessage(e), life: 3000 })
      }
    },
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div v-if="searchable !== false" class="relative w-full sm:max-w-xs">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <InputText v-model="search" placeholder="Cari…" class="w-full !pl-10" />
      </div>
      <Button label="Tambah" icon="pi pi-plus" @click="openCreate" />
    </div>

    <!-- Tabel -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" data-key="id" class="text-sm" removable-sort>
        <template #empty>
          <div class="py-10 text-center text-slate-400">Belum ada data.</div>
        </template>
        <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable>
          <template #body="{ data }">
            <template v-if="col.type === 'currency'">{{ rupiah(data[col.field]) }}</template>
            <template v-else-if="col.type === 'status'">
              <Tag :value="data[col.field]" :severity="data[col.field] === 'aktif' ? 'success' : 'secondary'" />
            </template>
            <template v-else>{{ data[col.field] }}</template>
          </template>
        </Column>
        <Column header="Aksi" style="width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(data)" v-tooltip.top="'Ubah'" />
              <Button icon="pi pi-trash" text rounded severity="danger" size="small" @click="confirmDelete(data)" v-tooltip.top="'Hapus'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog form -->
    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editing ? `Ubah ${title}` : `Tambah ${title}`"
      :style="{ width: '30rem' }"
      class="mx-4"
    >
      <div class="space-y-4">
        <div v-for="f in fields" :key="f.key">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ f.label }} <span v-if="f.required" class="text-red-500">*</span>
          </label>
          <InputText v-if="f.type === 'text'" v-model="form[f.key]" :placeholder="f.placeholder" fluid />
          <Textarea v-else-if="f.type === 'textarea'" v-model="form[f.key]" rows="3" :placeholder="f.placeholder" fluid />
          <InputNumber v-else-if="f.type === 'number'" v-model="form[f.key]" fluid />
          <InputNumber
            v-else-if="f.type === 'currency'"
            v-model="form[f.key]"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            fluid
          />
          <Select
            v-else-if="f.type === 'select'"
            v-model="form[f.key]"
            :options="optionsOf(f)"
            option-label="label"
            option-value="value"
            :placeholder="f.placeholder || 'Pilih…'"
            filter
            fluid
          />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialogOpen = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
