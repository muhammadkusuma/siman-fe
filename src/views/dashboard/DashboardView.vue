<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // 1. UNCOMMENT INI (Wajib agar bisa request ke API)
import Chart from 'chart.js/auto';

// State
const stats = ref({
    totalAssets: 0,
    totalValue: 0,
    maintenance: 0,
    mutations: 0
});
const recentMutations = ref([]);
const chartCanvas = ref(null);

const API_URL = 'http://localhost:3000/api'; // Sudah sesuai dengan main.go
const token = localStorage.getItem('token');

onMounted(async () => {
    // Cek Token
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Data (Parallel)
        // Request ke /api/assets dan /api/mutations
        const [resAssets, resMutations] = await Promise.all([
            axios.get(`${API_URL}/assets`, { headers }),
            axios.get(`${API_URL}/mutations`, { headers })
        ]);

        const assets = resAssets.data.data || [];
        const mutations = resMutations.data.data || [];

        // 1. Kalkulasi Statistik (Client Side)
        stats.value.totalAssets = assets.length;
        stats.value.totalValue = assets.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

        // Hitung aset yang rusak atau dalam perbaikan
        stats.value.maintenance = assets.filter(a =>
            a.operational_status === 'Dalam Perbaikan' || a.condition_status === 'Rusak'
        ).length;

        stats.value.mutations = mutations.length;

        // 2. Ambil 5 Mutasi Terakhir
        recentMutations.value = mutations
            .sort((a, b) => new Date(b.mutation_date) - new Date(a.mutation_date))
            .slice(0, 5);

        // 3. Render Chart (Kondisi Aset)
        const baik = assets.filter(a => a.condition_status === 'Baik').length;
        const rusak = assets.filter(a => a.condition_status === 'Rusak').length;
        const lainnya = assets.length - (baik + rusak);

        // Hancurkan chart lama jika ada (untuk mencegah overlay saat hot reload)
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(chartCanvas.value, {
            type: 'doughnut',
            data: {
                labels: ['Baik', 'Rusak', 'Lainnya'],
                datasets: [{
                    data: [baik, rusak, lainnya],
                    backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });

    } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
        if (error.response && error.response.status === 401) {
            // Token expired
            localStorage.clear();
            window.location.href = '/login';
        }
    }
});

// Helper: Format Rupiah
const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val);
};

// Helper: Format Tanggal
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};
</script>

<template>
    <div>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p class="text-gray-500 text-sm">Ringkasan status aset per hari ini.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-gray-500 text-sm font-medium">Total Aset</h3>
                    <div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><i class="fa-solid fa-cubes"></i></div>
                </div>
                <p class="text-3xl font-bold text-gray-800">{{ stats.totalAssets }}</p>
                <p class="text-xs text-green-500 mt-2 flex items-center">
                    <i class="fa-solid fa-arrow-up mr-1"></i> Data Realtime
                </p>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-gray-500 text-sm font-medium">Nilai Aset</h3>
                    <div class="p-2 bg-green-50 text-green-600 rounded-lg"><i class="fa-solid fa-money-bill-wave"></i>
                    </div>
                </div>
                <p class="text-3xl font-bold text-gray-800">{{ formatRupiah(stats.totalValue) }}</p>
                <p class="text-xs text-gray-400 mt-2">Total perolehan</p>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-gray-500 text-sm font-medium">Sedang Perbaikan</h3>
                    <div class="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><i
                            class="fa-solid fa-screwdriver-wrench"></i></div>
                </div>
                <p class="text-3xl font-bold text-gray-800">{{ stats.maintenance }}</p>
                <p class="text-xs text-yellow-500 mt-2">Aset Non-Aktif</p>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-gray-500 text-sm font-medium">Total Mutasi</h3>
                    <div class="p-2 bg-purple-50 text-purple-600 rounded-lg"><i class="fa-solid fa-truck-fast"></i>
                    </div>
                </div>
                <p class="text-3xl font-bold text-gray-800">{{ stats.mutations }}</p>
                <p class="text-xs text-purple-500 mt-2">Perpindahan</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-gray-800">Mutasi Aset Terakhir</h3>
                    <router-link to="/transactions/mutations" class="text-sm text-blue-600 hover:underline">Lihat
                        Semua</router-link>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th class="px-4 py-3">Aset</th>
                                <th class="px-4 py-3">Dari</th>
                                <th class="px-4 py-3">Ke</th>
                                <th class="px-4 py-3">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="recentMutations.length === 0">
                                <td colspan="4" class="text-center py-4">Belum ada data.</td>
                            </tr>
                            <tr v-for="m in recentMutations" :key="m.id" class="bg-white border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-medium text-gray-900">{{ m.asset ? m.asset.name : 'Unknown' }}
                                </td>
                                <td class="px-4 py-3">{{ m.from_department ? m.from_department.name : '-' }}</td>
                                <td class="px-4 py-3 text-blue-600 font-medium">
                                    <i class="fa-solid fa-arrow-right text-xs mr-1"></i>
                                    {{ m.to_department ? m.to_department.name : '-' }}
                                </td>
                                <td class="px-4 py-3 text-gray-400 text-xs">{{ formatDate(m.mutation_date) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="font-bold text-gray-800 mb-6">Kondisi Aset</h3>
                <canvas ref="chartCanvas"></canvas>
            </div>
        </div>
    </div>
</template>