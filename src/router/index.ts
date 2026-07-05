import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/app',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'kasir',
          name: 'pos',
          component: () => import('@/views/PosView.vue'),
        },
        {
          path: 'penjualan',
          name: 'penjualan',
          component: () => import('@/views/PenjualanView.vue'),
        },
        {
          path: 'barang',
          name: 'barang',
          component: () => import('@/views/BarangView.vue'),
        },
        {
          path: 'stok',
          name: 'stok',
          component: () => import('@/views/StokView.vue'),
        },
        {
          path: 'pembelian',
          name: 'pembelian',
          component: () => import('@/views/PembelianView.vue'),
        },
        {
          path: 'retur',
          name: 'retur',
          component: () => import('@/views/ReturView.vue'),
        },
        {
          path: 'piutang',
          name: 'piutang',
          component: () => import('@/views/PiutangView.vue'),
        },
        {
          path: 'hutang',
          name: 'hutang',
          component: () => import('@/views/HutangView.vue'),
        },
        {
          path: 'jurnal',
          name: 'jurnal',
          component: () => import('@/views/JurnalView.vue'),
        },
        {
          path: 'laporan',
          name: 'laporan',
          component: () => import('@/views/LaporanView.vue'),
        },
        {
          path: 'kartu-stok',
          name: 'kartu-stok',
          component: () => import('@/views/KartuStokView.vue'),
        },
        {
          path: 'diskon',
          name: 'diskon',
          component: () => import('@/views/DiskonView.vue'),
        },
        {
          path: 'uang-muka',
          name: 'uang-muka',
          component: () => import('@/views/UangMukaView.vue'),
        },
        {
          path: 'pengiriman',
          name: 'pengiriman',
          component: () => import('@/views/PengirimanView.vue'),
        },
        {
          path: 'mutasi',
          name: 'mutasi',
          component: () => import('@/views/MutasiView.vue'),
        },
        {
          path: 'ritase',
          name: 'ritase',
          component: () => import('@/views/RitaseView.vue'),
        },
        {
          path: 'order-online',
          name: 'order-online',
          component: () => import('@/views/OrderOnlineView.vue'),
        },
        {
          path: 'master/:entity',
          name: 'master',
          component: () => import('@/views/MasterView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Guard: rute non-publik butuh autentikasi.
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if ((to.name === 'login' || to.name === 'landing') && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
