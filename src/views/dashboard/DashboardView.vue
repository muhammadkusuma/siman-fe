<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// --- CONTROLLER LOGIC ---
const router = useRouter()
const stats = ref([
    { title: 'Total Pengguna', value: '1,204', color: 'bg-blue-500' },
    { title: 'Pendapatan', value: 'Rp 45.2M', color: 'bg-green-500' },
    { title: 'Pesanan Baru', value: '34', color: 'bg-purple-500' },
])

const logout = () => {
    if (confirm('Yakin ingin keluar?')) {
        router.push('/login')
    }
}
// ------------------------
</script>

<template>
    <div class="flex h-screen bg-gray-100">
        <aside class="w-64 bg-white shadow-md hidden md:flex flex-col">
            <div class="p-6 text-2xl font-bold text-blue-600">SIMAN</div>
            <nav class="flex-1 p-4 space-y-2">
                <a href="#" class="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">Dashboard</a>
                <a href="#" class="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Pengguna</a>
                <a href="#" class="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Pengaturan</a>
            </nav>
            <div class="p-4 border-t">
                <button @click="logout"
                    class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">Keluar</button>
            </div>
        </aside>

        <main class="flex-1 overflow-y-auto p-8">
            <header class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <div class="flex items-center gap-4">
                    <span class="text-gray-600">Halo, Admin</span>
                    <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div v-for="(stat, index) in stats" :key="index"
                    class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p class="text-gray-500 text-sm font-medium mb-1">{{ stat.title }}</p>
                    <h3 class="text-3xl font-bold text-gray-800">{{ stat.value }}</h3>
                    <div :class="`h-1 w-full mt-4 rounded ${stat.color}`"></div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm h-64 border border-gray-100">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Aktivitas Terkini</h3>
                <p class="text-gray-500">Belum ada data aktivitas untuk ditampilkan.</p>
            </div>
        </main>
    </div>
</template>