<script setup>
import { ref, onMounted } from 'vue';
// import axios from 'axios';

// --- STATE ---
const faculties = ref([]);
const isLoading = ref(false);
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Modal States
const isFacultyModalOpen = ref(false);
const isProdiModalOpen = ref(false);
const isSubmitting = ref(false);
const isEditing = ref(false);

// Forms
const facultyForm = ref({ id: null, code: '', name: '', type: 'Fakultas' });
const prodiForm = ref({ code: '', name: '', degree: 'S1' });

// State untuk Prodi Modal
const selectedFaculty = ref(null);

// --- API ACTIONS: FAKULTAS ---

const fetchFaculties = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(`${API_URL}/faculties`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        faculties.value = response.data.data || [];

        // Update data realtime jika modal prodi sedang terbuka
        if (selectedFaculty.value) {
            const updated = faculties.value.find(f => f.id === selectedFaculty.value.id);
            if (updated) selectedFaculty.value = updated;
        }
    } catch (error) {
        console.error("Gagal load fakultas:", error);
    } finally {
        isLoading.value = false;
    }
};

const submitFaculty = async () => {
    isSubmitting.value = true;
    try {
        const payload = {
            code: facultyForm.value.code,
            name: facultyForm.value.name,
            type: facultyForm.value.type
        };

        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        if (isEditing.value) {
            await axios.put(`${API_URL}/faculties/${facultyForm.value.id}`, payload, config);
        } else {
            await axios.post(`${API_URL}/faculties`, payload, config);
        }

        alert(`Data berhasil ${isEditing.value ? 'diperbarui' : 'ditambahkan'}!`);
        closeFacultyModal();
        fetchFaculties();

    } catch (error) {
        alert(error.response?.data?.error || 'Gagal menyimpan data.');
    } finally {
        isSubmitting.value = false;
    }
};

