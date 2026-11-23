// Format angka ke Rupiah.
export function rupiah(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseInt(value, 10) : value ?? 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n as number) ? (n as number) : 0)
}

// Format angka biasa dengan pemisah ribuan.
export function angka(value: number | null | undefined): string {
  return new Intl.NumberFormat('id-ID').format(value ?? 0)
}

// Date -> 'YYYY-MM-DD' menurut zona waktu lokal. Jangan pakai toISOString():
// itu UTC, sehingga tanggal dari DatePicker (00:00 WIB = 17:00 UTC hari sebelumnya) mundur sehari.
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
