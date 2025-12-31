import { createRouter, createWebHistory } from 'vue-router'

// 1. Import Semua Komponen Halaman
const LandingPage = () => import('../views/LandingPage.vue')
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')

// Views untuk Admin
const DashboardView = () => import('../views/dashboard/DashboardView.vue')
const AuditLogView = () => import('../views/AuditLogView.vue')
const CategoryView = () => import('../views/master/CategoryView.vue') // <--- PENTING: Import ini harus ada

// Import Layout Utama
const MainLayout = () => import('../layouts/MainLayout.vue')

const routes = [
    // --- RUTE PUBLIK (Tanpa Sidebar) ---
    { path: '/', name: 'landing', component: LandingPage },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    // --- RUTE ADMIN (Dengan Sidebar & Navbar) ---
    // Cara terbaik adalah mengelompokkan semuanya di bawah satu parent route
    // Tapi untuk menjaga URL Anda tetap seperti '/dashboard', '/audit-logs', dll, kita bisa buat seperti ini:

    {
        path: '/dashboard',
        component: MainLayout,
        children: [
            { path: '', name: 'dashboard', component: DashboardView }
        ]
    },

    {
        path: '/audit-logs',
        component: MainLayout,
        children: [
            { path: '', name: 'audit-logs', component: AuditLogView }
        ]
    },

    // Rute Master Data
    {
        path: '/master',
        component: MainLayout,
        children: [
            {
                path: 'categories', // URL menjadi: /master/categories
                name: 'master-categories',
                component: CategoryView
            },
            // Nanti tambahkan rute master lainnya disini:
            // { path: 'faculties', component: FacultyView },
            // { path: 'buildings', component: BuildingView },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router