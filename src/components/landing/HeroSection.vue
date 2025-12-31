<template>
    <section id="home"
        class="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div class="md:w-1/2 text-center md:text-left">
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Kelola Aset Kampus <br>
                <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Lebih Cerdas & Akurat
                </span>
            </h1>
            <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                SIMAN membantu organisasi Anda melacak inventaris, memantau kondisi aset, mencatat riwayat perbaikan,
                hingga audit log secara <i>real-time</i> dan transparan.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <router-link to="/login"
                    class="px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-blue-700 transition hover:shadow-blue-500/30">
                    Mulai Sekarang <i class="fa-solid fa-arrow-right ml-2"></i>
                </router-link>
                <a href="#features"
                    class="px-8 py-3 bg-white text-gray-700 text-lg font-bold rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition">
                    Pelajari Fitur
                </a>
            </div>
        </div>

        <div class="md:w-1/2 flex justify-center">
            <div class="relative">
                <div class="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full blur-xl opacity-70"></div>
                <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full blur-xl opacity-70"></div>
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Dashboard Preview"
                    class="relative rounded-2xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500">
            </div>
        </div>
    </section>
</template>