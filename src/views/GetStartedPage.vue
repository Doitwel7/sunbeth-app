<script setup>
// Landing page uses standard vue-router links to transition states cleanly
</script>

<template>
  <div class="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
    
    <header class="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="@/assets/images/logo.jpg" alt="Sunbeth Logo" class="h-10 w-auto rounded-lg shadow-sm" />
        <span class="text-lg font-bold tracking-tight text-gray-950">Sunbeth Energies</span>
      </div>
      <div class="flex items-center gap-4">
        <router-link to="/get-started" class="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors">
          Log In
        </router-link>
        <router-link to="/get-started" class="px-4 py-2 bg-gray-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-black transition-all">
          Register
        </router-link>
      </div>
    </header>

    <main class="flex-grow flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-700 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
        ⚡ Operations Management Portal
      </div>
      
      <h1 class="text-4xl md:text-6xl font-black text-gray-950 tracking-tight leading-tight mb-6">
        Powering Enterprise <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Energy & Logistics</span>
      </h1>
      
      <p class="text-base md:text-lg text-gray-500 max-w-2xl font-medium leading-relaxed mb-10">
        Access real-time energy transaction matrices, securely process pipeline operational logs, and deploy multi-role platform automation assets all from one single system.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm sm:max-w-none">
        <router-link 
          to="/get-started" 
          class="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:shadow-orange-700/30 active:scale-98 transition-all text-xs tracking-widest uppercase"
        >
          Enter Workspace Portal
        </router-link>

        <router-link 
          to="/get-started" 
          class="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 active:scale-98 transition-all text-xs tracking-widest uppercase"
        >
          Create New Profile
        </router-link>
      </div>
    </main>

    <footer class="w-full max-w-7xl mx-auto px-6 py-6 text-center border-t border-gray-200/60">
      <p class="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
        &copy; Sunbeth Energies Operations Platform. All Corporate Rights Reserved.
      </p>
    </footer>

  </div>
</template>