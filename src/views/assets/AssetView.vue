<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios'; // 1. FIX: Uncomment axios

// --- STATE MANAGEMENT ---
const assets = ref([]);
const categories = ref([]);
const departments = ref([]);
const buildings = ref([]);
const availableRooms = ref([]);

const isLoading = ref(false);
const isSubmitting = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');

// Form State
const form = ref({
    id: null,
    name: '',
    asset_category_id: '',
    inventory_code: '',
    nup: '',
    brand: '',
    model: '',
    serial_number: '',
    department_id: '',
    building_id: '',
    room_id: '',
    acquisition_date: '',
    price: 0,
    condition_status: 'Baik',
    operational_status: 'Aktif',
    photo: null,
    photo_preview: null
});

const API_URL = 'http://localhost:3000/api';
const BASE_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');

// --- API ACTIONS ---

const initData = async () => {
    isLoading.value = true;
    try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [resAssets, resCats, resDepts, resBuilds] = await Promise.all([
            axios.get(`${API_URL}/assets`, { headers }),
            axios.get(`${API_URL}/categories`, { headers }),
            axios.get(`${API_URL}/departments`, { headers }),
            axios.get(`${API_URL}/buildings`, { headers })
        ]);

        assets.value = resAssets.data.data || [];
        categories.value = resCats.data.data || [];
        departments.value = resDepts.data.data || [];
        buildings.value = resBuilds.data.data || [];

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
        const formData = new FormData();

        // Append fields
        formData.append('name', form.value.name);
        formData.append('asset_category_id', form.value.asset_category_id);
        formData.append('inventory_code', form.value.inventory_code);
        formData.append('nup', form.value.nup);
        formData.append('brand', form.value.brand);
        formData.append('model', form.value.model);
        formData.append('serial_number', form.value.serial_number);
        formData.append('department_id', form.value.department_id);
        formData.append('room_id', form.value.room_id);
        formData.append('condition_status', form.value.condition_status);
        formData.append('price', form.value.price || 0);

        // Handle Date: Kirim format ISO
        if (form.value.acquisition_date) {
            const date = new Date(form.value.acquisition_date);
            formData.append('acquisition_date', date.toISOString());
        }

        // Handle File
        if (form.value.photo instanceof File) {
            formData.append('photo', form.value.photo);
        }

        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        if (isEditing.value) {
            await axios.put(`${API_URL}/assets/${form.value.id}`, formData, config);
            alert('Aset berhasil diperbarui!');
        } else {
            await axios.post(`${API_URL}/assets`, formData, config);
            alert('Aset baru berhasil ditambahkan!');
        }

        closeModal();
        initData();

    } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || 'Gagal menyimpan aset.');
    } finally {
        isSubmitting.value = false;
    }
};

