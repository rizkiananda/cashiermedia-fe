<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { errorMessage } from '@/api/client'
import { penggunaApi, tokoApi, type Pengguna } from '@/api'

const toast = useToast()
const confirm = useConfirm()

// ==== Tab ====
const tab = ref<'user' | 'toko'>('user')

// ==== Tipe user (dari tabel user_type) ====
const tipeOptions = ref<{ label: string; value: string }[]>([])
function tipeLabel(t: string) {
  return tipeOptions.value.find((o) => o.value === t)?.label || t || '-'
}
async function loadTypes() {
  try {
    const types = await penggunaApi.types()
    tipeOptions.value = types.map((t) => ({ label: t.nama, value: String(t.id) }))
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat tipe user', detail: errorMessage(e), life: 3000 })
  }
}

// ==== Master User ====
const users = ref<Pengguna[]>([])
const loadingUser = ref(false)
const search = ref('')
const dialogOpen = ref(false)
const editing = ref<Pengguna | null>(null)
const saving = ref(false)
let searchTimer: ReturnType<typeof setTimeout>

const form = reactive({
  tipe: '3',
  nama: '',
  alamat: '',
  no_telp: '',
  username: '',
  password: '',
  status: 'aktif',
})

async function loadUsers() {
  loadingUser.value = true
  try {
    users.value = await penggunaApi.list(search.value)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat', detail: errorMessage(e), life: 3000 })
  } finally {
    loadingUser.value = false
  }
}

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadUsers, 350)
})

function openCreate() {
  editing.value = null
  Object.assign(form, {
    tipe: tipeOptions.value[0]?.value ?? '',
    nama: '',
    alamat: '',
    no_telp: '',
    username: '',
    password: '',
    status: 'aktif',
  })
  dialogOpen.value = true
}

function openEdit(row: Pengguna) {
  editing.value = row
  Object.assign(form, {
    tipe: row.tipe || '3',
    nama: row.nama || '',
    alamat: row.alamat || '',
    no_telp: row.no_telp || '',
    username: row.username || '',
    password: '',
    status: row.status || 'aktif',
  })
  dialogOpen.value = true
}

