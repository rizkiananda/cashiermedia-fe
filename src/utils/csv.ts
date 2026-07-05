// Ekspor array objek ke file CSV dan memicu unduhan di browser.
export function exportCsv(filename: string, rows: Record<string, any>[], headers?: { key: string; label: string }[]) {
  if (!rows.length) return
  const cols = headers ?? Object.keys(rows[0]).map((k) => ({ key: k, label: k }))
  const escape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const head = cols.map((c) => escape(c.label)).join(',')
  const body = rows.map((r) => cols.map((c) => escape(r[c.key])).join(',')).join('\n')
  const csv = '﻿' + head + '\n' + body // BOM agar Excel membaca UTF-8

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
