<template>
    <div class="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col">
        <Navbar />

        <main class="flex-grow">
            <HeroSection />
            <FeaturesSection />
            <CtaSection />
        </main>

        <Footer />
    </div>
</template>

<script setup>
import Navbar from '../components/landing/Navbar.vue'
import HeroSection from '../components/landing/HeroSection.vue'
import FeaturesSection from '../components/landing/FeaturesSection.vue'
import CtaSection from '../components/landing/CtaSection.vue'
import Footer from '../components/landing/Footer.vue'
</script>