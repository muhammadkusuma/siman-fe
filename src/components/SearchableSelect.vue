<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    modelValue: [String, Number], // Nilai yang dipilih (v-model)
    options: { type: Array, default: () => [] }, // Array data (categories, buildings, etc)
    label: { type: String, default: 'name' }, // Nama field untuk ditampilkan (misal: 'name')
    trackBy: { type: String, default: 'id' }, // Nama field untuk value (misal: 'id')
    placeholder: { type: String, default: 'Pilih opsi...' },
    disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref(null);

// Cari nama dari item yang terpilih saat ini
const selectedLabel = computed(() => {
    const found = props.options.find(opt => opt[props.trackBy] === props.modelValue);
    return found ? found[props.label] : '';
});

// Filter opsi berdasarkan search query
const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options;
    return props.options.filter(opt =>
        String(opt[props.label]).toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Aksi saat item dipilih
const selectOption = (option) => {
    emit('update:modelValue', option[props.trackBy]);
    emit('change', option);
    isOpen.value = false;
    searchQuery.value = ''; // Reset search
};

// Toggle dropdown
const toggleDropdown = () => {
    if (props.disabled) return;
    isOpen.value = !isOpen.value;
    if (isOpen.value) searchQuery.value = '';
};

// Tutup jika klik di luar komponen
const handleClickOutside = (e) => {
    if (containerRef.value && !containerRef.value.contains(e.target)) {
        isOpen.value = false;
    }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
    <div class="relative" ref="containerRef">
        <div @click="toggleDropdown"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white flex justify-between items-center cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
            :class="{ 'bg-gray-100 cursor-not-allowed': disabled }">

            <span v-if="selectedLabel" class="text-gray-900 truncate">{{ selectedLabel }}</span>
            <span v-else class="text-gray-400">{{ placeholder }}</span>

            <i class="fa-solid fa-chevron-down text-gray-400 text-xs transition-transform"
                :class="{ 'rotate-180': isOpen }"></i>
        </div>

        <div v-if="isOpen"
            class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-hidden flex flex-col animate-fade-in-up">

            <div class="p-2 border-b border-gray-100 sticky top-0 bg-white">
                <input type="text" v-model="searchQuery" ref="searchInput" placeholder="Cari..."
                    class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded bg-gray-50 outline-none focus:border-blue-400 transition"
                    @click.stop>
            </div>

            <ul class="overflow-y-auto flex-1">
                <li v-for="opt in filteredOptions" :key="opt[trackBy]" @click="selectOption(opt)"
                    class="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition"
                    :class="{ 'bg-blue-50 text-blue-600 font-medium': opt[trackBy] === modelValue }">
                    {{ opt[label] }}
                    <span v-if="opt.kode_barang" class="text-xs text-gray-400 ml-1">({{ opt.kode_barang }})</span>
                    <span v-if="opt.room_number" class="text-xs text-gray-400 ml-1">({{ opt.room_number }})</span>
                </li>

                <li v-if="filteredOptions.length === 0" class="px-4 py-3 text-center text-xs text-gray-400">
                    Tidak ditemukan.
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
/* Animasi Dropdown */
.animate-fade-in-up {
    animation: fadeInUp 0.15s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>