// Kumpulan fungsi API bertipe. Setiap fungsi mengembalikan payload `data`
// dari amplop respons standar backend { success, data }.
import client from './client'
import type {
  Barang,
  CartHeader,
  CartSummary,
  CheckoutResult,
  Invoice,
  MetodePembayaran,
  Pelanggan,
  Sales,
  TodaySale,
  User,
} from '@/types'

async function unwrap<T>(p: Promise<{ data: { data: T } }>): Promise<T> {
  const res = await p
  return res.data.data
}

export const authApi = {
  login: (username: string, password: string) =>
    unwrap<{ token: string; user: User }>(client.post('/auth/login', { username, password })),
  me: () => unwrap<User>(client.get('/auth/me')),
  logout: () => client.post('/auth/logout'),
}

export const catalogApi = {
  barang: (search = '') =>
    unwrap<Barang[]>(client.get('/catalog/barang', { params: { search } })),
  pelanggan: (search = '') =>
    unwrap<Pelanggan[]>(client.get('/catalog/pelanggan', { params: { search } })),
  sales: () => unwrap<Sales[]>(client.get('/catalog/sales')),
  metodePembayaran: () =>
    unwrap<MetodePembayaran[]>(client.get('/catalog/metode-pembayaran')),
}

export interface AddItemPayload {
  id_barang: number
  id_satuan: number
  tipe_pelanggan: number
  jumlah: number
  harga: number
  diskon: number
  id_pelanggan: number
}

export const cartApi = {
  get: () => unwrap<CartSummary>(client.get('/cart')),
  add: (payload: AddItemPayload) => unwrap<CartSummary>(client.post('/cart/items', payload)),
  update: (id: number, payload: { jumlah?: number; harga?: number; diskon?: number }) =>
    unwrap<CartSummary>(client.patch(`/cart/items/${id}`, payload)),
  remove: (id: number) => unwrap<CartSummary>(client.delete(`/cart/items/${id}`)),
  updateHeader: (payload: Partial<CartHeader>) =>
    unwrap<CartSummary>(client.put('/cart/header', payload)),
  clear: () => unwrap<CartSummary>(client.delete('/cart')),
}

export interface CheckoutPayload {
  id_pelanggan: number
  nomor_po?: string
  bayar: number
  metode_pembayaran: number
  bayar2?: number
  metode_pembayaran2?: number
  uang_muka?: number
  potongan?: number
  jatuh_tempo?: string
}

export const checkoutApi = {
  checkout: (payload: CheckoutPayload) =>
    unwrap<CheckoutResult>(client.post('/checkout', payload)),
  invoice: (id: number) => unwrap<Invoice>(client.get(`/invoice/${id}`)),
  todaySales: () => unwrap<TodaySale[]>(client.get('/penjualan/today')),
}

// Factory CRUD generik untuk entitas master sederhana.
export function crudApi<T = any>(path: string) {
  return {
    list: (search = '') => unwrap<T[]>(client.get(path, { params: { search } })),
    get: (id: number) => unwrap<T>(client.get(`${path}/${id}`)),
    create: (payload: Partial<T>) => unwrap<T>(client.post(path, payload)),
    update: (id: number, payload: Partial<T>) => client.put(`${path}/${id}`, payload),
    remove: (id: number) => client.delete(`${path}/${id}`),
  }
}

export interface BarangListRow {
  id: number
  kode_barang: string
  nama_barang: string
  id_golongan: number
  nama_golongan: string
  id_supplier: number
  nama_supplier: string
  status: string
  stok: number
  jumlah_harga: number
  harga_terendah: number
}

export interface BarangHarga {
  id: number
  id_satuan: number
  nama_satuan: string
  harga_jual: number
  konversi: number
  tipe_pelanggan: number
  kode: string
}

export const barangApi = {
  list: (params: { search?: string; page?: number; limit?: number }) =>
    unwrap<{ data: BarangListRow[]; total: number; page: number; limit: number }>(
      client.get('/master/barang', { params }),
    ),
  detail: (id: number) =>
    unwrap<{ barang: any; harga: BarangHarga[]; stok: number }>(client.get(`/master/barang/${id}`)),
  create: (payload: any) => unwrap<any>(client.post('/master/barang', payload)),
  update: (id: number, payload: any) => client.put(`/master/barang/${id}`, payload),
  remove: (id: number) => client.delete(`/master/barang/${id}`),
  addHarga: (id: number, payload: Partial<BarangHarga>) =>
    client.post(`/master/barang/${id}/harga`, payload),
  updateHarga: (itemId: number, payload: Partial<BarangHarga>) =>
    client.put(`/master/harga/${itemId}`, payload),
  removeHarga: (itemId: number) => client.delete(`/master/harga/${itemId}`),
}

