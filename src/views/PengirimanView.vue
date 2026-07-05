<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { pengirimanApi, checkoutApi } from '@/api'
import { errorMessage } from '@/api/client'
import { rupiah } from '@/utils/format'

const toast = useToast()

const rows = ref<any[]>([])
const loading = ref(false)
const formDialog = ref(false)
const detailDialog = ref(false)
const detail = ref<any>(null)
const saving = ref(false)

const availableFaktur = ref<any[]>([])
const addingFakturId = ref<number | null>(null)

const form = reactive({
  tanggal: new Date(),
  nomor_po: '',
  koli: 0,
  no_polisi: '',
  armada: '',
  supir: '',
  helper: '',
  area: '',
  subarea: '',
  gudang: '',
})

onMounted(load)

async function load() {
  loading.value = true
  try {
    rows.value = await pengirimanApi.list()
  } finally {
    loading.value = false
  }
}

function openForm() {
  Object.assign(form, {
    tanggal: new Date(), nomor_po: '', koli: 0, no_polisi: '', armada: '',
    supir: '', helper: '', area: '', subarea: '', gudang: '',
  })
  formDialog.value = true
}

async function save() {
  saving.value = true
  try {
    await pengirimanApi.create({ ...form, tanggal: form.tanggal.toISOString().substring(0, 10) })
    toast.add({ severity: 'success', summary: 'Pengiriman dibuat', life: 2000 })
    formDialog.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3500 })
  } finally {
    saving.value = false
  }
}

async function viewDetail(id: number) {
  detail.value = await pengirimanApi.detail(id)
  detailDialog.value = true
  availableFaktur.value = await checkoutApi.todaySales()
}

async function tambahFaktur() {
  if (!addingFakturId.value || !detail.value) return
  try {
    await pengirimanApi.tambahFaktur(detail.value.header.id, addingFakturId.value)
    detail.value = await pengirimanApi.detail(detail.value.header.id)
    addingFakturId.value = null
    toast.add({ severity: 'success', summary: 'Faktur ditambahkan', life: 1500 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage(e), life: 3000 })
  }
}

async function hapusFaktur(idRekap: number) {
  if (!detail.value) return
  await pengirimanApi.hapusFaktur(detail.value.header.id, idRekap)
  detail.value = await pengirimanApi.detail(detail.value.header.id)
}

async function selesaikan() {
  if (!detail.value) return
  await pengirimanApi.update(detail.value.header.id, { status: 'selesai' })
  toast.add({ severity: 'success', summary: 'Pengiriman selesai', life: 2000 })
  detailDialog.value = false
  await load()
}

function printSuratJalan() {
  window.print()
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <i class="pi pi-truck"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 dark:text-white">Pengiriman / Surat Jalan</h1>
          <p class="text-sm text-slate-500">Kelola pengiriman barang ke pelanggan</p>
        </div>
      </div>
      <Button label="Pengiriman Baru" icon="pi pi-plus" @click="openForm" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <DataTable :value="rows" :loading="loading" paginator :rows="10" class="text-sm">
        <template #empty><div class="py-10 text-center text-slate-400">Belum ada pengiriman.</div></template>
        <Column header="Tanggal"><template #body="{ data }">{{ data.tanggal?.substring(0, 10) }}</template></Column>
        <Column field="no_polisi" header="No. Polisi" />
        <Column field="supir" header="Supir" />
        <Column field="area" header="Area" />
        <Column header="Status">
          <template #body="{ data }"><Tag :value="data.status" :severity="data.status === 'selesai' ? 'success' : 'info'" /></template>
        </Column>
        <Column header="" style="width: 5rem">
          <template #body="{ data }"><Button icon="pi pi-eye" text rounded size="small" @click="viewDetail(data.id)" /></template>
        </Column>
      </DataTable>
    </div>

    <!-- Form pengiriman -->
    <Dialog v-model:visible="formDialog" modal header="Pengiriman Baru" :style="{ width: '36rem' }" class="mx-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal</label>
          <DatePicker v-model="form.tanggal" date-format="dd/mm/yy" fluid />
        </div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">No. Polisi</label><InputText v-model="form.no_polisi" fluid /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Armada</label><InputText v-model="form.armada" fluid /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Supir</label><InputText v-model="form.supir" fluid /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Helper/Kernet</label><InputText v-model="form.helper" fluid /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Area</label><InputText v-model="form.area" fluid /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Sub Area</label><InputText v-model="form.subarea" fluid /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Gudang</label><InputText v-model="form.gudang" fluid /></div>
        <div><label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Koli</label><InputNumber v-model="form.koli" :min="0" fluid /></div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="formDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>

    <!-- Detail / kelola faktur -->
    <Dialog v-model:visible="detailDialog" modal header="Detail Pengiriman" :style="{ width: '38rem' }" class="mx-4">
      <div v-if="detail" id="surat-jalan-print">
        <div class="mb-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
          <p><span class="text-slate-400">No. Polisi:</span> {{ detail.header.no_polisi }}</p>
          <p><span class="text-slate-400">Supir:</span> {{ detail.header.supir }}</p>
          <p><span class="text-slate-400">Area:</span> {{ detail.header.area }}</p>
          <p><span class="text-slate-400">Status:</span> {{ detail.header.status }}</p>
        </div>

        <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Faktur dalam pengiriman ini</p>
        <table class="mb-4 w-full text-sm">
          <tbody>
            <tr v-for="f in detail.faktur" :key="f.id_rekap" class="border-b border-slate-100 dark:border-slate-800">
              <td class="py-2">#{{ f.id_rekap }}</td>
              <td class="py-2">{{ f.nama_pelanggan }}</td>
              <td class="py-2 text-right">{{ rupiah(f.total) }}</td>
              <td class="py-2 text-right print:hidden">
                <Button icon="pi pi-times" text rounded size="small" severity="danger" @click="hapusFaktur(f.id_rekap)" />
              </td>
            </tr>
            <tr v-if="!detail.faktur.length"><td colspan="4" class="py-4 text-center text-slate-400">Belum ada faktur.</td></tr>
          </tbody>
        </table>

        <div class="flex gap-2 print:hidden">
          <Select v-model="addingFakturId" :options="availableFaktur" option-label="id" option-value="id" placeholder="Pilih faktur hari ini" class="flex-1" fluid>
            <template #option="{ option }">#{{ option.id }} · {{ option.nama_pelanggan }} · {{ rupiah(option.total) }}</template>
          </Select>
          <Button icon="pi pi-plus" @click="tambahFaktur" />
        </div>
      </div>
      <template #footer>
        <Button label="Cetak Surat Jalan" icon="pi pi-print" severity="secondary" outlined @click="printSuratJalan" />
        <Button v-if="detail?.header.status !== 'selesai'" label="Tandai Selesai" icon="pi pi-check" @click="selesaikan" />
        <Button label="Tutup" text @click="detailDialog = false" />
      </template>
    </Dialog>
  </div>
</template>
