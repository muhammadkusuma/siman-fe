<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// --- CONTROLLER LOGIC ---
const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
    isLoading.value = true
    // Simulasi API call
    setTimeout(() => {
        console.log('Login:', { email: email.value, password: password.value })
        isLoading.value = false
        router.push('/dashboard') // Redirect ke dashboard setelah login
    }, 1000)
}
// ------------------------
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div class="w-full max-w-md bg-white rounded-xl shadow-md p-8">
            <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Login ke Akun</h2>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="email" type="email" required
                        class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="nama@email.com" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input v-model="password" type="password" required
                        class="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="********" />
                </div>

                <button type="submit" :disabled="isLoading"
                    class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer disabled:bg-blue-300">
                    {{ isLoading ? 'Memproses...' : 'Masuk' }}
                </button>
            </form>

            <p class="text-center mt-4 text-sm text-gray-600">
                Belum punya akun? <router-link to="/register" class="text-blue-600 hover:underline">Daftar
                    disini</router-link>
            </p>
        </div>
    </div>
</template>