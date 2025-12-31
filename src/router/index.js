import { createRouter, createWebHistory } from 'vue-router'

// 1. Import Semua Komponen Halaman
const LandingPage = () => import('../views/LandingPage.vue')
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')

// Views untuk Admin
const DashboardView = () => import('../views/dashboard/DashboardView.vue')
const AuditLogView = () => import('../views/AuditLogView.vue')
const CategoryView = () => import('../views/master/CategoryView.vue')
const BuildingView = () => import('../views/master/BuildingView.vue')
const FacultyView = () => import('../views/master/FacultyView.vue')
const MaintenanceView = () => import('../views/transactions/MaintenanceView.vue')
const MutationView = () => import('../views/transactions/MutationView.vue')
const AssetView = () => import('../views/assets/AssetView.vue')
const ProfileView = () => import('../views/ProfileView.vue')

// Layout dengan Sidebar & Navbar
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
            {
                path: '',
                name: 'dashboard',
                component: DashboardView
            },
            {
                path: 'profile',
                name: 'profile',
                component: ProfileView
            }
        ]
    },

    {
        path: '/audit-logs',
        component: MainLayout,
        children: [
            { path: '', name: 'audit-logs', component: AuditLogView }
        ]
    },

    {
        path: '/assets',
        component: MainLayout,
        children: [
            { path: '', name: 'assets', component: AssetView }
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
            {
                path: 'buildings',
                name: 'master-buildings',
                component: BuildingView
            },
            {
                path: 'faculties', // URL: /master/faculties
                name: 'master-faculties',
                component: FacultyView
            },
        ]
    },
    {
        path: '/transactions', // Bisa dikelompokkan atau langsung di root
        component: MainLayout,
        children: [
            // Rute Perbaikan
            {
                path: 'maintenance', // URL: /transactions/maintenance
                name: 'maintenance',
                component: MaintenanceView
            },
            {
                path: 'mutations', // URL: /transactions/maintenance
                name: 'mutations',
                component: MutationView
            },

        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router