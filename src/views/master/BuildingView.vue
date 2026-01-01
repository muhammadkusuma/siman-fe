<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // 1. UNCOMMENT INI (Wajib agar bisa request ke API)

// --- STATE ---
const buildings = ref([]);
const isLoading = ref(false);
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`; // Pastikan sesuai dengan group /api di main.go
const token = localStorage.getItem('token');

// Modal States
const isBuildingModalOpen = ref(false);
const isRoomModalOpen = ref(false);
const isSubmitting = ref(false);

// Form States
const buildingForm = ref({ code: '', name: '', total_floors: '' });
const roomForm = ref({ room_number: '', name: '', floor: '' });
const selectedBuilding = ref(null); // Menyimpan gedung yang sedang dibuka modal ruangannya

// --- API ACTIONS: BUILDINGS ---

const fetchBuildings = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(`${API_URL}/buildings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Mengambil data dari response.data.data
        buildings.value = response.data.data || [];

        // Jika modal ruangan sedang terbuka, update datanya juga (agar realtime saat tambah room)
        if (selectedBuilding.value) {
            const updated = buildings.value.find(b => b.id === selectedBuilding.value.id);
            if (updated) selectedBuilding.value = updated;
        }
    } catch (error) {
        console.error("Gagal load gedung:", error);
        // Handle token expired jika perlu
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
    } finally {
        isLoading.value = false;
    }
};

