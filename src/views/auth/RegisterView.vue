<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// --- CONTROLLER LOGIC ---
const router = useRouter()
const form = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const handleRegister = () => {
    if (form.value.password !== form.value.confirmPassword) {
        alert('Password tidak sama!')
        return
    }
    console.log('Register Data:', form.value)
    // Logic simpan data ke API disini...
    router.push('/login')
}
// ------------------------
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div class="w-full max-w-md bg-white rounded-xl shadow-md p-8">
            <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Daftar Akun Baru</h2>

            <form @submit.prevent="handleRegister" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input v-model="form.name" type="text" required
                        class="mt-1 w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="form.email" type="email" required
                        class="mt-1 w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input v-model="form.password" type="password" required
                        class="mt-1 w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                    <input v-model="form.confirmPassword" type="password" required
                        class="mt-1 w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                </div>

                <button type="submit"
                    class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium cursor-pointer">
                    Daftar
                </button>
            </form>

            <p class="text-center mt-4 text-sm text-gray-600">
                Sudah punya akun? <router-link to="/login" class="text-blue-600 hover:underline">Login
                    disini</router-link>
            </p>
        </div>
    </div>
</template>