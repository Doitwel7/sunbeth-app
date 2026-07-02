<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const router = useRouter()

// UI Control & State Management Reactive Variables
const isLoading = ref(true)
const userData = ref(null)
const userRole = ref('')

// Simple mock functional state tracking data for Sunbeth Operations
const staffTasks = ref([
  { id: 1, task: "Log inventory dispatch parameters", status: "Pending", due: "Today" },
  { id: 2, task: "Verify energy grid readout values", status: "Completed", due: "Yesterday" }
])

const adminMetrics = ref({
  totalUsers: 24,
  activeTerminals: 8,
  systemAlerts: 0
})

/**
 * 🔒 Safe Sign Out Sequence
 */
const handleLogout = async () => {
  try {
    isLoading.value = true
    await signOut(auth)
    console.log("🔒 [Dashboard]: User session terminated successfully.")
    router.push({ name: 'Login' })
  } catch (error) {
    console.error("❌ [Logout Error]: Failed to close session securely:", error)
    isLoading.value = false
  }
}

/**
 * 🚀 Life Cycle Initialization Hooks
 */
onMounted(() => {
  // Listen directly to auth lifecycle channel to pull user metadata context safely
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.warn("⚠️ [Dashboard Watch]: Unauthorized session state. Ejecting user.")
      router.push({ name: 'Login' })
      return
    }

    try {
      // Direct transactional read from the user profiles database
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        userData.value = docSnap.data()
        userRole.value = userData.value.role || 'staff' // Graceful fallback
        console.log("📦 [Dashboard Mount]: Active Operational Profile Node:", userData.value)
      } else {
        console.error("❌ [Dashboard Mount]: User database document entry structural failure.")
        userRole.value = 'staff' // Safety baseline
      }
    } catch (err) {
      console.error("❌ [Dashboard Fetch Exception]: Connection failure reading profile:", err)
    } finally {
      isLoading.value = false
    }
  })
})
</script>

<template>
  <!-- Screen Context Case A: Global Database Data Retreival State -->
  <div v-if="isLoading" class="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50">
    <div class="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-orange-600 mb-4"></div>
    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Workspace Layout...</p>
  </div>

  <!-- Screen Context Case B: Data Loaded Successfully -->
  <div v-else class="min-h-screen w-full bg-gray-100 flex">
    
    <!-- Left Navigation Bar Element -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col justify-between p-6">
      <div class="space-y-8">
        <!-- Sunbeth Branding Entry Header Block -->
        <div class="flex items-center gap-3">
          <img src="@/assets/images/logo.jpg" alt="Sunbeth Logo" class="h-9 w-9 rounded-lg object-contain bg-white" />
          <div>
            <h2 class="text-sm font-black tracking-wider uppercase m-0">Sunbeth</h2>
            <p class="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Energies Portal</p>
          </div>
        </div>

        <!-- Navigation Menu Item Links Panel -->
        <nav class="space-y-2">
          <a href="#" class="flex items-center gap-3 px-4 py-3 bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
            📊 Operational Overview
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
            📁 Data Records
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
            ⚙️ System Settings
          </a>
        </nav>
      </div>

      <!-- User Session Context Utility Footprint Info Block -->
      <div class="border-t border-gray-800 pt-4 space-y-3">
        <div class="px-2">
          <p class="text-xs font-black text-white truncate m-0">
            {{ userData?.firstName || 'User' }} {{ userData?.surname || '' }}
          </p>
          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate m-0">
            Role: <span :class="userRole === 'admin' ? 'text-red-400' : 'text-orange-400'">{{ userRole }}</span>
          </p>
        </div>
        
        <button 
          @click="handleLogout"
          type="button"
          class="w-full py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:border-transparent transition-all"
        >
          Terminate Session
        </button>
      </div>
    </aside>

    <!-- Right Workspace Dashboard Main Content Frame Area -->
    <main class="flex-1 flex flex-col min-w-0">
      
      <!-- Top Workspace Context Banner Area Header -->
      <header class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 class="text-lg font-black text-gray-900 m-0">
            {{ userRole === 'admin' ? 'Administrative Control Terminal' : 'Staff Operations Panel' }}
          </h1>
          <p class="text-xs text-gray-500 m-0">Operational dashboard view container frame layout.</p>
        </div>
        <div class="text-right">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            Environment Node: Live
          </span>
        </div>
      </header>

      <!-- Central View Content Switchboard Wrapper Grid -->
      <div class="flex-1 p-8 overflow-y-auto">
        
        <!-- ==================== CONDITIONAL LAYOUT AREA 1: ADMIN SYSTEM VIEW ==================== -->
        <div v-if="userRole === 'admin'" class="space-y-6">
          <!-- Multi-Data Parameter Summary Value Bar Blocks -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Managed Access Profiles</span>
              <h2 class="text-3xl font-black text-gray-900 mt-2">{{ adminMetrics.totalUsers }}</h2>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active System Terminals</span>
              <h2 class="text-3xl font-black text-gray-900 mt-2">{{ adminMetrics.activeTerminals }}</h2>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between bg-emerald-50/50 border-emerald-200">
              <span class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Security Incidents</span>
              <h2 class="text-3xl font-black text-emerald-600 mt-2">{{ adminMetrics.systemAlerts }}</h2>
            </div>
          </div>

          <!-- Admin Administrative Table Workspace Container Block -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-wider">System Control Monitoring Matrix</h3>
              <button class="px-4 py-2 bg-gray-950 text-white font-bold text-xs rounded-xl hover:bg-black uppercase tracking-wider transition-colors">Generate Operations Audit</button>
            </div>
            <div class="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
              Historical analytical metrics logging grid active and streaming data hooks safely.
            </div>
          </div>
        </div>

        <!-- ==================== CONDITIONAL LAYOUT AREA 2: STAFF SYSTEM VIEW ==================== -->
        <div v-else-if="userRole === 'staff'" class="space-y-6">
          <!-- Greeting Card Banner item -->
          <div class="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-2xl shadow-md">
            <h2 class="text-xl font-black m-0">Welcome Back, {{ userData?.firstName || 'Operator' }}!</h2>
            <p class="text-xs text-orange-50/90 mt-1">Ready for operational assignments. Ensure parameters align with safety compliance protocol books.</p>
          </div>

          <!-- Staff Assignment Interactive List Container Module -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 class="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Current Shift Operational Log Checklists</h3>
            
            <div class="divide-y divide-gray-100">
              <div v-for="item in staffTasks" :key="item.id" class="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p class="text-sm font-bold text-gray-900 m-0">{{ item.task }}</p>
                  <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider m-0">Timeline Expectation Target: {{ item.due }}</p>
                </div>
                <span 
                  :class="item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                  class="px-2.5 py-1 text-[10px] font-black border uppercase tracking-wider rounded-lg"
                >
                  {{ item.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>