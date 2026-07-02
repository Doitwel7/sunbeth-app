<script setup>
import { ref, reactive } from 'vue'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const selectedRole = ref('staff') // Controls login toggle card layout
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

/**
 * 🔒 Handle Email/Password Login Pipeline
 */
const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    // 1. Authenticate credentials via Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password)
    const user = userCredential.user

    // 2. Fetch matching profile document from Firestore to evaluate workspace roles
    const userDoc = await getDoc(doc(db, "users", user.uid))
    
    // Safety Check: Avoid phantom auth profiles without documents
    if (!userDoc.exists()) {
      error.value = "Profile data missing from database. Please register fresh via the Sign Up screen."
      await auth.signOut()
      return
    }

    const userData = userDoc.data()
    const realUserRole = userData?.role // Reads raw field entry value

    console.log("🔑 [LOGIN PIPELINE]: Tab Selected:", selectedRole.value, "| DB Saved Role:", realUserRole)

    // 3. Evaluate intended login layout workspace container path destination
    if (selectedRole.value === 'admin') {
      if (realUserRole === 'admin') {
        router.push('/dashboard') // Route Admin to Administrator Console
      } else {
        error.value = "Access Denied. Your profile is not registered with Admin privileges."
        await auth.signOut() 
      }
    } else {
      // Staff Workspace Tab Selected
      if (realUserRole === 'staff') {
        router.push('/shift-input') // ✅ FIX: Route Staff to Attendant Form View
      } else if (realUserRole === 'admin') {
        router.push('/dashboard') // ✅ FIX: Route Admin users to Admin panel even if they log in via staff tab
      } else {
        error.value = "Role alignment verification failed. Invalid operational profile role type setup."
        await auth.signOut()
      }
    }

  } catch (err) {
    console.error("❌ [Login Error]: Failure details:", err)
    
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        error.value = "Invalid email or password. Please verify your entries."
        break
      case 'auth/user-disabled':
        error.value = "This user account has been disabled by an administrator."
        break
      case 'auth/too-many-requests':
        error.value = "Account temporarily locked due to too many failed attempts. Try again later."
        break
      default:
        error.value = `System Error [${err.code || 'unknown'}]: ${err.message}`
    }
  } finally {
    loading.value = false
  }
}

/**
 * 🌐 Handle Google OAuth Login Pipeline
 */
const loginWithGoogle = async () => {
  error.value = ''
  loading.value = true
  const provider = new GoogleAuthProvider()
  
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const docRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(docRef)

    // Fallback registration check for direct social logins
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        firstName: user.displayName?.split(' ')[0] || 'User',
        surname: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        role: 'staff', 
        createdAt: new Date().toISOString()
      })
    }

    const freshDoc = await getDoc(docRef)
    const currentSavedRole = freshDoc.data()?.role

    console.log("🌐 [GOOGLE PIPELINE]: Tab Selected:", selectedRole.value, "| DB Saved Role:", currentSavedRole)

    if (selectedRole.value === 'admin') {
      if (currentSavedRole === 'admin') {
        router.push('/dashboard') // Route Admin to Administrator Console
      } else {
        error.value = "Access Denied. This Google account does not hold Admin clearance permissions."
        await auth.signOut()
      }
    } else {
      // Staff Tab Selected via Google
      if (currentSavedRole === 'admin') {
        router.push('/dashboard') // Admin bypass to Admin Console
      } else {
        router.push('/shift-input') // ✅ FIX: Route standard Staff to Attendant Form View
      }
    }
  } catch (err) {
    console.error("❌ [Google Auth Error]: Failed transaction:", err)
    error.value = `Google Auth Error [${err.code || 'unknown'}]: ${err.message}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 px-4 py-12">
    <main class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      
      <!-- Brand Logo Block -->
      <div class="flex flex-col items-center text-center mb-8">
        <img src="@/assets/images/logo.jpg" alt="Sunbeth Logo" class="h-16 w-auto mb-4 rounded-lg object-contain" />
        <h3 class="text-2xl font-bold text-gray-900">Portal Login</h3>
        <p class="text-xs text-gray-500 tracking-wide uppercase font-semibold">Sunbeth Energies Operations</p>
      </div>

      <!-- Platform Role Selection Switch -->
      <div class="flex p-1 bg-gray-100 rounded-xl mb-6 border border-gray-200">
        <button 
          type="button"
          @click="selectedRole = 'staff'"
          :class="selectedRole === 'staff' ? 'bg-white shadow-sm text-orange-600 font-bold' : 'text-gray-500 font-medium'"
          class="flex-1 py-2.5 text-xs uppercase tracking-wider rounded-lg transition-all"
        >
          Staff Workspace
        </button>
        <button 
          type="button"
          @click="selectedRole = 'admin'"
          :class="selectedRole === 'admin' ? 'bg-gray-950 text-white shadow-sm font-bold' : 'text-gray-500 font-medium'"
          class="flex-1 py-2.5 text-xs uppercase tracking-wider rounded-lg transition-all"
        >
          Admin Console
        </button>
      </div>

      <!-- Live Notification Panel -->
      <div v-if="error" class="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded-r-lg normal-case leading-relaxed shadow-sm">
        {{ error }}
      </div>

      <!-- User Interaction Entry Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
          <input 
            v-model="form.email" 
            type="email" 
            required 
            placeholder="email@sunbeth.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-gray-900 text-sm placeholder-gray-400"
          />
        </div>

        <div>
          <div class="flex justify-between mb-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
            <router-link to="/forgot-password" class="text-[10px] font-bold text-orange-600 hover:underline uppercase tracking-wider">Forgot Password?</router-link>
          </div>
          
          <div class="relative">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-gray-900 text-sm placeholder-gray-400"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-wider transition-colors"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          :class="selectedRole === 'admin' ? 'bg-gray-950 hover:bg-black' : 'bg-orange-600 hover:bg-orange-700'"
          class="w-full py-3.5 text-white font-black rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 text-xs tracking-widest uppercase"
        >
          <span v-if="loading">AUTHENTICATING...</span>
          <span v-else>LOGIN TO {{ selectedRole.toUpperCase() }} VIEW</span>
        </button>
      </form>

      <div class="relative flex py-6 items-center">
        <div class="flex-grow border-t border-gray-200"></div>
        <span class="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or</span>
        <div class="flex-grow border-t border-gray-200"></div>
      </div>

      <!-- Google Authentication Trigger Item -->
      <button 
        type="button"
        @click="loginWithGoogle" 
        :disabled="loading"
        class="w-full py-3 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] text-sm disabled:opacity-50"
      >
        <img src="https://www.svgrepo.com/show/355037/google.svg" class="h-4 w-4" alt="Google" />
        Continue with Google
      </button>

      <p class="mt-8 text-center text-xs text-gray-500 font-medium">
        New to the operational platform? 
        <router-link to="/signup" class="text-orange-600 font-black hover:underline ml-1">Create Account</router-link>
      </p>
    </main>
  </div>
</template>