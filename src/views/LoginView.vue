<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/api/client'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  if (!username.value || !password.value) {
    toast.add({ severity: 'warn', summary: 'Lengkapi data', detail: 'Username & password wajib diisi', life: 3000 })
    return
  }
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/app'
    router.replace(redirect)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal masuk', detail: errorMessage(e, 'Username atau password salah'), life: 4000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
    <!-- Panel brand (tersembunyi di layar kecil) -->
    <div class="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white
                bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500">
      <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-2xl"></div>
      <div class="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl"></div>

      <div class="relative flex items-center gap-3">
        <div class="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
          <i class="pi pi-shopping-cart text-xl"></i>
        </div>
        <span class="text-xl font-extrabold tracking-tight">CashierMedia</span>
      </div>

      <div class="relative max-w-md">
        <h1 class="text-4xl font-extrabold leading-tight">Kelola penjualan lebih cepat & rapi.</h1>
        <p class="mt-4 text-white/80">
          Sistem Point of Sale modern untuk distribusi & grosir — transaksi kilat,
          stok akurat, laporan real-time. Bisa diakses dari PC, tablet, maupun ponsel.
        </p>
        <div class="mt-8 flex flex-wrap gap-2">
          <span class="rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">Transaksi cepat</span>
          <span class="rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">Multi-satuan</span>
          <span class="rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">Laporan lengkap</span>
        </div>
      </div>

      <p class="relative text-sm text-white/60">© {{ new Date().getFullYear() }} CashierMedia POS</p>
    </div>

    <!-- Panel form -->
    <div class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-sm animate-pop">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white">
            <i class="pi pi-shopping-cart text-xl"></i>
          </div>
          <span class="text-xl font-extrabold text-slate-800 dark:text-white">CashierMedia</span>
        </div>

        <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Selamat datang 👋</h2>
        <p class="mt-1 text-slate-500 dark:text-slate-400">Masuk untuk melanjutkan ke kasir.</p>

        <form class="mt-8 space-y-5" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
            <InputText
              v-model="username"
              placeholder="Masukkan username"
              class="w-full"
              autocomplete="username"
              @keyup.enter="submit"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <Password
              v-model="password"
              placeholder="Masukkan password"
              :feedback="false"
              toggle-mask
              fluid
              input-class="w-full"
              @keyup.enter="submit"
            />
          </div>

          <Button
            type="submit"
            label="Masuk"
            icon="pi pi-sign-in"
            class="w-full"
            size="large"
            :loading="loading"
          />
        </form>
      </div>
    </div>
  </div>
</template>
