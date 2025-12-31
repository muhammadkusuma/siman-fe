<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue';

const router = useRouter();

// State
const isProfileMenuOpen = ref(false);
const isSidebarOpen = ref(false);

// Ambil data user dari localStorage agar dinamis
const userName = localStorage.getItem('username') || 'Administrator';
const userRole = localStorage.getItem('role') || 'User';

// Fungsi Logout
const logout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.clear();
        router.push('/login');
    }
};
</script>

<template>
    <div class="flex h-screen overflow-hidden bg-gray-100 font-sans text-gray-800">

        <div
            :class="['fixed inset-y-0 left-0 z-30 transition-transform duration-300 transform md:relative md:translate-x-0', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']">
            <Sidebar />
        </div>

        <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
            class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"></div>

        <main class="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">

            <header class="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">

                <button @click="isSidebarOpen = !isSidebarOpen" class="md:hidden text-gray-600 focus:outline-none">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>

                <div class="flex items-center gap-4 ml-auto relative">

                    <button @click="isProfileMenuOpen = !isProfileMenuOpen"
                        class="flex items-center gap-3 focus:outline-none hover:bg-gray-50 p-2 rounded-lg transition">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-bold text-gray-800">{{ userName }}</p>
                            <p class="text-xs text-gray-500">{{ userRole }}</p>
                        </div>
                        <div
                            class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <i
                            :class="['fa-solid fa-chevron-down text-gray-400 text-xs transition-transform', isProfileMenuOpen ? 'rotate-180' : '']"></i>
                    </button>

                    <div v-if="isProfileMenuOpen"
                        class="absolute top-16 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fade-in-up">
                        <router-link to="/dashboard/profile" @click="isProfileMenuOpen = false"
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                            <i class="fa-solid fa-user-gear mr-2"></i> Edit Profil
                        </router-link>

                        <div class="border-t border-gray-100 my-1"></div>

                        <button @click="logout"
                            class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <i class="fa-solid fa-right-from-bracket mr-2"></i> Logout
                        </button>
                    </div>

                </div>
            </header>

            <div class="p-6">
                <router-view></router-view>
            </div>

        </main>
    </div>
</template>

<style scoped>
/* Animasi kecil saat dropdown muncul */
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.2s ease-out;
}
</style>