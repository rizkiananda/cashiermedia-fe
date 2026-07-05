import { crudApi } from '@/api'
import type { CrudColumn, CrudField } from '@/components/CrudTable.vue'

// Konfigurasi tiap entitas master sederhana (dirender oleh MasterView + CrudTable).
export interface MasterEntity {
  slug: string
  title: string
  icon: string
  path: string // endpoint backend
  columns: CrudColumn[]
  fields: CrudField[]
}

const statusOptions = [
  { label: 'Aktif', value: 'aktif' },
  { label: 'Nonaktif', value: 'nonaktif' },
]
const statusField: CrudField = {
  key: 'status',
  label: 'Status',
  type: 'select',
  options: statusOptions,
  default: 'aktif',
}

export const masterEntities: Record<string, MasterEntity> = {
  satuan: {
    slug: 'satuan',
    title: 'Satuan',
    icon: 'pi pi-tags',
    path: '/master/satuan',
    columns: [
      { field: 'nama_satuan', header: 'Nama Satuan' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'nama_satuan', label: 'Nama Satuan', type: 'text', required: true, placeholder: 'Mis. DUS, PCS' },
      statusField,
    ],
  },
  golongan: {
    slug: 'golongan',
    title: 'Golongan',
    icon: 'pi pi-sitemap',
    path: '/master/golongan',
    columns: [
      { field: 'nama_golongan', header: 'Nama Golongan' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'nama_golongan', label: 'Nama Golongan', type: 'text', required: true },
      statusField,
    ],
  },
  supplier: {
    slug: 'supplier',
    title: 'Supplier',
    icon: 'pi pi-truck',
    path: '/master/supplier',
    columns: [
      { field: 'kode_supplier', header: 'Kode' },
      { field: 'nama_supplier', header: 'Nama Supplier' },
      { field: 'no_telp', header: 'Telp' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'kode_supplier', label: 'Kode Supplier', type: 'text' },
      { key: 'nama_supplier', label: 'Nama Supplier', type: 'text', required: true },
      { key: 'no_telp', label: 'No. Telepon', type: 'text' },
      { key: 'alamat', label: 'Alamat', type: 'textarea' },
      statusField,
    ],
  },
  sales: {
    slug: 'sales',
    title: 'Sales',
    icon: 'pi pi-user',
    path: '/master/sales',
    columns: [
      { field: 'nama_sales', header: 'Nama Sales' },
      { field: 'no_telp', header: 'Telp' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'nama_sales', label: 'Nama Sales', type: 'text', required: true },
      { key: 'no_telp', label: 'No. Telepon', type: 'text' },
      { key: 'alamat', label: 'Alamat', type: 'textarea' },
      statusField,
    ],
  },
  'metode-pembayaran': {
    slug: 'metode-pembayaran',
    title: 'Metode Pembayaran',
    icon: 'pi pi-credit-card',
    path: '/master/metode-pembayaran',
    columns: [
      { field: 'pembayaran', header: 'Metode' },
      { field: 'jenis', header: 'Jenis' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'pembayaran', label: 'Nama Metode', type: 'text', required: true, placeholder: 'Mis. Cash, BCA' },
      {
        key: 'jenis',
        label: 'Jenis',
        type: 'select',
        options: [
          { label: 'Tunai', value: 'TUNAI' },
          { label: 'Transfer', value: 'TRANSFER' },
        ],
        default: 'TUNAI',
      },
      statusField,
    ],
  },
  supir: {
    slug: 'supir',
    title: 'Supir',
    icon: 'pi pi-id-card',
    path: '/armada/supir',
    columns: [
      { field: 'nama', header: 'Nama' },
      { field: 'no_telp', header: 'Telp' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'nama', label: 'Nama Supir', type: 'text', required: true },
      { key: 'no_telp', label: 'No. Telepon', type: 'text' },
      statusField,
    ],
  },
  kernet: {
    slug: 'kernet',
    title: 'Kernet',
    icon: 'pi pi-users',
    path: '/armada/kernet',
    columns: [
      { field: 'nama', header: 'Nama' },
      { field: 'no_telp', header: 'Telp' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'nama', label: 'Nama Kernet', type: 'text', required: true },
      { key: 'no_telp', label: 'No. Telepon', type: 'text' },
      statusField,
    ],
  },
  'jenis-kendaraan': {
    slug: 'jenis-kendaraan',
    title: 'Jenis Kendaraan',
    icon: 'pi pi-tag',
    path: '/armada/jenis-kendaraan',
    columns: [
      { field: 'nama', header: 'Nama Jenis' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'nama', label: 'Nama Jenis', type: 'text', required: true },
      statusField,
    ],
  },
  kendaraan: {
    slug: 'kendaraan',
    title: 'Kendaraan',
    icon: 'pi pi-car',
    path: '/armada/kendaraan',
    columns: [
      { field: 'no_polisi', header: 'No. Polisi' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'no_polisi', label: 'No. Polisi', type: 'text', required: true },
      {
        key: 'id_jenis_kendaraan',
        label: 'Jenis Kendaraan',
        type: 'select',
        optionsPath: '/armada/jenis-kendaraan',
        optionsLabel: 'nama',
        optionsValue: 'id',
      },
      statusField,
    ],
  },
  pelanggan: {
    slug: 'pelanggan',
    title: 'Pelanggan',
    icon: 'pi pi-users',
    path: '/master/pelanggan',
    columns: [
      { field: 'nama_pelanggan', header: 'Nama Pelanggan' },
      { field: 'no_telp', header: 'Telp' },
      { field: 'kota', header: 'Kota' },
      { field: 'status', header: 'Status', type: 'status' },
    ],
    fields: [
      { key: 'nama_pelanggan', label: 'Nama Pelanggan', type: 'text', required: true },
      { key: 'no_telp', label: 'No. Telepon', type: 'text' },
      { key: 'alamat', label: 'Alamat', type: 'textarea' },
      { key: 'kota', label: 'Kota', type: 'text' },
      statusField,
    ],
  },
}

// Buat instance CRUD API untuk sebuah entitas.
export function apiFor(entity: MasterEntity) {
  return crudApi(entity.path)
}
