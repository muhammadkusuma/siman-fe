<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios'; // 1. FIX: Uncomment axios agar bisa request API

const logs = ref([]);
const isLoading = ref(false);
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// --- STATE PAGINASI ---
const currentPage = ref(1);
const itemsPerPage = 10; // Menampilkan 10 data per halaman

// Helper: Format Tanggal
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// Helper: Warna Badge
const getActionClass = (action) => {
    switch (action) {
        case 'CREATE': return 'bg-green-100 text-green-800';
        case 'UPDATE': return 'bg-blue-100 text-blue-800';
        case 'DELETE': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Fetch Data
const fetchLogs = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(`${API_URL}/audit-logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Sesuai dengan audit_controller.go: c.JSON(..., gin.H{"data": logs})
        logs.value = response.data.data || [];
    } catch (error) {
        console.error("Gagal mengambil data log:", error);
        // Handle Token Expired
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
    } finally {
        isLoading.value = false;
    }
};

// --- LOGIC PAGINASI ---

// 1. Hitung Total Halaman
const totalPages = computed(() => {
    return Math.ceil(logs.value.length / itemsPerPage);
});

// 2. Filter Data sesuai Halaman Aktif
const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return logs.value.slice(start, end);
});

// 3. Fungsi Ganti Halaman
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

// 4. Info Data (Menampilkan "1 - 10 dari 50 data")
const showingInfo = computed(() => {
    if (logs.value.length === 0) return '0 data';
    const start = (currentPage.value - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage.value * itemsPerPage, logs.value.length);
    return `${start} - ${end} dari ${logs.value.length} data`;
});

onMounted(() => {
    if (!token) {
        window.location.href = '/login';
    } else {
        fetchLogs();
    }
});
</script>

<template>
    <div>
        <header class="mb-6">
            <h1 class="text-xl font-bold text-gray-800">Catatan Audit Sistem</h1>
        </header>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-sm text-blue-700 flex items-start">
            <i class="fa-solid fa-info-circle mr-2 mt-0.5"></i>
            <p>
                Halaman ini mencatat semua aktivitas sensitif (Tambah, Edit, Hapus) yang dilakukan oleh pengguna
                untuk keperluan keamanan dan transparansi.
            </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-3">Waktu</th>
                            <th class="px-6 py-3">User</th>
                            <th class="px-6 py-3">Aksi</th>
                            <th class="px-6 py-3">Target</th>
                            <th class="px-6 py-3">Detail Perubahan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoading">
                            <td colspan="5" class="text-center py-8">
                                <i class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat data...
                            </td>
                        </tr>

                        <tr v-else-if="logs.length === 0">
                            <td colspan="5" class="text-center py-8 text-gray-400">Belum ada aktivitas terekam.</td>
                        </tr>

                        <tr v-else v-for="log in paginatedLogs" :key="log.id"
                            class="border-b hover:bg-gray-50 transition">
                            <td class="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                                {{ formatDate(log.created_at) }}
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-900">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                                        <i class="fa-solid fa-user"></i>
                                    </div>
                                    <span>{{ log.user ? log.user.username : 'System' }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="getActionClass(log.action)" class="px-2 py-1 rounded text-xs font-bold">
                                    {{ log.action }}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-mono text-xs">
                                ID: {{ log.record_id }} <br>
                                <span class="text-gray-400">({{ log.table_name }})</span>
                            </td>
                            <td class="px-6 py-4 text-xs text-gray-600 truncate max-w-xs" :title="log.changes">
                                {{ log.changes || '-' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="logs.length > 0"
                class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span class="text-xs text-gray-500">
                    Menampilkan {{ showingInfo }}
                </span>

                <div class="inline-flex items-center space-x-1">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                        class="px-3 py-1 rounded-md text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>

                    <span class="px-3 py-1 text-xs font-medium text-gray-700">
                        Halaman {{ currentPage }} dari {{ totalPages }}
                    </span>

                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="px-3 py-1 rounded-md text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>