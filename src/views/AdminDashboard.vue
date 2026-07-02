<script setup>
import { ref, onMounted, computed } from 'vue'
import { db, auth } from '../firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { 
  Users, Wallet, BarChart3, ShieldCheck, Clock, Fuel,
  Plus, Download, Filter
} from 'lucide-vue-next'

const currentModule = ref('staff')

// --- Live Database Data Arrays ---
const staffLogs = ref([])
const financialDrops = ref([])
const reportsArchive = ref([])
const securityClearances = ref([])
const shiftSchedules = ref([])
const fuelInventory = ref([
  { product: 'PMS (Premium Motor Spirit)', capacity: '45,000 L', current: '28,450 L', status: 'Optimal', indicator: 'bg-emerald-500', pct: 63 },
  { product: 'AGO (Automotive Gas Oil)', capacity: '35,000 L', current: '6,200 L', status: 'Low Stock Trigger', indicator: 'bg-rose-500 animate-pulse', pct: 17 },
  { product: 'DPK (Dual Purpose Kerosene)', capacity: '20,000 L', current: '18,900 L', status: 'Optimal', indicator: 'bg-emerald-500', pct: 94 }
])

// --- Dynamic Financial Aggregate Computations ---
const totalExpected = computed(() => {
  return financialDrops.value.reduce((acc, curr) => acc + (curr.expectedAmount || 0), 0)
})

const totalReceived = computed(() => {
  return financialDrops.value.reduce((acc, curr) => acc + (curr.amount || 0), 0)
})

const totalVariance = computed(() => {
  return totalReceived.value - totalExpected.value
})

// --- Live Database Sync Pipelines ---
onMounted(() => {
  // 1. Subscribe to Live Sales Logs Feed
  const salesQuery = query(collection(db, "sales_logs"), orderBy("timestamp", "desc"), limit(30))
  
  onSnapshot(salesQuery, (snapshot) => {
    const rawLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Map data to Staff Monitoring layout matrix
    staffLogs.value = rawLogs.map((log, index) => ({
      id: `STF-${log.id.slice(0,3).toUpperCase()}`,
      name: log.attendantName || 'System Attendant',
      nozzle: log.fuelType || 'Unassigned Node',
      status: index < 3 ? 'Active' : 'Off-Shift',
      shift: new Date(log.timestamp).getHours() < 14 ? 'Morning' : 'Night',
      compliance: (log.variance || 0) >= 0 ? '100%' : '94%'
    }))

    // Map data directly to Financial Trackers
    financialDrops.value = rawLogs.map(log => ({
      id: log.id.slice(0, 6).toUpperCase(),
      node: 'Terminal Node ' + (log.fuelType?.split(' ')[0] || 'A'),
      type: log.cashReceived > 0 ? 'Cash Drop' : 'POS Drop',
      amount: log.cashReceived || 0,
      expectedAmount: log.expectedAmount || 0,
      variance: log.variance || 0,
      status: (log.variance || 0) >= 0 ? 'Verified' : 'Discrepancy'
    }))

    // Calculate aggregated total volumes for Reports View
    const volumeSum = rawLogs.reduce((acc, curr) => acc + (curr.litersSold || 0), 0)
    reportsArchive.value = [
      { 
        name: `Live Session Audit Summary`, 
        scope: 'Active Pipeline Block', 
        volume: `${volumeSum.toLocaleString()} L`, 
        revenue: `₦${totalReceived.value.toLocaleString()}`, 
        status: 'Audited' 
      }
    ]
  }, (error) => {
    console.error("Firestore feed failure:", error)
  })

  // 2. Subscribe to Authenticated Users List
  onSnapshot(collection(db, "users"), (snapshot) => {
    const usersList = snapshot.docs.map(doc => doc.data())
    
    securityClearances.value = usersList.map(u => ({
      user: `${u.firstName || 'User'} ${u.surname || ''}`,
      role: u.role === 'admin' ? 'Administrator' : 'Station Staff',
      access: u.role === 'admin' ? 'Global (Write/Delete)' : 'Terminal Input Only',
      logs: u.role === 'admin' ? 'Full Access' : 'Restricted'
    }))

    shiftSchedules.value = usersList.filter(u => u.role === 'staff').map((u, i) => ({
      attendant: `${u.firstName || 'Staff'} ${u.surname || ''}`,
      timeline: i % 2 === 0 ? '06:00 AM - 02:00 PM' : '02:00 PM - 10:00 PM',
      block: i % 2 === 0 ? 'Morning Shift' : 'Evening Shift',
      station: 'Main Deck Hub'
    }))
  })
})

