import { createApp } from 'vue'
import './assets/maiin.css' // Pastikan nama file css sesuai (ada typo 'maiin' di file asli anda)
import App from './App.vue'
import router from './router' // Tambahkan ini

createApp(App)
    .use(router) // Tambahkan ini
    .mount('#app')