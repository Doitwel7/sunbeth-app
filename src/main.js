import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { auth } from './firebase' // 👈 Make sure this path correctly points to your firebase config
import { onAuthStateChanged } from 'firebase/auth'
import './style.css'

let app = null

// 🛑 HOLD UP MOUNTING UNTIL FIREBASE REVEALS ACTUAL STATE
onAuthStateChanged(auth, () => {
  if (!app) {
    app = createApp(App)
    app.use(router)
    
    console.log("🔥 Firebase initialized. Mounting Application Tree.")
    console.log("REGISTERED ROUTES:", router.getRoutes().map(r => r.path))
    
    app.mount('#app')
  }
})