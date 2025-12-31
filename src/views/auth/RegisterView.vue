<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // 1. Uncomment ini agar bisa request ke API

const router = useRouter();

// State Form Data
const fullName = ref('');
const email = ref('');
const role = ref('Peminjam');
const username = ref('');
const password = ref('');

// State UI
const isLoading = ref(false);
const alertMessage = ref('');
const alertType = ref('');

// Konfigurasi API
const API_URL = 'http://localhost:3000';

const handleRegister = async () => {
    // Reset UI State
    isLoading.value = true;
    alertMessage.value = '';

    try {
        const formData = {
            full_name: fullName.value,
            email: email.value,
            username: username.value,
            password: password.value,
            role: role.value
        };

        // 2. Perbaiki URL: Tambahkan '/api' sesuai route di backend (main.go)
        const response = await axios.post(`${API_URL}/register`, formData);

        // Jika Berhasil
        alertType.value = 'success';
        alertMessage.value = 'Registrasi Berhasil! Mengalihkan ke halaman login...';

        // Redirect setelah 2 detik
        setTimeout(() => {
            router.push('/login');
        }, 2000);

    } catch (error) {
        // Jika Gagal
        alertType.value = 'error';
        if (error.response && error.response.data) {
            alertMessage.value = error.response.data.error || 'Gagal Mendaftar';
        } else {
            alertMessage.value = 'Terjadi kesalahan koneksi ke server.';
        }
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="bg-gray-100 flex items-center justify-center min-h-screen py-10 font-sans text-gray-800">

        <div class="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">

            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Buat Akun Baru</h2>
                <p class="text-gray-500 text-sm">Isi data diri Anda untuk mengakses sistem</p>
            </div>

            <div v-if="alertMessage" :class="[
                'mb-4 p-4 rounded-md block transition-all',
                alertType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            ]">
                <p class="text-sm font-medium">{{ alertMessage }}</p>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-4">

                <div>
                    <label for="full_name" class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input v-model="fullName" type="text" id="full_name" required
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition">
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="email" type="email" id="email" required
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition">
                </div>

                <div>
                    <label for="role" class="block text-sm font-medium text-gray-700">Role Pengguna</label>
                    <select v-model="role" id="role" required
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition">
                        <option value="Peminjam">Peminjam / Staff Biasa</option>
                        <option value="AdminProdi">Admin Prodi</option>
                        <option value="AdminFakultas">Admin Fakultas</option>
                        <option value="Auditor">Auditor</option>
                        <option value="SuperAdmin">Super Admin</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">*Pilih sesuai jabatan Anda.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                        <input v-model="username" type="text" id="username" required
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                        <input v-model="password" type="password" id="password" required
                            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition">
                    </div>
                </div>

                <button type="submit" :disabled="isLoading"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                    <span v-if="isLoading">Memproses...</span>
                    <span v-else>Daftar Sekarang</span>
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-sm text-gray-600">
                    Sudah punya akun?
                    <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 transition">Login
                        disini</router-link>
                </p>
            </div>

        </div>
    </div>
</template>