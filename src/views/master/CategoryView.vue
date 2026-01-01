<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios'; // 1. UNCOMMENT INI (Wajib agar bisa request ke API)

// --- STATE ---
const categories = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);

// Form State
const form = ref({
    id: null,
    kode_barang: '',
    name: '',
    description: ''
});

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`; // Endpoint API
const token = localStorage.getItem('token');

// --- API ACTIONS ---

// 1. Fetch Data
const fetchCategories = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Mengambil data dari response.data.data sesuai format JSON backend (gin.H{"data": ...})
        categories.value = response.data.data || [];
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        // Handle jika token expired
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
    } finally {
        isLoading.value = false;
    }
};

// 2. Submit (Create / Update)
const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
        const payload = {
            kode_barang: form.value.kode_barang,
            name: form.value.name,
            description: form.value.description
        };

        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        if (isEditing.value) {
            // Update: PUT /api/categories/:id
            await axios.put(`${API_URL}/categories/${form.value.id}`, payload, config);
            alert('Kategori berhasil diperbarui!');
        } else {
            // Create: POST /api/categories
            await axios.post(`${API_URL}/categories`, payload, config);
            alert('Kategori berhasil ditambahkan!');
        }

        closeModal();
        fetchCategories(); // Refresh data tabel

    } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || 'Gagal menyimpan data');
    } finally {
        isSubmitting.value = false;
    }
};

// 3. Delete
const deleteCategory = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

    try {
        // Delete: DELETE /api/categories/:id
        await axios.delete(`${API_URL}/categories/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchCategories(); // Refresh data
    } catch (error) {
        console.error(error);
        alert('Gagal menghapus data.');
    }
};

// --- HELPER FUNCTIONS ---

// Filter Pencarian (Client-side search)
const filteredCategories = computed(() => {
    if (!searchQuery.value) return categories.value;
    const lower = searchQuery.value.toLowerCase();
    return categories.value.filter(item =>
        item.name.toLowerCase().includes(lower) ||
        item.kode_barang.toLowerCase().includes(lower)
    );
});

// Modal Logic
const openModal = (category = null) => {
    if (category) {
        // Edit Mode
        isEditing.value = true;
        form.value = { ...category }; // Copy object agar reaktif
    } else {
        // Create Mode
        isEditing.value = false;
        form.value = { id: null, kode_barang: '', name: '', description: '' };
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

onMounted(() => {
    // Cek token sebelum request
    if (!token) {
        window.location.href = '/login';
    } else {
        fetchCategories();
    }
});
</script>

<template>
    <div>
        <header
            class="bg-white shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-xl font-bold text-gray-800">Master Kategori BMN</h1>
                <p class="text-sm text-gray-500">Kelola klasifikasi aset (SIMAK BMN)</p>
            </div>
            <button @click="openModal()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium">
                <i class="fa-solid fa-plus mr-2"></i> Tambah Kategori
            </button>
        </header>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div class="relative w-full max-w-xs">
                    <input v-model="searchQuery" type="text" placeholder="Cari kode atau nama..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-400"></i>
                </div>
                <div class="text-sm text-gray-500">
                    Total: <span class="font-bold text-gray-700">{{ filteredCategories.length }}</span>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                        <tr>
                            <th class="px-6 py-3 w-40">Kode Barang</th>
                            <th class="px-6 py-3">Nama Kategori</th>
                            <th class="px-6 py-3">Deskripsi</th>
                            <th class="px-6 py-3 text-center w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoading">
                            <td colspan="4" class="text-center py-8">
                                <i class="fa-solid fa-circle-notch fa-spin text-blue-500 mr-2"></i> Memuat data...
                            </td>
                        </tr>

                        <tr v-else-if="filteredCategories.length === 0">
                            <td colspan="4" class="text-center py-8 text-gray-400">Data tidak ditemukan.</td>
                        </tr>

                        <tr v-else v-for="item in filteredCategories" :key="item.id"
                            class="border-b hover:bg-gray-50 transition">
                            <td class="px-6 py-4 font-mono font-semibold text-blue-700 bg-blue-50/30">
                                {{ item.kode_barang }}
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-900">
                                {{ item.name }}
                            </td>
                            <td class="px-6 py-4 text-gray-500 italic truncate max-w-xs">
                                {{ item.description || '-' }}
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="flex justify-center space-x-2">
                                    <button @click="openModal(item)"
                                        class="p-2 text-yellow-500 hover:text-white hover:bg-yellow-500 rounded transition"
                                        title="Edit">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button @click="deleteCategory(item.id)"
                                        class="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded transition"
                                        title="Hapus">
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
            <div class="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fade-in-up">

                <div class="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-900">
                        {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
                    </h3>
                    <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kode Barang (SIMAK BMN)</label>
                        <input v-model="form.kode_barang" type="text" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Contoh: 3.10.01.02">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                        <input v-model="form.name" type="text" required
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Contoh: Laptop / Notebook">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea v-model="form.description" rows="3"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Keterangan tambahan (Opsional)"></textarea>
                    </div>

                    <div class="flex justify-end gap-3 pt-2">
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Batal</button>
                        <button type="submit" :disabled="isSubmitting"
                            class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-md disabled:opacity-70 flex items-center">
                            <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
                            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
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
    animation: fade-in-up 0.3s ease-out;
}
</style>