export interface DashboardSummary {
  omzet_hari_ini: number
  transaksi_hari_ini: number
  omzet_bulan_ini: number
  omzet_tahun_ini: number
  total_piutang: number
  pelanggan_aktif: number
  barang_menipis: number
}

export const stokApi = {
  list: (params: { search?: string; page?: number; limit?: number; low?: string }) =>
    unwrap<{ data: any[]; total: number; page: number; limit: number }>(
      client.get('/stok', { params }),
    ),
  opname: (payload: { id_barang: number; id_satuan: number; jumlah_fisik: number; keterangan?: string }) =>
    client.post('/stok/opname', payload),
  riwayatOpname: () => unwrap<any[]>(client.get('/stok/opname')),
  kartu: (idBarang: number) => unwrap<any[]>(client.get('/stok/kartu', { params: { id_barang: idBarang } })),
}

export interface PurchaseItem {
  id_barang: number
  id_satuan: number
  jumlah: number
  harga: number
}

export const pembelianApi = {
  list: () => unwrap<any[]>(client.get('/pembelian')),
  detail: (id: number) => unwrap<any>(client.get(`/pembelian/${id}`)),
  create: (payload: {
    id_supplier: number
    tanggal?: string
    ongkos_angkut?: number
    uang_muka?: number
    bayar?: number
    metode_bayar?: number
    items: PurchaseItem[]
  }) => unwrap<{ id: number; total: number }>(client.post('/pembelian', payload)),
}

export const returApi = {
  list: () => unwrap<any[]>(client.get('/retur')),
  detail: (id: number) => unwrap<any>(client.get(`/retur/${id}`)),
  create: (payload: {
    id_pelanggan: number
    tanggal?: string
    keterangan?: string
    items: Array<{ id_barang: number; id_satuan: number; jumlah: number; harga: number; diskon?: number }>
  }) => unwrap<{ id: number; total: number }>(client.post('/retur', payload)),
}

export const keuanganApi = {
  piutang: () => unwrap<{ data: any[]; total_sisa: number }>(client.get('/piutang')),
  bayarPiutang: (id: number, payload: { nominal: number; metode_bayar?: string; keterangan?: string }) =>
    client.post(`/piutang/${id}/bayar`, payload),
  hutang: () => unwrap<{ data: any[]; total_sisa: number }>(client.get('/hutang')),
  bayarHutang: (id: number, payload: { nominal: number; keterangan?: string }) =>
    client.post(`/hutang/${id}/bayar`, payload),
  laba: (start?: string, end?: string) =>
    unwrap<{ data: any[]; total_omzet: number; total_modal: number; total_laba: number; start: string; end: string }>(
      client.get('/laba', { params: { start, end } }),
    ),
  laporanPenjualan: (start?: string, end?: string) =>
    unwrap<{ data: any[]; total_omzet: number; total_terbayar: number; jumlah_faktur: number; start: string; end: string }>(
      client.get('/laporan/penjualan', { params: { start, end } }),
    ),
  laporanPenjualanBarang: (start?: string, end?: string) =>
    unwrap<{ data: any[]; start: string; end: string }>(
      client.get('/laporan/penjualan-barang', { params: { start, end } }),
    ),
  laporanJatuhTempo: () =>
    unwrap<{ data: any[]; total_sisa: number; jumlah_terlambat: number }>(client.get('/laporan/jatuh-tempo')),
  laporanKasir: (start?: string, end?: string) =>
    unwrap<{ data: any[]; per_metode: Record<string, number>; start: string; end: string }>(
      client.get('/laporan/kasir', { params: { start, end } }),
    ),
  laporanPerSales: (start?: string, end?: string) =>
    unwrap<{ data: any[]; start: string; end: string }>(
      client.get('/laporan/per-sales', { params: { start, end } }),
    ),
  laporanPembelian: (start?: string, end?: string, supplier?: string) =>
    unwrap<{ data: any[]; total_pembelian: number; jumlah_faktur: number; start: string; end: string }>(
      client.get('/laporan/pembelian', { params: { start, end, supplier } }),
    ),
  laporanPembayaran: (start?: string, end?: string) =>
    unwrap<{ data: any[]; per_metode: Record<string, number>; total: number; start: string; end: string }>(
      client.get('/laporan/pembayaran', { params: { start, end } }),
    ),
  laporanRekapKasir: (tanggal?: string) =>
    unwrap<{ data: any[]; tanggal: string }>(client.get('/laporan/rekap-kasir', { params: { tanggal } })),
  laporanStok: (idGolongan?: number) =>
    unwrap<{ data: any[]; total_nilai: number }>(client.get('/laporan/stok', { params: { id_golongan: idGolongan } })),
  laporanStokPergolongan: () =>
    unwrap<{ data: any[]; total_nilai: number }>(client.get('/laporan/stok-pergolongan')),
}

