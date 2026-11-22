<template>
  <!-- Ilustrasi default untuk barang tanpa gambar. -->
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pi-bag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#818cf8" /><stop offset="1" stop-color="#4f46e5" />
      </linearGradient>
    </defs>

    <ellipse cx="32" cy="56" rx="17" ry="3" fill="#000" opacity=".2" />
    <path d="M23 21v-4a9 9 0 0 1 18 0v4" stroke="#a5b4fc" stroke-width="3.5" stroke-linecap="round" />
    <path d="M15 21h34a3 3 0 0 1 3 3.2l-2.4 25A6 6 0 0 1 43.6 55H20.4a6 6 0 0 1-6-5.8l-2.4-25A3 3 0 0 1 15 21z" fill="url(#pi-bag)" />
    <path d="M23 29v3a9 9 0 0 0 18 0v-3" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55" />
  </svg>
</template>