const submitBuilding = async () => {
    isSubmitting.value = true;
    try {
        // Konversi total_floors ke integer agar sesuai tipe data backend (uint/int)
        const payload = {
            ...buildingForm.value,
            total_floors: parseInt(buildingForm.value.total_floors)
        };

        await axios.post(`${API_URL}/buildings`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Gedung berhasil ditambahkan!');
        closeBuildingModal();
        fetchBuildings();
    } catch (error) {
        alert(error.response?.data?.error || 'Gagal menyimpan gedung.');
    } finally {
        isSubmitting.value = false;
    }
};

const deleteBuilding = async (id) => {
    if (!confirm('Hapus gedung ini? Semua ruangan di dalamnya juga akan terhapus.')) return;
    try {
        await axios.delete(`${API_URL}/buildings/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchBuildings();
    } catch (error) {
        // Jika error 404, berarti rute DELETE belum ada di backend
        console.error(error);
        alert(error.response?.data?.error || 'Gagal menghapus gedung. Pastikan API DELETE tersedia.');
    }
};

// --- API ACTIONS: ROOMS ---

const submitRoom = async () => {
    if (!selectedBuilding.value) return;

    try {
        const payload = {
            building_id: selectedBuilding.value.id, // ID Gedung dari parent
            room_number: roomForm.value.room_number,
            name: roomForm.value.name,
            floor: parseInt(roomForm.value.floor)
        };

        await axios.post(`${API_URL}/rooms`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Reset form kecil
        roomForm.value = { room_number: '', name: '', floor: '' };

        // Refresh data utama untuk update list ruangan di modal
        await fetchBuildings();

    } catch (error) {
        alert(error.response?.data?.error || 'Gagal menambah ruangan.');
    }
};

const deleteRoom = async (roomId) => {
    if (!confirm('Hapus ruangan ini?')) return;
    try {
        await axios.delete(`${API_URL}/rooms/${roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchBuildings(); // Refresh list
    } catch (error) {
        alert('Gagal menghapus ruangan.');
    }
};

// --- MODAL HELPERS ---

const openBuildingModal = () => {
    buildingForm.value = { code: '', name: '', total_floors: '' };
    isBuildingModalOpen.value = true;
};

const closeBuildingModal = () => {
    isBuildingModalOpen.value = false;
};

const openRoomModal = (building) => {
    selectedBuilding.value = building;
    // Sort room saat modal dibuka (Lantai -> No Ruang)
    if (selectedBuilding.value.rooms) {
        selectedBuilding.value.rooms.sort((a, b) => a.floor - b.floor || a.room_number.localeCompare(b.room_number));
    } else {
        // Jika rooms null/undefined, inisialisasi array kosong agar tidak error di template
        selectedBuilding.value.rooms = [];
    }
    roomForm.value = { room_number: '', name: '', floor: '' };
    isRoomModalOpen.value = true;
};

const closeRoomModal = () => {
    isRoomModalOpen.value = false;
    selectedBuilding.value = null;
};

onMounted(() => {
    if (!token) {
        window.location.href = '/login';
    } else {
        fetchBuildings();
    }
});
</script>

<template>
    <div>
        <header
            class="bg-white shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-xl font-bold text-gray-800">Master Gedung & Ruang</h1>
                <p class="text-sm text-gray-500">Manajemen lokasi aset fisik kampus</p>
            </div>
            <button @click="openBuildingModal"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <i class="fa-solid fa-plus mr-2"></i> Tambah Gedung
            </button>
        </header>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th class="px-6 py-3">Kode</th>
                        <th class="px-6 py-3">Nama Gedung</th>
                        <th class="px-6 py-3">Jml Lantai</th>
                        <th class="px-6 py-3">Total Ruang</th>
                        <th class="px-6 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="5" class="text-center py-8"><i
                                class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat...</td>
                    </tr>
                    <tr v-else-if="buildings.length === 0">
                        <td colspan="5" class="text-center py-8 text-gray-400">Belum ada data gedung.</td>
                    </tr>
                    <tr v-else v-for="b in buildings" :key="b.id" class="border-b hover:bg-gray-50 transition">
                        <td class="px-6 py-4 font-bold text-gray-700">{{ b.code }}</td>
                        <td class="px-6 py-4 font-medium text-gray-900">{{ b.name }}</td>
                        <td class="px-6 py-4">{{ b.total_floors }} Lantai</td>
                        <td class="px-6 py-4">
                            <span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-bold">
                                {{ b.rooms ? b.rooms.length : 0 }} Ruang
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button @click="openRoomModal(b)"
                                class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-xs font-bold border border-blue-200 hover:bg-blue-100 transition mr-2">
                                <i class="fa-solid fa-door-open mr-1"></i> Kelola Ruangan
                            </button>
                            <button @click="deleteBuilding(b.id)"
                                class="text-gray-400 hover:text-red-500 transition ml-2" title="Hapus Gedung">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="isBuildingModalOpen"
            class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div class="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-fade-in-up">
                <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-gray-900">Tambah Gedung Baru</h3>
                    <button @click="closeBuildingModal" class="text-gray-400 hover:text-red-500"><i
                            class="fa-solid fa-times"></i></button>
                </div>
                <form @submit.prevent="submitBuilding" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kode Gedung</label>
                        <input v-model="buildingForm.code" type="text" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: G1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Gedung</label>
                        <input v-model="buildingForm.name" type="text" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Gedung Rektorat">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Lantai</label>
                        <input v-model="buildingForm.total_floors" type="number" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: 3">
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" @click="closeBuildingModal"
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Batal</button>
                        <button type="submit" :disabled="isSubmitting"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="isRoomModalOpen && selectedBuilding"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div
                class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Kelola Ruangan</h3>
                        <p class="text-sm text-gray-500">Gedung: <span class="font-bold text-blue-600">{{
                            selectedBuilding.name }}</span> ({{ selectedBuilding.code }})</p>
                    </div>
                    <button @click="closeRoomModal" class="text-gray-400 hover:text-red-500"><i
                            class="fa-solid fa-times text-xl"></i></button>
                </div>

                <div class="p-6 overflow-y-auto">
                    <form @submit.prevent="submitRoom"
                        class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div class="sm:col-span-3">
                            <label class="block text-xs font-bold text-gray-700 mb-1">No. Ruang</label>
                            <input v-model="roomForm.room_number" type="text" required
                                class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="101">
                        </div>
                        <div class="sm:col-span-5">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Nama Ruangan</label>
                            <input v-model="roomForm.name" type="text" required
                                class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="Lab Komputer">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Lantai</label>
                            <input v-model="roomForm.floor" type="number" required
                                class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="1">
                        </div>
                        <div class="sm:col-span-2">
                            <button type="submit"
                                class="w-full bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm font-bold shadow-sm transition">
                                <i class="fa-solid fa-plus mr-1"></i> Add
                            </button>
                        </div>
                    </form>

                    <div class="border rounded-lg overflow-hidden">
                        <table class="w-full text-sm text-left text-gray-500">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th class="px-4 py-2">No.</th>
                                    <th class="px-4 py-2">Nama Ruangan</th>
                                    <th class="px-4 py-2">Lantai</th>
                                    <th class="px-4 py-2 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="!selectedBuilding.rooms || selectedBuilding.rooms.length === 0">
                                    <td colspan="4" class="text-center py-6 text-gray-400 text-xs">Belum ada ruangan.
                                        Silakan tambah diatas.</td>
                                </tr>
                                <tr v-else v-for="room in selectedBuilding.rooms" :key="room.id"
                                    class="border-b last:border-0 hover:bg-gray-50">
                                    <td class="px-4 py-2 font-mono text-xs font-bold text-gray-600">{{ room.room_number
                                        }}</td>
                                    <td class="px-4 py-2">{{ room.name }}</td>
                                    <td class="px-4 py-2">Lt. {{ room.floor }}</td>
                                    <td class="px-4 py-2 text-right">
                                        <button @click="deleteRoom(room.id)"
                                            class="text-gray-400 hover:text-red-500 transition"><i
                                                class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
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