export const laporanJurnalApi = {
  get: (start?: string, end?: string, idAkun?: number) =>
    unwrap<{ data: any[]; total_debet: number; total_kredit: number; start: string; end: string }>(
      client.get('/laporan/jurnal', { params: { start, end, id_akun: idAkun } }),
    ),
}

export const jurnalApi = {
  akun: crudApi('/jurnal/akun'),
  kas: crudApi('/jurnal/kas'),
  entriList: (start?: string, end?: string) =>
    unwrap<{ data: any[]; start: string; end: string }>(client.get('/jurnal/entri', { params: { start, end } })),
  entriDetail: (id: number) => unwrap<any>(client.get(`/jurnal/entri/${id}`)),
  createEntri: (payload: {
    tanggal?: string
    keterangan?: string
    id_master_kas?: number
    lines: Array<{ id_master_akun: number; keterangan?: string; debet: number; kredit: number }>
  }) => unwrap<{ id: number }>(client.post('/jurnal/entri', payload)),
}

export const dashboardApi = {
  summary: () => unwrap<DashboardSummary>(client.get('/dashboard/summary')),
  omzetHarian: () =>
    unwrap<Array<{ tanggal: string; omzet: number }>>(client.get('/dashboard/omzet-harian')),
  omzetTahunan: (tahun: number) =>
    unwrap<{ data: Array<{ bulan: number; omzet: number }>; tahun: string }>(
      client.get('/dashboard/omzet-tahunan', { params: { tahun } }),
    ),
  omzetBulanan: (bulan: number, tahun: number) =>
    unwrap<{ data: Array<{ tanggal: number; omzet: number }>; bulan: string; tahun: string }>(
      client.get('/dashboard/omzet-bulanan', { params: { bulan, tahun } }),
    ),
  topBarang: () =>
    unwrap<Array<{ barang: string; qty: number; total: number }>>(client.get('/dashboard/top-barang')),
  recent: () =>
    unwrap<Array<{ id: number; tanggal: string; jam: string; nama_pelanggan: string; total: number; status: string }>>(
      client.get('/dashboard/recent'),
    ),
}

// ==== Diskon strata & Promo ====
export interface StrataInput {
  min_transaksi: number
  harga_diskon: number
}
export const diskonApi = {
  list: () => unwrap<any[]>(client.get('/diskon')),
  detail: (id: number) => unwrap<{ header: any; detail: any[] }>(client.get(`/diskon/${id}`)),
  create: (payload: {
    id_barang: number
    id_satuan: number
    tanggal_awal: string
    tanggal_akhir: string
    strata: StrataInput[]
  }) => unwrap<{ id: number }>(client.post('/diskon', payload)),
  update: (id: number, payload: any) => client.put(`/diskon/${id}`, payload),
  remove: (id: number) => client.delete(`/diskon/${id}`),
  cek: (idBarang: number, idSatuan: number, jumlah: number) =>
    unwrap<{ aktif: boolean; harga_diskon?: number; min_transaksi?: number }>(
      client.get('/diskon/cek', { params: { id_barang: idBarang, id_satuan: idSatuan, jumlah } }),
    ),
}

