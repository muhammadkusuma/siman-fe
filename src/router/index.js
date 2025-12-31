import { createRouter, createWebHistory } from 'vue-router'

// Import komponen halaman (Lazy load disarankan untuk performa)
const LandingPage = () => import('../views/LandingPage.vue')
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')
const DashboardView = () => import('../views/dashboard/DashboardView.vue')

const routes = [
    { path: '/', name: 'landing', component: LandingPage },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router