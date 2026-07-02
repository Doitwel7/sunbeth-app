<script setup>
import { ref } from 'vue'
import { auth } from '../firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const isSent = ref(false)

const handleReset = async () => {
  if (!email.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    await sendPasswordResetEmail(auth, email.value)
    isSent.value = true
  } catch (error) {
    errorMessage.value = "We couldn't find an account with that email."
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-500">
    <div class="w-full max-w-md space-y-8">
      
      <div class="text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reset Password
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-base">
          {{ isSent ? "Check your inbox for instructions" : "Enter your email to receive a reset link" }}
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none">
        
        <div v-if="isSent" class="text-center space-y-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-slate-600 dark:text-slate-300">
            An email has been sent to <span class="font-bold text-slate-900 dark:text-white">{{ email }}</span>.
          </p>
          <button @click="isSent = false" class="text-brand font-bold hover:underline">
            Didn't get it? Try again
          </button>
        </div>

        <form v-else @submit.prevent="handleReset" class="space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="name@company.com" 
              class="modern-input" 
              required 
            />
          </div>

          <p v-if="errorMessage" class="text-red-500 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            {{ errorMessage }}
          </p>

          <button type="submit" :disabled="loading" class="btn-primary w-full shadow-brand/40">
            {{ loading ? 'Sending Link...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <router-link to="/login" class="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-brand transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign In
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>