const deleteFaculty = async (id) => {
    if (!confirm('Hapus Fakultas ini? Data Prodi di dalamnya juga akan terhapus.')) return;
    try {
        await axios.delete(`${API_URL}/faculties/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchFaculties();
    } catch (error) {
        alert('Gagal menghapus data.');
    }
};

// --- API ACTIONS: PRODI (DEPARTMENTS) ---

const submitProdi = async () => {
    if (!selectedFaculty.value) return;

    try {
        const payload = {
            faculty_id: selectedFaculty.value.id,
            code: prodiForm.value.code,
            name: prodiForm.value.name,
            degree: prodiForm.value.degree // Misal: S1, D3
        };

        // Asumsi endpoint untuk prodi adalah /departments
        await axios.post(`${API_URL}/departments`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Reset Form
        prodiForm.value = { code: '', name: '', degree: 'S1' };

        // Refresh Data
        await fetchFaculties();

    } catch (error) {
        alert(error.response?.data?.error || 'Gagal menambah prodi.');
    }
};

const deleteProdi = async (prodiId) => {
    if (!confirm('Hapus Prodi ini?')) return;
    try {
        await axios.delete(`${API_URL}/departments/${prodiId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchFaculties();
    } catch (error) {
        alert('Gagal menghapus prodi.');
    }
};

// --- MODAL HELPERS ---

const openFacultyModal = (data = null) => {
    if (data) {
        isEditing.value = true;
        facultyForm.value = { ...data };
    } else {
        isEditing.value = false;
        facultyForm.value = { id: null, code: '', name: '', type: 'Fakultas' };
    }
    isFacultyModalOpen.value = true;
};

const closeFacultyModal = () => {
    isFacultyModalOpen.value = false;
};

const openProdiModal = (faculty) => {
    selectedFaculty.value = faculty;
    prodiForm.value = { code: '', name: '', degree: 'S1' };
    isProdiModalOpen.value = true;
};

const closeProdiModal = () => {
    isProdiModalOpen.value = false;
    selectedFaculty.value = null;
};

onMounted(fetchFaculties);
</script>

<template>
    <div>
        <header
            class="bg-white shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-xl font-bold text-gray-800">Master Fakultas & Prodi</h1>
                <p class="text-sm text-gray-500">Kelola Unit Induk dan Program Studi</p>
            </div>
            <button @click="openFacultyModal()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <i class="fa-solid fa-plus mr-2"></i> Tambah Fakultas
            </button>
        </header>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th class="px-6 py-3">Kode</th>
                        <th class="px-6 py-3">Nama Unit / Fakultas</th>
                        <th class="px-6 py-3">Tipe</th>
                        <th class="px-6 py-3">Jml Prodi</th>
                        <th class="px-6 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="5" class="text-center py-8"><i
                                class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat...</td>
                    </tr>
                    <tr v-else-if="faculties.length === 0">
                        <td colspan="5" class="text-center py-8 text-gray-400">Belum ada data fakultas.</td>
                    </tr>
                    <tr v-else v-for="item in faculties" :key="item.id" class="border-b hover:bg-gray-50 transition">
                        <td class="px-6 py-4 font-bold text-gray-700">{{ item.code }}</td>
                        <td class="px-6 py-4 font-medium text-gray-900">{{ item.name }}</td>
                        <td class="px-6 py-4">
                            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{{ item.type }}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs font-bold">
                                {{ item.departments ? item.departments.length : 0 }} Prodi
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button @click="openProdiModal(item)"
                                class="bg-green-50 text-green-600 px-3 py-1.5 rounded text-xs font-bold border border-green-200 hover:bg-green-100 transition mr-2">
                                <i class="fa-solid fa-graduation-cap mr-1"></i> Prodi
                            </button>
                            <button @click="openFacultyModal(item)"
                                class="text-yellow-500 hover:text-yellow-700 mx-1"><i
                                    class="fa-solid fa-pen"></i></button>
                            <button @click="deleteFaculty(item.id)" class="text-red-500 hover:text-red-700 mx-1"><i
                                    class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="isFacultyModalOpen"
            class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div class="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-fade-in-up">
                <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-gray-900">{{ isEditing ? 'Edit Fakultas' : 'Tambah Fakultas' }}</h3>
                    <button @click="closeFacultyModal" class="text-gray-400 hover:text-red-500"><i
                            class="fa-solid fa-times"></i></button>
                </div>
                <form @submit.prevent="submitFaculty" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kode (Singkatan)</label>
                        <input v-model="facultyForm.code" type="text" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: FST">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input v-model="facultyForm.name" type="text" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Fakultas Sains Teknologi">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Institusi</label>
                        <select v-model="facultyForm.type"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="Fakultas">Fakultas</option>
                            <option value="Sekolah Pascasarjana">Sekolah Pascasarjana</option>
                            <option value="Direktorat">Direktorat</option>
                            <option value="Lembaga">Lembaga</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" @click="closeFacultyModal"
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Batal</button>
                        <button type="submit" :disabled="isSubmitting"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="isProdiModalOpen && selectedFaculty"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div
                class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Kelola Program Studi</h3>
                        <p class="text-sm text-gray-500">Unit: <span class="font-bold text-blue-600">{{
                                selectedFaculty.name }}</span></p>
                    </div>
                    <button @click="closeProdiModal" class="text-gray-400 hover:text-red-500"><i
                            class="fa-solid fa-times text-xl"></i></button>
                </div>

                <div class="p-6 overflow-y-auto">
                    <form @submit.prevent="submitProdi"
                        class="bg-green-50 p-4 rounded-lg mb-6 border border-green-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div class="sm:col-span-3">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Kode Prodi</label>
                            <input v-model="prodiForm.code" type="text" required
                                class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none"
                                placeholder="701">
                        </div>
                        <div class="sm:col-span-5">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Nama Prodi</label>
                            <input v-model="prodiForm.name" type="text" required
                                class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none"
                                placeholder="Teknik Informatika">
                        </div>
                        <div class="sm:col-span-2">
                            <label class="block text-xs font-bold text-gray-700 mb-1">Jenjang</label>
                            <select v-model="prodiForm.degree"
                                class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none">
                                <option value="S1">S1</option>
                                <option value="S2">S2</option>
                                <option value="S3">S3</option>
                                <option value="D3">D3</option>
                                <option value="D4">D4</option>
                            </select>
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
                                    <th class="px-4 py-2">Kode</th>
                                    <th class="px-4 py-2">Jenjang</th>
                                    <th class="px-4 py-2">Nama Program Studi</th>
                                    <th class="px-4 py-2 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="!selectedFaculty.departments || selectedFaculty.departments.length === 0">
                                    <td colspan="4" class="text-center py-6 text-gray-400 text-xs">Belum ada Program
                                        Studi.</td>
                                </tr>
                                <tr v-else v-for="dept in selectedFaculty.departments" :key="dept.id"
                                    class="border-b last:border-0 hover:bg-gray-50">
                                    <td class="px-4 py-2 font-mono text-xs font-bold text-gray-600">{{ dept.code }}</td>
                                    <td class="px-4 py-2">
                                        <span
                                            class="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{{
                                            dept.degree || 'S1' }}</span>
                                    </td>
                                    <td class="px-4 py-2">{{ dept.name }}</td>
                                    <td class="px-4 py-2 text-right">
                                        <button @click="deleteProdi(dept.id)"
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