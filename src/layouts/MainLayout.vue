<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '../components/Sidebar.vue'; // Import komponen Sidebar

const userName = 'Administrator';
const userRole = localStorage.getItem('role') || 'User';
const isSidebarOpen = ref(false); 
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

            <header class="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
                <button @click="isSidebarOpen = !isSidebarOpen" class="md:hidden text-gray-600 focus:outline-none">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>

                <div class="flex items-center gap-4 ml-auto">
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-bold text-gray-800">{{ userName }}</p>
                        <p class="text-xs text-gray-500">{{ userRole }}</p>
                    </div>
                    <div
                        class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        <i class="fa-solid fa-user"></i>
                    </div>
                </div>
            </header>

            <div class="p-6">
                <router-view></router-view>
            </div>

        </main>
    </div>
</template>