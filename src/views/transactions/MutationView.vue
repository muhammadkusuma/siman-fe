<script setup>
import { ref, onMounted, computed } from 'vue';
// import axios from 'axios';

// --- STATE ---
const mutations = ref([]);
const assets = ref([]);
const departments = ref([]); // Untuk dropdown lokasi (Dari/Ke)
const isLoading = ref(false);
const isSubmitting = ref(false);
const isModalOpen = ref(false);
const searchQuery = ref('');

// Form State
const form = ref({
    asset_id: '',
    from_department_id: '',
    to_department_id: '',
    mutation_date: new Date().toISOString().split('T')[0], // Default Hari Ini
    notes: ''
});

const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// --- HELPER FUNCTIONS ---
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// --- API ACTIONS ---
const fetchData = async () => {
    isLoading.value = true;
    try {
        // Fetch Mutasi, Aset, dan Departemen sekaligus
        const [resMutations, resAssets, resDepts] = await Promise.all([
            axios.get(`${API_URL}/mutations`, { headers: { 'Authorization': `Bearer ${token}` } }),
            axios.get(`${API_URL}/assets`, { headers: { 'Authorization': `Bearer ${token}` } }),
            axios.get(`${API_URL}/departments`, { headers: { 'Authorization': `Bearer ${token}` } }) // Pastikan ada endpoint ini
        ]);

        mutations.value = resMutations.data.data || [];
        assets.value = resAssets.data.data || [];
        departments.value = resDepts.data.data || [];

    } catch (error) {
        console.error("Gagal memuat data:", error);
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async () => {
    // Validasi sederhana
    if (form.value.from_department_id === form.value.to_department_id) {
        alert("Lokasi Asal dan Tujuan tidak boleh sama!");
        return;
    }

    isSubmitting.value = true;
    try {
        const payload = {
            asset_id: parseInt(form.value.asset_id),
            from_department_id: parseInt(form.value.from_department_id),
            to_department_id: parseInt(form.value.to_department_id),
            mutation_date: new Date(form.value.mutation_date).toISOString(),
            notes: form.value.notes
        };

        await axios.post(`${API_URL}/mutations`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        alert('Mutasi aset berhasil dicatat!');
        closeModal();
        fetchData(); // Refresh data

    } catch (error) {
        alert(error.response?.data?.error || 'Gagal menyimpan mutasi.');
    } finally {
        isSubmitting.value = false;
    }
};

// Saat aset dipilih, otomatis isi "Dari Lokasi" berdasarkan data aset saat ini
const onAssetChange = () => {
    const selectedAsset = assets.value.find(a => a.id === form.value.asset_id);
    if (selectedAsset && selectedAsset.department_id) {
        form.value.from_department_id = selectedAsset.department_id;
    } else {
        form.value.from_department_id = '';
    }
};

// --- MODAL LOGIC ---
const openModal = () => {
    form.value = {
        asset_id: '',
        from_department_id: '',
        to_department_id: '',
        mutation_date: new Date().toISOString().split('T')[0],
        notes: ''
    };
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

// Filter Search
const filteredMutations = computed(() => {
    if (!searchQuery.value) return mutations.value;
    const lower = searchQuery.value.toLowerCase();
    return mutations.value.filter(m =>
        (m.asset?.name || '').toLowerCase().includes(lower) ||
        (m.from_department?.code || '').toLowerCase().includes(lower) ||
        (m.to_department?.code || '').toLowerCase().includes(lower)
    );
});

onMounted(fetchData);
</script>

<template>
    <div>
        <header
            class="bg-white shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-xl font-bold text-gray-800">Mutasi Aset</h1>
                <p class="text-sm text-gray-500">Riwayat perpindahan lokasi aset antar unit</p>
            </div>
            <button @click="openModal"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <i class="fa-solid fa-truck-arrow-right mr-2"></i> Mutasi Baru
            </button>
        </header>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-100 bg-gray-50">
                <div class="relative w-full sm:w-64">
                    <input v-model="searchQuery" type="text" placeholder="Cari aset atau lokasi..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-400"></i>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-3">Tanggal</th>
                            <th class="px-6 py-3">Aset</th>
                            <th class="px-6 py-3">Dari Lokasi</th>
                            <th class="px-6 py-3 text-center"><i class="fa-solid fa-arrow-right text-gray-400"></i></th>
                            <th class="px-6 py-3">Ke Lokasi</th>
                            <th class="px-6 py-3">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoading">
                            <td colspan="6" class="text-center py-8"><i
                                    class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat data...</td>
                        </tr>
                        <tr v-else-if="filteredMutations.length === 0">
                            <td colspan="6" class="text-center py-8 text-gray-400">Belum ada data mutasi.</td>
                        </tr>
                        <tr v-else v-for="item in filteredMutations" :key="item.id"
                            class="border-b hover:bg-gray-50 transition">
                            <td class="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                                {{ formatDate(item.mutation_date) }}
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-900">
                                {{ item.asset ? item.asset.name : 'Unknown' }}
                                <div class="text-xs text-gray-500 font-normal">{{ item.asset ? item.asset.inventory_code
                                    : '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span
                                    class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                                    {{ item.from_department ? item.from_department.code : '-' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <i class="fa-solid fa-arrow-right text-blue-500"></i>
                            </td>
                            <td class="px-6 py-4">
                                <span
                                    class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                    {{ item.to_department ? item.to_department.code : '-' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-gray-500 italic truncate max-w-xs">
                                {{ item.notes || '-' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div
                class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">

                <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 class="text-lg font-bold text-gray-900">Form Mutasi Aset</h3>
                    <button @click="closeModal" class="text-gray-400 hover:text-red-500"><i
                            class="fa-solid fa-times text-xl"></i></button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Aset <span
                                class="text-red-500">*</span></label>
                        <select v-model="form.asset_id" @change="onAssetChange" required
                            class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="" disabled>-- Cari Aset --</option>
                            <option v-for="a in assets" :key="a.id" :value="a.id">
                                {{ a.inventory_code }} - {{ a.name }}
                            </option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Dari Lokasi</label>
                            <select v-model="form.from_department_id" disabled
                                class="block w-full border border-gray-200 bg-gray-100 rounded-lg py-2 px-3 text-sm text-gray-500 cursor-not-allowed">
                                <option value="">- Lokasi Awal -</option>
                                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} - {{ d.name }}
                                </option>
                            </select>
                        </div>
                        <div class="flex flex-col justify-center items-center">
                            <i class="fa-solid fa-circle-arrow-right text-blue-500 text-xl mt-4"></i>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-bold text-blue-800 mb-1">Ke Lokasi Tujuan <span
                                    class="text-red-500">*</span></label>
                            <select v-model="form.to_department_id" required
                                class="block w-full border border-blue-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="" disabled>-- Pilih Tujuan --</option>
                                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} - {{ d.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mutasi <span
                                class="text-red-500">*</span></label>
                        <input v-model="form.mutation_date" type="date" required
                            class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan / Alasan</label>
                        <textarea v-model="form.notes" rows="3"
                            class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Peminjaman untuk acara seminar..."></textarea>
                    </div>

                    <div class="flex justify-end gap-3 pt-2">
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Batal</button>
                        <button type="submit" :disabled="isSubmitting"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center">
                            <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
                            {{ isSubmitting ? 'Memproses...' : 'Simpan Mutasi' }}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
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