const handleSignOut = async () => {
  await auth.signOut()
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
    
    <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 hidden lg:flex flex-col flex-shrink-0">
      <div class="h-20 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 justify-between">
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-orange-600 rounded-lg text-white">
            <Fuel class="w-5 h-5" />
          </div>
          <div>
            <h1 class="text-sm font-black uppercase tracking-tight dark:text-white">Sunbeth Core</h1>
            <span class="text-[9px] font-bold text-orange-600 tracking-widest uppercase block">Management HUD</span>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1.5">
        <button 
          @click="currentModule = 'staff'"
          :class="currentModule === 'staff' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          <Users class="w-4 h-4" /> Staff Monitoring
        </button>

        <button 
          @click="currentModule = 'financial'"
          :class="currentModule === 'financial' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          <Wallet class="w-4 h-4" /> Financial Tracking
        </button>

        <button 
          @click="currentModule = 'reports'"
          :class="currentModule === 'reports' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          <BarChart3 class="w-4 h-4" /> Reports & Analytics
        </button>

        <button 
          @click="currentModule = 'security'"
          :class="currentModule === 'security' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          <ShieldCheck class="w-4 h-4" /> Role Clearance Security
        </button>

        <button 
          @click="currentModule = 'shifts'"
          :class="currentModule === 'shifts' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          <Clock class="w-4 h-4" /> Shift Management
        </button>

        <button 
          @click="currentModule = 'fuel'"
          :class="currentModule === 'fuel' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          <Fuel class="w-4 h-4" /> Fuel Tracking & Inventory
        </button>
      </nav>
      
      <div class="p-4 border-t border-slate-100 dark:border-slate-800">
        <button @click="handleSignOut" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-wider rounded-xl transition-all">
          Exit Console
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 overflow-x-hidden">
      
      <header class="h-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between flex-shrink-0 transition-colors">
        <div class="flex items-center gap-4">
          <h2 class="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Workspace Module / <span class="text-orange-600 capitalize">{{ currentModule }}</span>
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <span class="text-xs font-black block text-slate-900 dark:text-white">Audit Console</span>
            <span class="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">Node Sync Active</span>
          </div>
        </div>
      </header>

      <div class="p-6 sm:p-8 flex-1 overflow-y-auto">
        
        <div v-if="currentModule === 'staff'" class="space-y-6 animate-fadeIn">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div>
              <h3 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">Attendant Node Configuration</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time status loops for active physical pumping personnel deployment.</p>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-left text-xs min-w-[600px]">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th class="p-4">Node ID</th>
                    <th class="p-4">Staff Name</th>
                    <th class="p-4">Nozzle Product Segment</th>
                    <th class="p-4">Active Windows</th>
                    <th class="p-4">Compliance Metric</th>
                    <th class="p-4 text-right">Status State</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  <tr v-for="staff in staffLogs" :key="staff.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="p-4 font-mono font-bold text-orange-600">{{ staff.id }}</td>
                    <td class="p-4 font-bold text-slate-900 dark:text-white">{{ staff.name }}</td>
                    <td class="p-4"><span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">{{ staff.nozzle }}</span></td>
                    <td class="p-4 text-slate-500 dark:text-slate-400">{{ staff.shift }}</td>
                    <td class="p-4 font-mono font-bold text-emerald-600">{{ staff.compliance }}</td>
                    <td class="p-4 text-right">
                      <span :class="staff.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {{ staff.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="staffLogs.length === 0">
                    <td colspan="6" class="p-8 text-center text-slate-400 font-medium">No live deployment logs active in system matrix.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="currentModule === 'financial'" class="space-y-6 animate-fadeIn">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Expected Cash Aggregates</span>
              <h4 class="text-2xl font-black text-slate-900 dark:text-white mt-2">₦{{ totalExpected.toLocaleString() }}</h4>
            </div>
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Physical Drop Submissions</span>
              <h4 class="text-2xl font-black text-slate-900 dark:text-white mt-2">₦{{ totalReceived.toLocaleString() }}</h4>
            </div>
            <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm border-l-4" :class="totalVariance >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'">
              <span class="text-[10px] font-black uppercase tracking-widest block" :class="totalVariance >= 0 ? 'text-emerald-500' : 'text-rose-500'">Net Variance Balance</span>
              <h4 class="text-2xl font-black mt-2 font-mono" :class="totalVariance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                {{ totalVariance >= 0 ? '+' : '' }}₦{{ totalVariance.toLocaleString() }}
              </h4>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Active Shift Cash Handling Entries</div>
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              <div v-for="drop in financialDrops" :key="drop.id" class="p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <h5 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {{ drop.node }} <span class="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-500 font-black uppercase tracking-wider">{{ drop.type }}</span>
                  </h5>
                  <p class="text-[10px] text-slate-400 font-mono mt-0.5">Reference Verification Tag: #{{ drop.id }}</p>
                </div>
                <div class="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end font-mono">
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-sans">Received</span>
                    <span class="font-bold text-slate-900 dark:text-white">₦{{ drop.amount.toLocaleString() }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-sans">Variance</span>
                    <span :class="drop.variance >= 0 ? 'text-emerald-600' : 'text-rose-600 font-bold'" class="text-[11px]">
                      {{ drop.variance >= 0 ? '+' : '' }}₦{{ drop.variance.toLocaleString() }}
                    </span>
                  </div>
                  <span :class="drop.status === 'Verified' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20' : 'text-rose-700 bg-rose-50 dark:bg-rose-950/20'" class="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    {{ drop.status }}
                  </span>
                </div>
              </div>
              <div v-if="financialDrops.length === 0" class="p-8 text-center text-slate-400 font-medium">No real-time shift transactions registered yet.</div>
            </div>
          </div>
        </div>

        <div v-if="currentModule === 'reports'" class="space-y-6 animate-fadeIn">
          <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div>
              <h3 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">Manager Compliance Sheets</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Transactional metrics compiled into audit compliance blocks.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="report in reportsArchive" :key="report.name" class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div class="flex justify-between items-start">
                <h4 class="font-black text-sm text-slate-900 dark:text-white tracking-tight">{{ report.name }}</h4>
                <span class="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  {{ report.status }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 dark:border-slate-800/60 pt-3">
                <div>
                  <span class="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Total Vol Discharged</span>
                  <span class="font-mono font-bold dark:text-white text-sm">{{ report.volume }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Aggregated Gross Value</span>
                  <span class="font-mono font-bold text-orange-600 text-sm">{{ report.revenue }}</span>
                </div>
              </div>
            </div>
            <div v-if="reportsArchive.length === 0" class="col-span-2 p-8 bg-white dark:bg-slate-900 rounded-2xl text-center text-slate-400 font-medium border border-slate-200/60 dark:border-slate-800">Awaiting transactional records logging input before computing summary blocks.</div>
          </div>
        </div>

        <div v-if="currentModule === 'security'" class="space-y-6 animate-fadeIn">
          <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-2">
            <h3 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">Role-Based Access Boundaries</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              System access mapping values. Attendants interact directly with terminal data input views, while analytical summaries, margins, and financial records remain isolated to administrator clearances.
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Active Credentials System Clearance</div>
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              <div v-for="clearance in securityClearances" :key="clearance.user" class="p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div class="space-y-0.5">
                  <h5 class="font-bold text-slate-900 dark:text-white text-sm">{{ clearance.user }}</h5>
                  <p class="text-orange-600 font-black text-[10px] uppercase tracking-widest">{{ clearance.role }}</p>
                </div>
                <div class="flex flex-wrap gap-4 items-center">
                  <div class="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded border border-slate-200/40 dark:border-slate-700/60">
                    <span class="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Data Access Scope</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-300">{{ clearance.access }}</span>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded border border-slate-200/40 dark:border-slate-700/60">
                    <span class="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Audit Stream Logs</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-300">{{ clearance.logs }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentModule === 'shifts'" class="space-y-6 animate-fadeIn">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div>
              <h3 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">Shift Schedules</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track workforce terminal rosters and nozzle transition handoffs.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="shift in shiftSchedules" :key="shift.attendant" class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
              <div class="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                <Clock class="w-5 h-5" />
              </div>
              <div class="space-y-2 flex-1">
                <div class="flex justify-between items-start">
                  <h4 class="font-bold text-sm text-slate-900 dark:text-white">{{ shift.attendant }}</h4>
                  <span class="text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 px-2 py-0.5 rounded">
                    {{ shift.block }}
                  </span>
                </div>
                <p class="text-xs font-mono text-slate-500 dark:text-slate-400">Duration Block: {{ shift.timeline }}</p>
                <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-1 border-t border-slate-100 dark:border-slate-800">
                  Assigned Platform Deck: <span class="text-slate-700 dark:text-slate-200">{{ shift.station }}</span>
                </div>
              </div>
            </div>
            <div v-if="shiftSchedules.length === 0" class="col-span-2 p-8 text-center text-slate-400 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">No active operational staff accounts found to schedule.</div>
          </div>
        </div>

        <div v-if="currentModule === 'fuel'" class="space-y-6 animate-fadeIn">
          <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <h3 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">Underground Tank Volume Parameters</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time volume metrics mapping gross displacement and low supply triggers.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div v-for="fuel in fuelInventory" :key="fuel.product" class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest block">{{ fuel.product }}</h4>
                <h5 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{{ fuel.current }}</h5>
              </div>

              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div :class="fuel.indicator" class="h-full rounded-full transition-all duration-500" :style="{ width: fuel.pct + '%' }"></div>
              </div>

              <div class="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                <span>Max Shell Cap: {{ fuel.capacity }}</span>
                <span :class="fuel.status === 'Optimal' ? 'text-emerald-600' : 'text-rose-600 font-bold'" class="uppercase tracking-wider text-[10px]">
                  {{ fuel.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>