async function saveUser() {
  if (!form.tipe) return warn('Tipe user wajib dipilih')
  if (!form.username.trim()) return warn('Username wajib diisi')
  if (!editing.value && !form.password) return warn('Password wajib diisi')

  saving.value = true
  try {
    if (editing.value) {
      const payload: any = {
        nama: form.nama,
        tipe: form.tipe,
        alamat: form.alamat,
        no_telp: form.no_telp,
        username: form.username,
        status: form.status,
      }
      if (form.password) payload.password = form.password
      await penggunaApi.update(editing.value.id, payload)
    } else {
      await penggunaApi.create({ ...form })
    }
    toast.add({ severity: 'success', summary: 'Tersimpan', detail: 'Data user berhasil disimpan', life: 2000 })
    dialogOpen.value = false
    await loadUsers()
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal menyimpan', detail: errorMessage(e), life: 3500 })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row: Pengguna) {
  confirm.require({
    message: `Hapus user "${row.nama || row.username}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await penggunaApi.remove(row.id)
        toast.add({ severity: 'success', summary: 'Terhapus', life: 2000 })
        await loadUsers()
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Gagal menghapus', detail: errorMessage(e), life: 3000 })
      }
    },
  })
}

function warn(msg: string) {
  toast.add({ severity: 'warn', summary: 'Lengkapi data', detail: msg, life: 3000 })
}

// ==== Toko ====
const toko = reactive({ nama_toko: '', no_telp: '', alamat: '' })
const loadingToko = ref(false)
const savingToko = ref(false)

async function loadToko() {
  loadingToko.value = true
  try {
    const t = await tokoApi.get()
    toko.nama_toko = t.nama_toko || ''
    toko.no_telp = t.no_telp || ''
    toko.alamat = t.alamat || ''
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal memuat toko', detail: errorMessage(e), life: 3000 })
  } finally {
    loadingToko.value = false
  }
}

async function saveToko() {
  if (!toko.nama_toko.trim()) return warn('Nama toko wajib diisi')
  savingToko.value = true
  try {
    await tokoApi.update({ nama_toko: toko.nama_toko, no_telp: toko.no_telp, alamat: toko.alamat })
    toast.add({ severity: 'success', summary: 'Tersimpan', detail: 'Data toko berhasil disimpan', life: 2000 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal menyimpan', detail: errorMessage(e), life: 3500 })
  } finally {
    savingToko.value = false
  }
}

onMounted(() => {
  loadTypes()
  loadUsers()
  loadToko()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-5 flex items-center gap-3">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <i class="pi pi-user-edit"></i>
      </div>
      <div>
        <h1 class="text-xl font-bold text-slate-800 dark:text-white">Pengaturan Akun</h1>
        <p class="text-sm text-slate-500">Kelola akun pengguna dan identitas toko</p>
      </div>
    </div>

    <!-- Tab switch -->
    <div class="mb-4 flex gap-2">
      <Button
        label="Akun Pengguna"
        icon="pi pi-users"
        :severity="tab === 'user' ? undefined : 'secondary'"
        :outlined="tab !== 'user'"
        @click="tab = 'user'"
      />
      <Button
        label="Toko"
        icon="pi pi-shop"
        :severity="tab === 'toko' ? undefined : 'secondary'"
        :outlined="tab !== 'toko'"
        @click="tab = 'toko'"
      />
    </div>

    <!-- ===== Akun Pengguna ===== -->
    <div v-if="tab === 'user'" class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:max-w-xs">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <InputText v-model="search" placeholder="Cari nama / username…" class="w-full !pl-10" />
        </div>
        <Button label="Tambah User" icon="pi pi-plus" @click="openCreate" />
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <DataTable :value="users" :loading="loadingUser" paginator :rows="10" data-key="id" class="text-sm" removable-sort>
          <template #empty>
            <div class="py-10 text-center text-slate-400">Belum ada user.</div>
          </template>
          <Column field="nama" header="Nama" sortable>
            <template #body="{ data }">{{ data.nama || '-' }}</template>
          </Column>
          <Column field="username" header="Username" sortable />
          <Column field="tipe" header="Tipe" sortable>
            <template #body="{ data }">{{ tipeLabel(data.tipe) }}</template>
          </Column>
          <Column field="no_telp" header="No. Telepon">
            <template #body="{ data }">{{ data.no_telp || '-' }}</template>
          </Column>
          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <Tag :value="data.status" :severity="data.status === 'aktif' ? 'success' : 'secondary'" />
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
    </div>

    <!-- ===== Toko ===== -->
    <div v-else class="max-w-xl">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 class="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Identitas Toko</h2>
        <div class="space-y-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nama Toko <span class="text-red-500">*</span>
            </label>
            <InputText v-model="toko.nama_toko" :disabled="loadingToko" placeholder="Nama toko" fluid />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">No. Telepon Toko</label>
            <InputText v-model="toko.no_telp" :disabled="loadingToko" placeholder="Mis. TELP : 0821-xxxx" fluid />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Alamat</label>
            <Textarea v-model="toko.alamat" :disabled="loadingToko" rows="3" placeholder="Alamat toko" fluid />
          </div>
          <div class="flex justify-end">
            <Button label="Simpan" icon="pi pi-check" :loading="savingToko" :disabled="loadingToko" @click="saveToko" />
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog form user -->
    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editing ? 'Ubah User' : 'Tambah User'"
      :style="{ width: '32rem' }"
      class="mx-4"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tipe User <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.tipe"
            :options="tipeOptions"
            option-label="label"
            option-value="value"
            placeholder="-- Pilih Tipe User --"
            fluid
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nama</label>
          <InputText v-model="form.nama" placeholder="Nama lengkap" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Alamat</label>
          <Textarea v-model="form.alamat" rows="2" placeholder="Alamat" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">No. Telepon</label>
          <InputText v-model="form.no_telp" placeholder="No. telepon" fluid />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Username <span class="text-red-500">*</span>
          </label>
          <InputText v-model="form.username" placeholder="Username login" fluid autocomplete="off" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password <span v-if="!editing" class="text-red-500">*</span>
            <span v-else class="text-xs font-normal text-slate-400">(kosongkan bila tidak diubah)</span>
          </label>
          <Password
            v-model="form.password"
            :feedback="false"
            toggle-mask
            :placeholder="editing ? '••••••••' : 'Password'"
            fluid
            input-class="w-full"
            autocomplete="new-password"
          />
        </div>
        <div v-if="editing">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <Select
            v-model="form.status"
            :options="[
              { label: 'Aktif', value: 'aktif' },
              { label: 'Nonaktif', value: 'nonaktif' },
            ]"
            option-label="label"
            option-value="value"
            fluid
          />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="dialogOpen = false" />
        <Button :label="editing ? 'Simpan' : 'Register'" icon="pi pi-check" :loading="saving" @click="saveUser" />
      </template>
    </Dialog>
  </div>
</template>
