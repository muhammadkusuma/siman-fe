<script setup>
import { useRouter } from 'vue-router'

// Controller Logic
const router = useRouter()

const navigateToLogin = () => {
    router.push('/login')
}
</script>

<template>
    <div
        class="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
        <h1 class="text-5xl font-bold mb-4">Selamat Datang di SIMAN</h1>
        <p class="text-xl mb-8 text-blue-100">Sistem Informasi Manajemen Frontend Modern</p>

        <div class="space-x-4">
            <button @click="navigateToLogin"
                class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg cursor-pointer">
                Login Sekarang
            </button>
            <router-link to="/register"
                class="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Daftar Akun
            </router-link>
        </div>
    </div>
</template>