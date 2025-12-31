<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // Pastikan axios sudah di-uncomment

// --- STATE ---
const isLoading = ref(false);
const isSubmittingProfile = ref(false);
const isSubmittingPassword = ref(false);

const user = ref({
    id: null,
    full_name: '',
    username: '',
    email: '',
    role: ''
});

const passwordForm = ref({
    current_password: '',
    new_password: '',
    confirm_password: ''
});

// Konfigurasi API
const API_URL = 'http://localhost:3000/api'; // Endpoint group backend
const token = localStorage.getItem('token');

// --- ACTIONS ---

// 1. Ambil Data User
const fetchProfile = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(`${API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        user.value = response.data.data || response.data;
    } catch (error) {
        console.error("Gagal load profile:", error);
        if (error.response && error.response.status === 401) {
            alert("Sesi habis, silakan login kembali.");
            window.location.href = '/login';
        }
    } finally {
        isLoading.value = false;
    }
};

// 2. Update Biodata
const updateProfile = async () => {
    isSubmittingProfile.value = true;
    try {
        // Payload harus sesuai dengan struct UpdateProfileInput di Go
        const payload = {
            full_name: user.value.full_name,
            email: user.value.email,
            username: user.value.username
        };

        await axios.put(`${API_URL}/profile`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        alert('Profil berhasil diperbarui!');
        // Update localStorage agar nama di header berubah (jika header baca dari sini)
        localStorage.setItem('username', user.value.username);

    } catch (error) {
        const msg = error.response?.data?.error || 'Gagal update profil.';
        alert(msg);
    } finally {
        isSubmittingProfile.value = false;
    }
};

// 3. Ganti Password
const changePassword = async () => {
    // Validasi Frontend
    if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
        alert("Konfirmasi password baru tidak cocok!");
        return;
    }
    if (passwordForm.value.new_password.length < 6) {
        alert("Password minimal 6 karakter.");
        return;
    }

    isSubmittingPassword.value = true;
    try {
        // Payload sesuai struct ChangePasswordInput di Go
        const payload = {
            current_password: passwordForm.value.current_password,
            new_password: passwordForm.value.new_password
        };

        await axios.put(`${API_URL}/change-password`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        alert('Password berhasil diubah! Silakan login ulang.');

        // Logout otomatis
        localStorage.clear();
        window.location.href = '/login';

    } catch (error) {
        const msg = error.response?.data?.error || 'Gagal mengganti password.';
        alert(msg);
    } finally {
        isSubmittingPassword.value = false;
        // Reset form
        passwordForm.value = { current_password: '', new_password: '', confirm_password: '' };
    }
};

onMounted(() => {
    if (!token) {
        window.location.href = '/login';
    } else {
        fetchProfile();
    }
});
</script>

<template>
    <div>
        <header class="bg-white shadow-sm rounded-xl p-4 mb-6">
            <h1 class="text-xl font-bold text-gray-800">Pengaturan Profil</h1>
            <p class="text-sm text-gray-500">Kelola informasi akun dan keamanan Anda</p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <div
                        class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl mx-auto mb-4">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <h2 class="text-lg font-bold text-gray-900">{{ user.full_name || 'User' }}</h2>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                    <div class="mt-4">
                        <span
                            class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {{ user.role }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-2 space-y-6">

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Ubah Biodata</h3>
                    <form @submit.prevent="updateProfile" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input v-model="user.full_name" type="text" required
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input v-model="user.username" type="text" required
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                                <input v-model="user.email" type="email" required
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                        </div>
                        <div class="flex justify-end pt-2">
                            <button type="submit" :disabled="isSubmittingProfile"
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50">
                                {{ isSubmittingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
                            </button>
                        </div>
                    </form>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Keamanan (Ganti Password)</h3>
                    <form @submit.prevent="changePassword" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                            <input v-model="passwordForm.current_password" type="password" required
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                                <input v-model="passwordForm.new_password" type="password" required
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password
                                    Baru</label>
                                <input v-model="passwordForm.confirm_password" type="password" required
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            </div>
                        </div>
                        <div class="flex justify-end pt-2">
                            <button type="submit" :disabled="isSubmittingPassword"
                                class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition shadow-sm disabled:opacity-50">
                                {{ isSubmittingPassword ? 'Memproses...' : 'Ganti Password' }}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
</template>