export const promoApi = {
  list: () => unwrap<any[]>(client.get('/promo')),
  create: (payload: {
    barang: number
    kelipatan_beli: number
    satuan_barang?: string
    tanggal_awal: string
    tanggal_akhir: string
    hadiah: number
    jumlah_hadiah: number
    satuan_hadiah: number
  }) => unwrap<any>(client.post('/promo', payload)),
  update: (id: number, payload: any) => client.put(`/promo/${id}`, payload),
  remove: (id: number) => client.delete(`/promo/${id}`),
}

// ==== Uang Muka ====
export const uangMukaApi = {
  penjualan: {
    list: () => unwrap<any[]>(client.get('/uangmuka/penjualan')),
    create: (payload: { id_pelanggan: number; masuk: number; metode_bayar?: number; keterangan?: string }) =>
      unwrap<any>(client.post('/uangmuka/penjualan', payload)),
    saldo: (idPelanggan: number) =>
      unwrap<{ saldo: number; masuk: number; keluar: number }>(client.get(`/uangmuka/penjualan/saldo/${idPelanggan}`)),
  },
  pembelian: {
    list: () => unwrap<any[]>(client.get('/uangmuka/pembelian')),
    create: (payload: { id_supplier: number; masuk: number; metode_bayar?: number; keterangan?: string }) =>
      unwrap<any>(client.post('/uangmuka/pembelian', payload)),
    saldo: (idSupplier: number) =>
      unwrap<{ saldo: number; masuk: number; keluar: number }>(client.get(`/uangmuka/pembelian/saldo/${idSupplier}`)),
  },
}

// ==== Pengiriman / Surat Jalan ====
export const pengirimanApi = {
  list: () => unwrap<any[]>(client.get('/pengiriman')),
  detail: (id: number) => unwrap<{ header: any; faktur: any[] }>(client.get(`/pengiriman/${id}`)),
  create: (payload: {
    tanggal?: string
    nomor_po?: string
    koli?: number
    no_polisi?: string
    armada?: string
    kendaraan?: string
    supir?: string
    helper?: string
    ril?: string
    area?: string
    subarea?: string
    gudang?: string
  }) => unwrap<any>(client.post('/pengiriman', payload)),
  update: (id: number, payload: any) => client.put(`/pengiriman/${id}`, payload),
  remove: (id: number) => client.delete(`/pengiriman/${id}`),
  tambahFaktur: (id: number, idRekap: number) => client.post(`/pengiriman/${id}/faktur/${idRekap}`),
  hapusFaktur: (id: number, idRekap: number) => client.delete(`/pengiriman/${id}/faktur/${idRekap}`),
}

// ==== Mutasi Antar Gudang ====
export const mutasiApi = {
  list: () => unwrap<any[]>(client.get('/mutasi')),
  create: (payload: { id_barang: number; id_satuan: number; jumlah: number; perusahaan_tujuan: number }) =>
    unwrap<{ id: number }>(client.post('/mutasi', payload)),
}

// ==== Ritase Armada ====
export const ritaseApi = {
  list: (start?: string, end?: string) =>
    unwrap<{ data: any[]; start: string; end: string }>(client.get('/ritase', { params: { start, end } })),
  sopir: (start?: string, end?: string) =>
    unwrap<{ data: any[]; start: string; end: string }>(client.get('/ritase/sopir', { params: { start, end } })),
  kernet: (start?: string, end?: string) =>
    unwrap<{ data: any[]; start: string; end: string }>(client.get('/ritase/kernet', { params: { start, end } })),
}

// ==== Order Online ====
export const orderApi = {
  create: () => unwrap<{ id_rekap: number; total: number; status: string }>(client.post('/order')),
  list: (status?: string) => unwrap<any[]>(client.get('/order', { params: { status } })),
  detail: (id: number) => unwrap<any>(client.get(`/order/${id}`)),
  proses: (id: number) => client.post(`/order/${id}/proses`),
  bayar: (id: number, payload: { bayar: number; metode_pembayaran: number }) =>
    client.post(`/order/${id}/bayar`, payload),
  batalkan: (id: number) => client.delete(`/order/${id}`),
}

// ==== Perusahaan (untuk pilihan tujuan mutasi) ====
export const perusahaanApi = {
  list: () => unwrap<{ id: number; nama_perusahaan: string }[]>(client.get('/master/perusahaan-list')),
}
