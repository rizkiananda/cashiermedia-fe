// Tipe-tipe data yang dipertukarkan dengan backend Go.

export interface User {
  id: number
  username: string
  nama: string
  tipe: string
  role: string
  id_perusahaan: number
  nama_perusahaan: string
}

export interface HargaItem {
  id_item_barang: number
  id_satuan: number
  nama_satuan: string
  harga_jual: number
  konversi: number
  tipe_pelanggan: number
}

export interface Barang {
  id: number
  kode_barang: string
  nama_barang: string
  nama_golongan: string
  gambar: string
  stok: number
  items: HargaItem[]
}

export interface Pelanggan {
  id: number
  nama_pelanggan: string
  no_telp: string
  alamat: string
  kota: string
  tipe: string
}

export interface MetodePembayaran {
  id: number
  pembayaran: string
  jenis: string
}

export interface Sales {
  id: number
  nama_sales: string
}

export interface CartItem {
  id: number
  id_barang: number
  id_satuan: number
  tipe_pelanggan: number
  barang: string
  satuan: string
  jumlah: number
  harga: number
  diskon: number
  subtotal: number
  id_pelanggan: number
}

export interface CartHeader {
  id_pelanggan: number
  id_sales: number
  ppn: number
  id_rit_kendaraan: number
  id_supir: number
  id_kernet: number
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  total_diskon: number
  ppn_persen: number
  ppn_nominal: number
  total: number
  header: CartHeader
}

export interface CheckoutResult {
  id_rekap: number
  status: string
  total: number
  sisa: number
}

export interface Invoice {
  rekap: {
    id: number
    tanggal: string
    jam: string
    total: number
    total_bayar: number
    bayar: number
    metode_bayar: string
    uang_muka: number
    ppn: number
    sisa: string
    status: string
    nomor_po: string
  }
  detail: Array<{
    id: number
    barang: string
    satuan: string
    jumlah: number
    harga_jual: number
    diskon: number
    subtotal: number
  }>
  pelanggan: Pelanggan
  perusahaan: { nama_perusahaan: string; daerah: string; singkatan: string }
}

export interface TodaySale {
  id: number
  jam: string
  nama_pelanggan: string
  total: number
  total_bayar: number
  status: string
  nomor_po: string
}
