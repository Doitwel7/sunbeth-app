<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="app-layout min-h-screen bg-gray-100 flex">
    
    <!-- If you have a sidebar or header nav template, place it here -->
    
    <!-- 🚨 VITAL TARGET ELEMENT: Child views render right here! -->
    <main class="flex-1 p-6">
      <router-view />
    </main>

  </div>
</template>

<script setup>
// Layout specific state management logic goes here if needed
</script>