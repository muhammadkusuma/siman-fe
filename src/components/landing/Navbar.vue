<template>
    <nav class="bg-white shadow-sm fixed w-full z-50 top-0 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex-shrink-0 flex items-center gap-2">
                    <i class="fa-solid fa-boxes-stacked text-blue-600 text-2xl"></i>
                    <span class="font-bold text-2xl tracking-tight text-gray-900">SIMAN</span>
                </div>

                <div class="hidden md:flex space-x-8 items-center">
                    <a href="#home" class="text-gray-600 hover:text-blue-600 font-medium transition">Beranda</a>
                    <a href="#features" class="text-gray-600 hover:text-blue-600 font-medium transition">Fitur</a>
                    <a href="#about" class="text-gray-600 hover:text-blue-600 font-medium transition">Tentang</a>
                </div>

                <div class="flex items-center gap-3">
                    <router-link to="/login"
                        class="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition">
                        Masuk
                    </router-link>
                    <router-link to="/register"
                        class="hidden md:inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition transform hover:-translate-y-0.5">
                        Daftar
                    </router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
// Gunakan <router-link> jika menggunakan Vue Router untuk Login/Register
</script>