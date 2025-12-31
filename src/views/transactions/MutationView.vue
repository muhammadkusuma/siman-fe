<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios'; // 1. FIX: Axios di-uncomment

// --- STATE ---
const mutations = ref([]);
const assets = ref([]);
const departments = ref([]);
const buildings = ref([]); 
const availableRooms = ref([]); 
const users = ref([]); // 2. Tambah state users untuk list approval

const isLoading = ref(false);
const isSubmitting = ref(false);
const isModalOpen = ref(false);
const searchQuery = ref('');

// Form State
const form = ref({
    asset_id: '',
    from_department_id: '',
    
    // Tujuan (Wajib)
    to_department_id: '',
    to_building_id: '',     
    to_room_id: '',         
    
    mutation_date: new Date().toISOString().split('T')[0],
    reason: '',       
    approved_by: ''   // Nanti diisi dari dropdown user
});

const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const currentUser = localStorage.getItem('username'); // Ambil user yang sedang login

// --- HELPER FUNCTIONS ---
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric' 
    });
};

// --- API ACTIONS ---
const fetchData = async () => {
    isLoading.value = true;
    try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 3. Ambil data Users juga
        const [resMutations, resAssets, resDepts, resBuilds, resUsers] = await Promise.all([
            axios.get(`${API_URL}/mutations`, { headers }),
            axios.get(`${API_URL}/assets`, { headers }),
            axios.get(`${API_URL}/departments`, { headers }),
            axios.get(`${API_URL}/buildings`, { headers }),
            axios.get(`${API_URL}/users`, { headers }) // Endpoint Users
        ]);

        mutations.value = resMutations.data.data || [];
        assets.value = resAssets.data.data || [];
        departments.value = resDepts.data.data || [];
        buildings.value = resBuilds.data.data || [];
        users.value = resUsers.data.data || [];

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
    if (!form.value.to_department_id || !form.value.to_room_id) {
        alert("Unit Tujuan dan Ruangan Tujuan wajib dipilih!");
        return;
    }

    isSubmitting.value = true;
    try {
        const payload = {
            asset_id: parseInt(form.value.asset_id),
            to_department_id: parseInt(form.value.to_department_id),
            to_room_id: parseInt(form.value.to_room_id),
            mutation_date: new Date(form.value.mutation_date).toISOString(),
            reason: form.value.reason,
            approved_by: form.value.approved_by  // Dikirim string nama user
        };

        await axios.post(`${API_URL}/mutations`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        alert('Mutasi aset berhasil dicatat!');
        closeModal();
        fetchData(); 

    } catch (error) {
        alert(error.response?.data?.error || 'Gagal menyimpan mutasi.');
    } finally {
        isSubmitting.value = false;
    }
};

// --- EVENTS ---
const onAssetChange = () => {
    const selectedAsset = assets.value.find(a => a.id === form.value.asset_id);
    if (selectedAsset) {
        form.value.from_department_id = selectedAsset.department_id || '';
    } else {
        form.value.from_department_id = '';
    }
};

const onBuildingChange = () => {
    form.value.to_room_id = ''; 
    const selectedBuilding = buildings.value.find(b => b.id === form.value.to_building_id);
    if (selectedBuilding && selectedBuilding.rooms) {
        availableRooms.value = selectedBuilding.rooms;
    } else {
        availableRooms.value = [];
    }
};

// --- MODAL LOGIC ---
const openModal = () => {
    form.value = {
        asset_id: '',
        from_department_id: '',
        to_department_id: '',
        to_building_id: '',
        to_room_id: '',
        mutation_date: new Date().toISOString().split('T')[0],
        reason: '',
        approved_by: '' // Kosongkan, biarkan user memilih
    };
    availableRooms.value = [];
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const filteredMutations = computed(() => {
    if (!searchQuery.value) return mutations.value;
    const lower = searchQuery.value.toLowerCase();
    return mutations.value.filter(m => 
        (m.asset?.name || '').toLowerCase().includes(lower) || 
        (m.from_department?.code || '').toLowerCase().includes(lower) || 
        (m.to_department?.code || '').toLowerCase().includes(lower)
    );
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
                <h1 class="text-xl font-bold text-gray-800">Mutasi Aset</h1>
                <p class="text-sm text-gray-500">Riwayat perpindahan lokasi aset antar unit</p>
            </div>
            <button @click="openModal" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <i class="fa-solid fa-truck-arrow-right mr-2"></i> Mutasi Baru
            </button>
        </header>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-100 bg-gray-50">
                <div class="relative w-full sm:w-64">
                    <input v-model="searchQuery" type="text" placeholder="Cari aset atau lokasi..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
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
                            <td colspan="6" class="text-center py-8"><i class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat data...</td>
                        </tr>
                        <tr v-else-if="filteredMutations.length === 0">
                            <td colspan="6" class="text-center py-8 text-gray-400">Belum ada data mutasi.</td>
                        </tr>
                        <tr v-else v-for="item in filteredMutations" :key="item.id" class="border-b hover:bg-gray-50 transition">
                            <td class="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                                {{ formatDate(item.mutation_date) }}
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-900">
                                {{ item.asset ? item.asset.name : 'Unknown' }}
                                <div class="text-xs text-gray-500 font-normal">{{ item.asset ? item.asset.inventory_code : '-' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                                    {{ item.from_department ? item.from_department.name : '-' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <i class="fa-solid fa-arrow-right text-blue-500"></i>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-xs">
                                    <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold border border-blue-100 block mb-1 w-max">
                                        {{ item.to_department ? item.to_department.name : '-' }}
                                    </span>
                                    <span class="text-gray-500">{{ item.to_room ? item.to_room.name : '' }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-gray-500 italic truncate max-w-xs">
                                {{ item.reason || '-' }}
                                <div v-if="item.approved_by" class="text-xs not-italic text-gray-400 mt-1">
                                    <i class="fa-solid fa-check-circle mr-1"></i> {{ item.approved_by }}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                
                <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 class="text-lg font-bold text-gray-900">Form Mutasi Aset</h3>
                    <button @click="closeModal" class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-times text-xl"></i></button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto">
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Aset <span class="text-red-500">*</span></label>
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
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Dari Unit</label>
                            <select v-model="form.from_department_id" disabled 
                                class="block w-full border border-gray-200 bg-gray-100 rounded-lg py-2 px-3 text-sm text-gray-500 cursor-not-allowed">
                                <option value="">- Lokasi Awal -</option>
                                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} - {{ d.name }}</option>
                            </select>
                        </div>
                        
                        <div class="flex flex-col justify-center items-center">
                            <i class="fa-solid fa-circle-arrow-right text-blue-500 text-xl mt-4"></i>
                        </div>

                        <div class="col-span-2">
                            <label class="block text-sm font-bold text-blue-800 mb-1">Ke Unit Tujuan <span class="text-red-500">*</span></label>
                            <select v-model="form.to_department_id" required 
                                class="block w-full border border-blue-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="" disabled>-- Pilih Unit Penerima --</option>
                                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.code }} - {{ d.name }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-1">Gedung Tujuan</label>
                            <select v-model="form.to_building_id" @change="onBuildingChange" required
                                class="block w-full border border-blue-300 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                                <option value="" disabled>- Pilih Gedung -</option>
                                <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }} ({{ b.code }})</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-1">Ruangan Tujuan <span class="text-red-500">*</span></label>
                            <select v-model="form.to_room_id" :disabled="!form.to_building_id" required
                                class="block w-full border border-blue-300 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-200 disabled:cursor-not-allowed">
                                <option value="" disabled>- Pilih Ruangan -</option>
                                <option v-for="r in availableRooms" :key="r.id" :value="r.id">{{ r.name }} (Lt.{{ r.floor }})</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mutasi <span class="text-red-500">*</span></label>
                            <input v-model="form.mutation_date" type="date" required 
                                class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Disetujui Oleh</label>
                            <select v-model="form.approved_by" 
                                class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="" disabled>-- Pilih Pejabat --</option>
                                <option v-for="u in users" :key="u.id" :value="u.full_name">
                                    {{ u.full_name }} ({{ u.role }})
                                </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Alasan Mutasi</label>
                        <textarea v-model="form.reason" rows="2" 
                            class="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Peminjaman untuk acara seminar..."></textarea>
                    </div>

                    <div class="flex justify-end gap-3 pt-2">
                        <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Batal</button>
                        <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center">
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
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fade-in-up 0.2s ease-out;
}
</style>