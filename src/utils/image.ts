// Perkecil gambar di browser sebelum upload. Kartu produk di Kasir ±250px,
// jadi sisi terpanjang 600px sudah tajam di layar retina; hasil WebP q0.8 biasanya 20–80 KB.
export async function compressImage(file: File, maxSide = 600, quality = 0.8): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff' // latar putih untuk PNG transparan (dan fallback JPEG)
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()

  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality))
  // Browser lama yang tak bisa encode WebP mengembalikan PNG → pakai JPEG.
  let blob = await toBlob('image/webp')
  if (blob?.type !== 'image/webp') blob = await toBlob('image/jpeg')
  if (!blob) throw new Error('Gagal mengompres gambar')
  return blob
}
