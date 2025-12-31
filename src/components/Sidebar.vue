<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// State untuk toggle menu dropdown "Data Master"
const isMasterMenuOpen = ref(false);

const logout = () => {
    localStorage.clear();
    router.push('/login');
};
</script>

<template>
    <aside class="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-full transition-all duration-300">

        <div class="h-16 flex items-center px-6 border-b border-gray-700 bg-slate-800">
            <i class="fa-solid fa-boxes-stacked text-blue-400 text-xl mr-3"></i>
            <span class="font-bold text-lg tracking-wide">SIMAN</span>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

            <p class="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Menu Utama</p>

            <router-link to="/dashboard"
                class="flex items-center px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
                active-class="bg-blue-600 text-white shadow-md">
                <i class="fa-solid fa-gauge-high w-6"></i> <span class="font-medium">Dashboard</span>
            </router-link>

            <router-link to="/assets"
                class="flex items-center px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
                active-class="bg-blue-600 text-white shadow-md">
                <i class="fa-solid fa-cube w-6"></i> <span class="font-medium">Data Aset</span>
            </router-link>

            <p class="text-xs font-semibold text-gray-500 uppercase px-2 mt-6 mb-2">Transaksi</p>

            <router-link to="/mutations"
                class="flex items-center px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
                active-class="bg-blue-600 text-white shadow-md">
                <i class="fa-solid fa-truck-arrow-right w-6"></i> <span class="font-medium">Mutasi Aset</span>
            </router-link>

            <router-link to="/transactions/maintenance"
                class="flex items-center px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
                active-class="bg-blue-600 text-white shadow-md">
                <i class="fa-solid fa-screwdriver-wrench w-6"></i> <span class="font-medium">Perbaikan</span>
            </router-link>

            <p class="text-xs font-semibold text-gray-500 uppercase px-2 mt-6 mb-2">Administrator</p>

            <div class="space-y-1">
                <button @click="isMasterMenuOpen = !isMasterMenuOpen"
                    class="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition justify-between focus:outline-none">
                    <div class="flex items-center">
                        <i class="fa-solid fa-database w-6"></i> <span class="font-medium">Data Master</span>
                    </div>
                    <i
                        :class="['fa-solid fa-chevron-down text-xs transition-transform', isMasterMenuOpen ? 'rotate-180' : '']"></i>
                </button>

                <div v-show="isMasterMenuOpen" class="pl-10 space-y-1 transition-all">
                    <router-link to="/master/faculties"
                        class="block px-2 py-2 text-sm text-gray-400 hover:text-white rounded hover:bg-slate-800"
                        active-class="text-white font-bold">
                        Fakultas & Prodi
                    </router-link>
                    <router-link to="/master/buildings"
                        class="block px-2 py-2 text-sm text-gray-400 hover:text-white rounded hover:bg-slate-800"
                        active-class="text-white font-bold">
                        Gedung & Ruang
                    </router-link>
                    <router-link to="/master/categories"
                        class="block px-2 py-2 text-sm text-gray-400 hover:text-white rounded hover:bg-slate-800"
                        active-class="text-white font-bold">
                        Kategori BMN
                    </router-link>
                </div>
            </div>

            <router-link to="/audit-logs"
                class="flex items-center px-4 py-3 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
                active-class="bg-blue-600 text-white shadow-md">
                <i class="fa-solid fa-user-secret w-6"></i> <span class="font-medium">Audit Log</span>
            </router-link>
        </nav>

        <div class="p-4 border-t border-gray-700 mt-auto">
            <button @click="logout"
                class="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition">
                <i class="fa-solid fa-right-from-bracket w-6"></i> <span class="font-medium">Logout</span>
            </button>
        </div>
    </aside>
</template>