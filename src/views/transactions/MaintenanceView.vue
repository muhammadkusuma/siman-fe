<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import SearchableSelect from '../../components/SearchableSelect.vue'; // 1. Import Component

// --- STATE ---
const maintenances = ref([]);
const assets = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false); 
const searchQuery = ref('');

// Form State
const form = ref({
    id: null,
    asset_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    description: '',
    vendor_name: '',
    cost: 0,
    action_taken: ''
});

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const token = localStorage.getItem('token');

// --- HELPER FUNCTIONS ---
const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// --- API ACTIONS ---
const fetchData = async () => {
    isLoading.value = true;
    try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [resMaintenance, resAssets] = await Promise.all([
            axios.get(`${API_URL}/maintenances`, { headers }),
            axios.get(`${API_URL}/assets`, { headers })
        ]);

        maintenances.value = resMaintenance.data.data || [];
        assets.value = resAssets.data.data || [];

        // Format asset label untuk searchable select
        assets.value = assets.value.map(a => ({
            ...a,
            displayName: `${a.inventory_code} - ${a.name}`
        }));

    } catch (error) {
        console.error("Gagal memuat data:", error);
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
        const payload = {
            asset_id: parseInt(form.value.asset_id),
            issue_date: new Date(form.value.issue_date).toISOString(),
            status: form.value.status,
            description: form.value.description,
            vendor_name: form.value.vendor_name,
            cost: parseFloat(form.value.cost) || 0,
            action_taken: form.value.action_taken
        };

        const headers = { 'Authorization': `Bearer ${token}` };

        if (isEditing.value) {
            await axios.put(`${API_URL}/maintenances/${form.value.id}`, payload, { headers });
            alert('Data perbaikan berhasil diperbarui!');
        } else {
            await axios.post(`${API_URL}/maintenances`, payload, { headers });
            alert('Data perbaikan berhasil disimpan!');
        }

        closeModal();
        fetchData();

    } catch (error) {
        alert(error.response?.data?.error || 'Gagal menyimpan data.');
    } finally {
        isSubmitting.value = false;
    }
};

