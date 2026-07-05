# CashierMedia Frontend (Vue 3)

Antarmuka POS modern & responsif. Dibangun dengan **Vue 3 + Vite + TypeScript +
PrimeVue (Aura) + Tailwind CSS + Pinia + Vue Router**. Mendukung PC, tablet, dan ponsel,
serta mode terang/gelap.

## Struktur

```
src/
  main.ts                  # bootstrap (PrimeVue, Pinia, Router, Toast)
  router/                  # rute + guard autentikasi
  stores/
    auth.ts                # token JWT + profil user (persist localStorage)
    cart.ts                # state keranjang, sinkron dengan backend
  api/
    client.ts              # axios (interceptor token & 401)
    index.ts               # fungsi API bertipe
  composables/useTheme.ts  # toggle tema terang/gelap
  utils/format.ts          # format Rupiah, dsb.
  layouts/AppLayout.vue    # sidebar + topbar responsif (drawer di mobile)
  views/
    LoginView.vue          # halaman login (split-screen brand)
    PosView.vue            # kasir: grid produk + panel keranjang
    PenjualanView.vue      # daftar penjualan hari ini
  components/
    CartPanel.vue          # panel keranjang (dipakai desktop & drawer)
    AddProductDialog.vue   # pilih satuan/harga + jumlah
    PaymentDialog.vue      # pembayaran + kembalian/piutang
    InvoiceDialog.vue      # faktur + cetak
```

## Menjalankan

```
npm install
npm run dev        # http://localhost:5173
```

Vite mem-proxy `/api` ke backend Go di `http://localhost:8080` (lihat `vite.config.ts`),
jadi jalankan backend lebih dulu.

Perintah lain:
```
npm run build      # type-check (vue-tsc) + build produksi
npm run type-check # cek tipe saja
```

## Kredensial uji

Backend menyediakan user uji `test_pos` / `admin123` (bila seed dijalankan).
Sesuaikan dengan data user pada database Anda.
