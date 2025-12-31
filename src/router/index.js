import { createRouter, createWebHistory } from 'vue-router'

// 1. Import komponen halaman
const LandingPage = () => import('../views/LandingPage.vue')
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')
const DashboardView = () => import('../views/dashboard/DashboardView.vue')
const AuditLogView = () => import('../views/AuditLogView.vue')
const CategoryView = () => import('../views/master/CategoryView.vue')

// Import Layout (Sidebar & Navbar ada di sini)
const MainLayout = () => import('../layouts/MainLayout.vue')

const routes = [
    // Rute Publik (Tanpa Sidebar)
    { path: '/', name: 'landing', component: LandingPage },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    // Rute Dashboard (Pakai MainLayout)
    {
        path: '/dashboard',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'dashboard',
                component: DashboardView
            }
        ]
    },

    // Rute Audit Logs (Pakai MainLayout juga agar Sidebar muncul)
    {
        path: '/audit-logs',
        component: MainLayout, // Parent Component (Layout)
        children: [
            {
                path: '', // Path kosong berarti ikut parent (/audit-logs)
                name: 'audit-logs',
                component: AuditLogView // Child Component (Isi Konten)
            }
        ]
    },
    {
        path: 'master/categories',
        component: MainLayout,
        children: [
            {
                path: '', // Path kosong berarti ikut parent (/audit-logs)
                name: 'master/categories',
                component: CategoryView // Child Component (Isi Konten)
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router