const deleteMaintenance = async (id) => {
    if (!confirm('Hapus riwayat perbaikan ini?')) return;
    try {
        await axios.delete(`${API_URL}/maintenances/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData();
    } catch (error) {
        alert('Gagal menghapus data.');
    }
};

// --- MODAL LOGIC ---
const openModal = (item = null) => {
    if (item) {
        isEditing.value = true;
        form.value = {
            id: item.id,
            asset_id: item.asset_id,
            issue_date: item.issue_date ? item.issue_date.split('T')[0] : '',
            status: item.status,
            description: item.description,
            vendor_name: item.vendor_name,
            cost: item.cost,
            action_taken: item.action_taken
        };
    } else {
        isEditing.value = false;
        form.value = {
            id: null,
            asset_id: '',
            issue_date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            description: '',
            vendor_name: '',
            cost: 0,
            action_taken: ''
        };
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

// 2. FIX SEARCH FILTER TABEL
const filteredMaintenances = computed(() => {
    if (!searchQuery.value) return maintenances.value;
    const lower = searchQuery.value.toLowerCase();
    
    return maintenances.value.filter(item => {
        const assetName = (item.asset?.name || '').toLowerCase();
        const assetCode = (item.asset?.inventory_code || '').toLowerCase();
        const vendor = (item.vendor_name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const action = (item.action_taken || '').toLowerCase();

        return assetName.includes(lower) || 
               assetCode.includes(lower) || 
               vendor.includes(lower) || 
               desc.includes(lower) || 
               action.includes(lower);
    });
});

onMounted(() => {
    if (!token) {
        window.location.href = '/login';
    } else {
        fetchData();
    }
});
</script>

<template>
    <div>
        <header class="bg-white shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-xl font-bold text-gray-800">Riwayat Perbaikan & Servis</h1>
                <p class="text-sm text-gray-500">Monitoring kondisi dan biaya perawatan aset</p>
            </div>
            <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <i class="fa-solid fa-plus mr-2"></i> Catat Perbaikan
            </button>
        </header>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-100 bg-gray-50">
                <div class="relative w-full sm:w-64">
                    <input v-model="searchQuery" type="text" placeholder="Cari aset, vendor, deskripsi..."
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
                            <th class="px-6 py-3 w-1/3">Keluhan & Tindakan</th>
                            <th class="px-6 py-3">Biaya & Vendor</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoading">
                            <td colspan="6" class="text-center py-8"><i class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat data...</td>
                        </tr>
                        <tr v-else-if="filteredMaintenances.length === 0">
                            <td colspan="6" class="text-center py-8 text-gray-400">Belum ada riwayat perbaikan.</td>
                        </tr>
                        <tr v-else v-for="item in filteredMaintenances" :key="item.id" class="border-b hover:bg-gray-50 transition">
                            <td class="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                                {{ formatDate(item.issue_date) }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-800">{{ item.asset ? item.asset.name : 'Unknown' }}</div>
                                <div class="text-xs text-gray-500">{{ item.asset ? item.asset.inventory_code : '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-red-600 font-bold text-[10px] uppercase mb-1">Masalah:</div>
                                <div class="text-gray-700 mb-2 leading-snug">{{ item.description }}</div>
                                <div v-if="item.action_taken">
                                    <div class="text-blue-600 font-bold text-[10px] uppercase mb-1">Solusi:</div>
                                    <div class="text-gray-500 text-xs italic">{{ item.action_taken }}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-semibold text-gray-900">{{ formatRupiah(item.cost) }}</div>
                                <div class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-store mr-1"></i> {{ item.vendor_name || '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span v-if="item.status === 'Pending'" class="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">Pending</span>
                                <span v-else-if="item.status === 'Proses'" class="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-yellow-200"><i class="fa-solid fa-clock mr-1"></i> Proses</span>
                                <span v-else-if="item.status === 'Selesai'" class="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-200"><i class="fa-solid fa-check mr-1"></i> Selesai</span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="flex justify-center space-x-2">
                                    <button @click="openModal(item)" class="text-yellow-500 hover:text-yellow-600 transition" title="Edit">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button @click="deleteMaintenance(item.id)" class="text-gray-400 hover:text-red-500 transition" title="Hapus">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
                
                <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center rounded-t-xl shrink-0">
                    <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Edit Data Perbaikan' : 'Form Lapor Perbaikan' }}</h3>
                    <button @click="closeModal" class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-times text-xl"></i></button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-6 overflow-y-auto">
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Aset <span class="text-red-500">*</span></label>
                        <SearchableSelect 
                            v-model="form.asset_id" 
                            :options="assets" 
                            label="displayName" 
                            track-by="id"
                            placeholder="Cari nama atau kode aset..."
                        />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Lapor <span class="text-red-500">*</span></label>
                            <input v-model="form.issue_date" type="date" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 outline-none bg-white">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status Pengerjaan <span class="text-red-500">*</span></label>
                            <select v-model="form.status" required class="block w-full border border-gray-300 rounded-lg py-2 px-3 outline-none bg-white">
                                <option value="Pending">Pending (Baru Lapor)</option>
                                <option value="Proses">Sedang Dikerjakan</option>
                                <option value="Selesai">Selesai</option>
                            </select>
                            <p class="text-[10px] text-gray-500 mt-1">
                                *Status "Proses" akan mengubah status aset menjadi "Dalam Perbaikan".
                            </p>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Kerusakan <span class="text-red-500">*</span></label>
                        <textarea v-model="form.description" required rows="3" class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Jelaskan detail kerusakan..."></textarea>
                    </div>

                    <div class="border-t pt-4">
                        <h4 class="text-sm font-bold text-gray-800 mb-3">Detail Teknis (Opsional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Vendor / Teknisi</label>
                                <input v-model="form.vendor_name" type="text" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none" placeholder="Nama Vendor">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Biaya (Rp)</label>
                                <input v-model="form.cost" type="number" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none" placeholder="0">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-700 mb-1">Tindakan Perbaikan</label>
                            <textarea v-model="form.action_taken" rows="2" class="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm outline-none placeholder-gray-400" placeholder="Solusi yang dilakukan..."></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-2">
                        <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Batal</button>
                        <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center">
                            <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
                            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Tiket' }}
                        </button>
                    </div>

                </form>
            </div>
        </div>

    </div>
</template>

<style scoped>
@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fade-in-up 0.2s ease-out;
}
</style>