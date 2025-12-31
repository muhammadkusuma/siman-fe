<template>
    <section id="features" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">
                    Sistem kami dirancang untuk menangani kompleksitas manajemen aset di lingkungan universitas dan
                    korporasi.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div v-for="(feature, index) in features" :key="index"
                    class="p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition duration-300 border border-transparent group"
                    :class="feature.hoverBorderColor">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition"
                        :class="feature.iconBgColor">
                        <i :class="feature.iconClass"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3 text-gray-900">{{ feature.title }}</h3>
                    <p class="text-gray-600">{{ feature.description }}</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const features = [
    {
        title: 'Digital Asset Tracking',
        description: 'Pencatatan aset lengkap dengan QR Code, foto fisik, dan detail spesifikasi teknis.',
        iconClass: 'fa-solid fa-qrcode',
        iconBgColor: 'bg-blue-100 text-blue-600',
        hoverBorderColor: 'hover:border-blue-100'
    },
    {
        title: 'Mutasi & Perpindahan',
        description: 'Lacak perpindahan aset antar gedung atau departemen dengan riwayat yang tidak bisa dimanipulasi.',
        iconClass: 'fa-solid fa-truck-ramp-box',
        iconBgColor: 'bg-purple-100 text-purple-600',
        hoverBorderColor: 'hover:border-purple-100'
    },
    {
        title: 'Riwayat Perbaikan',
        description: 'Catat histori servis (maintenance), biaya perbaikan, dan vendor pelaksana untuk analisis biaya.',
        iconClass: 'fa-solid fa-screwdriver-wrench',
        iconBgColor: 'bg-green-100 text-green-600',
        hoverBorderColor: 'hover:border-green-100'
    }
]
</script>