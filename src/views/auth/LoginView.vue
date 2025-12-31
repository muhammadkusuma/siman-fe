<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Pastikan ini ada

const router = useRouter();

// State Reactive
const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

// Konfigurasi API
const API_URL = 'http://localhost:3000';

const handleLogin = async () => {
    // Reset state
    isLoading.value = true;
    errorMessage.value = '';

    try {
        // PERBAIKAN: Gunakan endpoint /login (bukan /api/login)
        const response = await axios.post(`${API_URL}/login`, {
            username: username.value,
            password: password.value
        });

        // Jika sukses
        const { token, role } = response.data;

        // Simpan ke LocalStorage
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', username.value);

        // Redirect ke Dashboard
        router.push('/dashboard'); // Pastikan ini sesuai dengan rute dashboard Anda

    } catch (error) {
        // Handle Error
        if (error.response && error.response.data) {
            errorMessage.value = error.response.data.error || 'Gagal login, periksa username/password.';
        } else {
            errorMessage.value = 'Terjadi kesalahan koneksi ke server.';
        }
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="bg-gray-100 flex items-center justify-center min-h-screen font-sans text-gray-800">

        <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
            <div class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <i class="fa-solid fa-boxes-stacked text-blue-600 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h2>
                <p class="text-gray-500 text-sm">Masuk untuk mengelola aset kampus</p>
            </div>

            <div v-if="errorMessage"
                class="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded transition-all">
                <p class="text-sm font-medium">{{ errorMessage }}</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">

                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fa-solid fa-user text-gray-400"></i>
                        </div>
                        <input v-model="username" type="text" id="username" required
                            class="pl-10 block w-full rounded-md border-gray-300 border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition"
                            placeholder="Contoh: admin">
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fa-solid fa-lock text-gray-400"></i>
                        </div>
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" required
                            class="pl-10 block w-full rounded-md border-gray-300 border px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none transition"
                            placeholder="••••••••">
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                            <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" :disabled="isLoading"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-70 disabled:cursor-not-allowed">
                    <span v-if="isLoading">
                        <i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Memproses...
                    </span>
                    <span v-else>
                        Masuk
                    </span>
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-sm text-gray-600">
                    Belum punya akun?
                    <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 transition">Daftar
                        disini</router-link>
                </p>
                <p class="mt-2 text-xs text-gray-400">
                    <router-link to="/" class="hover:text-gray-600 transition">← Kembali ke Beranda</router-link>
                </p>
            </div>

        </div>
    </div>
</template>