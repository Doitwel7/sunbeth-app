<script setup>
import { ref, reactive, computed } from 'vue'
import { auth, db } from '../firebase' 
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore' 
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const selectedRole = ref('staff')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  firstName: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// Real-time password safety validation indicator
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { label: '', color: 'hidden' }
  if (p.length < 6) return { label: 'Weak', color: 'bg-red-500 text-white' }
  return { label: 'Strong', color: 'bg-green-500 text-white' }
})

/**
 * 📝 Handle New User Email Registration
 */
const handleSignup = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = "Passwords do not match."
    return
  }
  if (!form.agreeTerms) {
    error.value = "You must agree to the terms and conditions."
    return
  }
  
  error.value = ''
  loading.value = true
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password)
    const user = userCredential.user

    // 1. Save Profile Payload directly to Cloud Firestore matching auth state
    await setDoc(doc(db, "users", user.uid), {
      firstName: form.firstName,
      surname: form.surname,
      email: form.email,
      role: selectedRole.value, 
      createdAt: new Date().toISOString()
    })

    // 2. ✅ FIX: Direct onboarding pipeline routing using explicit path URLs
    if (selectedRole.value === 'admin') {
      router.push('/dashboard') // Route Admin registration to Admin Console
    } else {
      router.push('/shift-input') // Route Staff registration to Shift Input Form
    }

  } catch (err) {
    console.error("Detailed Signup Error:", err)
    if (err.code === 'permission-denied') {
      error.value = "Database permission denied. Please verify your Firestore Security Rules."
    } else if (err.code === 'auth/email-already-in-use') {
      error.value = "This email is already registered. Try logging in."
    } else {
      error.value = err.message || "Registration failed. Please check your credentials and try again."
    }
  } finally {
    loading.value = false
  }
}

/**
 * 🌐 Handle Registration via Google Account Sync
 */
const signupWithGoogle = async () => {
  error.value = ''
  loading.value = true
  const provider = new GoogleAuthProvider()
  
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const docRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(docRef)

    // If document profile does not exist yet, build one out for the new account
    if (!docSnap.exists()) {
      const displayName = user.displayName || ''
      const nameParts = displayName.split(' ')
      
      await setDoc(docRef, {
        firstName: nameParts[0] || 'User',
        surname: nameParts.slice(1).join(' ') || '',
        email: user.email,
        role: selectedRole.value,
        createdAt: new Date().toISOString()
      })
    }

    // Get the confirmed current role state from the dynamic account payload
    const freshSnap = await getDoc(docRef)
    const activeRole = freshSnap.data()?.role

    // ✅ FIX: Direct layout mapping via strict routing parameters
    if (activeRole === 'admin') {
      router.push('/dashboard')
    } else {
      router.push('/shift-input')
    }

  } catch (err) {
    console.error("Google Registration Error:", err)
    error.value = "Google authentication failed."
  } finally {
    loading.value = false
  }
}

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
</script>

<template>
  <div class="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 px-4 py-12">
    <main class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      
      <!-- Logo Branding Block -->
      <div class="flex flex-col items-center text-center mb-6">
        <img src="@/assets/images/logo.jpg" alt="Sunbeth Logo" class="h-14 w-auto mb-3 rounded-lg" />
        <h3 class="text-2xl font-bold text-gray-900">Create Account</h3>
        <p class="text-xs text-gray-500 tracking-wide">Join Sunbeth Energies Operations Portal</p>
      </div>

      <!-- Workspace Context Role Toggle -->
      <div class="flex p-1 bg-gray-100 rounded-xl mb-5 border border-gray-200">
        <button 
          type="button"
          @click="selectedRole = 'staff'"
          :class="selectedRole === 'staff' ? 'bg-white shadow-sm text-orange-600 font-bold' : 'text-gray-500'"
          class="flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all tracking-wider"
        >
          Staff
        </button>
        <button 
          type="button"
          @click="selectedRole = 'admin'"
          :class="selectedRole === 'admin' ? 'bg-gray-950 text-white shadow-sm font-bold' : 'text-gray-500'"
          class="flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all tracking-wider"
        >
          Admin
        </button>
      </div>

      <!-- Action Exception Warning Output -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded uppercase tracking-wide leading-relaxed">
        {{ error }}
      </div>

      <!-- Registration Form Structure -->
      <form @submit.prevent="handleSignup" class="space-y-4">
        
        <!-- Parallel Name Layout Row -->
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">First Name</label>
            <input v-model="form.firstName" type="text" required placeholder="John" :class="inputClass" />
          </div>
          <div class="flex-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Surname</label>
            <input v-model="form.surname" type="text" required placeholder="Doe" :class="inputClass" />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
          <input v-model="form.email" type="email" required placeholder="name@sunbeth.com" :class="inputClass" />
        </div>

        <div>
          <div class="flex justify-between mb-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
            <span v-if="form.password" :class="passwordStrength.color" class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{{ passwordStrength.label }}</span>
          </div>
          <div class="relative">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" :class="inputClass" />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirm Password</label>
          <div class="relative">
            <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required placeholder="••••••••" :class="inputClass" />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase">
              {{ showConfirmPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <!-- Compliance Checkbox Toggle -->
        <div class="flex items-start py-1">
          <input id="agree" type="checkbox" v-model="form.agreeTerms" class="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" required />
          <label for="agree" class="ml-2 block text-xs text-gray-500 select-none">
            I certify that the information provided is correct and agree to the system policies.
          </label>
        </div>

        <!-- Submission Trigger button -->
        <button 
          type="submit" 
          :disabled="loading"
          :class="selectedRole === 'admin' ? 'bg-gray-950 hover:bg-black' : 'bg-orange-600 hover:bg-orange-700'"
          class="w-full py-3.5 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 text-xs tracking-widest uppercase"
        >
          {{ loading ? 'CREATING PROFILE...' : 'REGISTER AS ' + selectedRole.toUpperCase() }}
        </button>
      </form>

      <!-- Structural Decorative Divider -->
      <div class="relative flex py-5 items-center">
        <div class="flex-grow border-t border-gray-200"></div>
        <span class="flex-shrink mx-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or</span>
        <div class="flex-grow border-t border-gray-200"></div>
      </div>

      <!-- Alternate Social Entry -->
      <button 
        type="button"
        @click="signupWithGoogle" 
        :disabled="loading"
        class="w-full py-2.5 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm active:scale-95 disabled:opacity-50"
      >
        <img src="https://www.svgrepo.com/show/355037/google.svg" class="h-4 w-4" alt="Google" />
        Sign up with Google
      </button>

      <p class="mt-6 text-center text-xs text-gray-500 font-medium">
        Already registered? 
        <router-link to="/login" class="text-orange-600 font-black hover:underline">Log In Here</router-link>
      </p>
    </main>
  </div>
</template>