const deleteAsset = async (id) => {
    if (!confirm('Yakin ingin menghapus aset ini?')) return;
    try {
        await axios.delete(`${API_URL}/assets/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        initData();
    } catch (error) {
        alert('Gagal menghapus aset.');
    }
};

// --- LOGIC HELPER ---

const handleBuildingChange = () => {
    form.value.room_id = '';
    const selectedBuilding = buildings.value.find(b => b.id === form.value.building_id);
    if (selectedBuilding && selectedBuilding.rooms) {
        availableRooms.value = selectedBuilding.rooms;
    } else {
        availableRooms.value = [];
    }
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        form.value.photo = file;
        form.value.photo_preview = URL.createObjectURL(file);
    }
};

// --- MODAL ---

const openModal = (asset = null) => {
    if (asset) {
        isEditing.value = true;
        let buildingId = '';
        const foundBuilding = buildings.value.find(b => b.rooms?.some(r => r.id === asset.room_id));
        if (foundBuilding) {
            buildingId = foundBuilding.id;
            availableRooms.value = foundBuilding.rooms;
        } else {
            availableRooms.value = [];
        }

        form.value = {
            id: asset.id,
            name: asset.name,
            asset_category_id: asset.asset_category_id,
            inventory_code: asset.inventory_code,
            nup: asset.nup,
            brand: asset.brand,
            model: asset.model,
            serial_number: asset.serial_number,
            department_id: asset.department_id,
            building_id: buildingId,
            room_id: asset.room_id,
            acquisition_date: asset.acquisition_date ? asset.acquisition_date.split('T')[0] : '',
            price: asset.price,
            condition_status: asset.condition_status,
            photo: null,
            photo_preview: asset.photo_path ? `${BASE_URL}/${asset.photo_path}` : null
        };
    } else {
        isEditing.value = false;
        availableRooms.value = [];
        form.value = {
            id: null,
            name: '',
            asset_category_id: '',
            inventory_code: '',
            nup: '',
            brand: '',
            model: '',
            serial_number: '',
            department_id: '',
            building_id: '',
            room_id: '',
            acquisition_date: '',
            price: 0,
            condition_status: 'Baik',
            photo: null,
            photo_preview: null
        };
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    form.value.photo_preview = null;
};

const filteredAssets = computed(() => {
    if (!searchQuery.value) return assets.value;
    const lower = searchQuery.value.toLowerCase();
    return assets.value.filter(item =>
        item.name.toLowerCase().includes(lower) ||
        (item.inventory_code || '').toLowerCase().includes(lower)
    );
});

onMounted(initData);
</script>

<template>
    <div>
        <header class="bg-white shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-xl font-bold text-gray-800">Manajemen Aset</h1>
                <p class="text-sm text-gray-500">Daftar inventaris Barang Milik Negara (BMN)</p>
            </div>
            <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <i class="fa-solid fa-plus mr-2"></i> Tambah Aset
            </button>
        </header>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-100 bg-gray-50">
                <div class="relative w-full sm:w-72">
                    <input v-model="searchQuery" type="text" placeholder="Cari nama, kode, atau NUP..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-400"></i>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-3">Aset Info</th>
                            <th class="px-6 py-3">Kategori</th>
                            <th class="px-6 py-3">Lokasi</th>
                            <th class="px-6 py-3">Kondisi</th>
                            <th class="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoading">
                            <td colspan="5" class="text-center py-8"><i class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat data...</td>
                        </tr>
                        <tr v-else-if="filteredAssets.length === 0">
                            <td colspan="5" class="text-center py-8 text-gray-400">Data aset tidak ditemukan.</td>
                        </tr>
                        <tr v-else v-for="item in filteredAssets" :key="item.id" class="border-b hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded bg-gray-200 overflow-hidden shrink-0">
                                        <img v-if="item.photo_path" :src="`${BASE_URL}/${item.photo_path}`" class="w-full h-full object-cover">
                                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-image"></i></div>
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-900">{{ item.name }}</div>
                                        <div class="text-xs text-gray-500 font-mono">{{ item.inventory_code }} | NUP: {{ item.nup }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                {{ item.category ? item.category.name : '-' }}
                                <div class="text-xs text-gray-400">{{ item.brand }} {{ item.model }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-700">{{ item.room ? item.room.name : '-' }}</div>
                                <div class="text-xs text-gray-500">{{ item.department ? item.department.code : '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="{ 'bg-green-100 text-green-800': item.condition_status === 'Baik', 'bg-red-100 text-red-800': item.condition_status === 'Rusak' || item.condition_status === 'Rusak Berat', 'bg-yellow-100 text-yellow-800': item.operational_status === 'Dalam Perbaikan' || item.condition_status === 'Rusak Ringan' }" class="px-2.5 py-0.5 rounded-full text-xs font-medium border border-opacity-20">
                                    {{ item.operational_status === 'Dalam Perbaikan' ? 'Perbaikan' : item.condition_status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="flex justify-center space-x-2">
                                    <button @click="openModal(item)" class="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded transition"><i class="fa-solid fa-pen"></i></button>
                                    <button @click="deleteAsset(item.id)" class="p-1.5 text-red-500 hover:bg-red-50 rounded transition"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
                <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Edit Data Aset' : 'Tambah Aset Baru' }}</h3>
                    <button @click="closeModal" class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-times text-xl"></i></button>
                </div>
                <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto">
                    <div class="mb-6">
                        <h4 class="text-sm font-bold text-gray-800 mb-3 border-b pb-1">Informasi Utama</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-xs font-medium text-gray-700 mb-1">Nama Aset <span class="text-red-500">*</span></label>
                                <input v-model="form.name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Kategori <span class="text-red-500">*</span></label>
                                <select v-model="form.asset_category_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none">
                                    <option value="" disabled>Pilih Kategori</option>
                                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }} ({{ c.kode_barang }})</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-xs font-medium text-gray-700 mb-1">Kode Inventaris</label>
                                    <input v-model="form.inventory_code" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-700 mb-1">NUP</label>
                                    <input v-model="form.nup" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <h4 class="text-sm font-bold text-gray-800 mb-3 border-b pb-1">Detail Fisik</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label class="block text-xs font-medium text-gray-700 mb-1">Merk</label><input v-model="form.brand" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                            <div><label class="block text-xs font-medium text-gray-700 mb-1">Model</label><input v-model="form.model" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                            <div><label class="block text-xs font-medium text-gray-700 mb-1">Serial Number</label><input v-model="form.serial_number" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                        </div>
                    </div>
                    <div class="mb-6 bg-blue-50 p-4 rounded-lg">
                        <h4 class="text-sm font-bold text-blue-800 mb-3">Lokasi</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Unit Pemilik</label>
                                <select v-model="form.department_id" required class="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm bg-white"><option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option></select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Gedung</label>
                                <select v-model="form.building_id" @change="handleBuildingChange" class="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="">- Pilih -</option><option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option></select>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-medium text-gray-700 mb-1">Ruangan</label>
                                <select v-model="form.room_id" :disabled="!form.building_id" required class="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-200"><option v-for="r in availableRooms" :key="r.id" :value="r.id">{{ r.name }} ({{ r.room_number }})</option></select>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-sm font-bold text-gray-800 mb-3 border-b pb-1">Status & Nilai</h4>
                            <div class="space-y-4">
                                <div><label class="block text-xs font-medium text-gray-700 mb-1">Kondisi</label><select v-model="form.condition_status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="Baik">Baik</option><option value="Rusak">Rusak</option></select></div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div><label class="block text-xs font-medium text-gray-700 mb-1">Tgl Perolehan <span class="text-red-500">*</span></label><input v-model="form.acquisition_date" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                                    <div><label class="block text-xs font-medium text-gray-700 mb-1">Harga</label><input v-model="form.price" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800 mb-3 border-b pb-1">Foto</h4>
                            <input type="file" @change="handleFileChange" accept="image/*" class="w-full">
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 pt-6 mt-6 border-t">
                        <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
                        <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-blue-600 text-white rounded-lg">{{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}</button>
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