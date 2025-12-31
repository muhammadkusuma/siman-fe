import { createRouter, createWebHistory } from 'vue-router'

// Import komponen halaman
const LandingPage = () => import('../views/LandingPage.vue')
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')
const DashboardView = () => import('../views/dashboard/DashboardView.vue')

// Import Layout (PENTING: Layout ini berisi Sidebar & Navbar)
const MainLayout = () => import('../layouts/MainLayout.vue')

const routes = [
    // Rute Publik
    { path: '/', name: 'landing', component: LandingPage },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    // Rute Dashboard & Admin (Menggunakan MainLayout)
    {
        path: '/dashboard',
        component: MainLayout, // <--- Parent component adalah Layout
        children: [
            {
                path: '', // Path kosong berarti akan dirender saat akses /dashboard
                name: 'dashboard',
                component: DashboardView // <--- Child component dirender di dalam <router-view> milik Layout
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router