<script setup>
import { ref, watch } from 'vue'

const dark = ref(localStorage.theme === 'dark')

watch(dark, val => {
  document.documentElement.classList.toggle('dark', val)
  localStorage.theme = val ? 'dark' : 'light'
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-slate-900 text-slate-900 dark:text-white">
    <header class="p-4 flex justify-end">
      <button class="btn-secondary" @click="dark = !dark">
        {{ dark ? 'Light mode' : 'Dark mode' }}
      </button>
    </header>

    <router-view />
  </div>
</template>
