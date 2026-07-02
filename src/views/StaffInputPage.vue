<script setup>
import { ref, reactive, onMounted } from 'vue'
import { auth, db } from '../firebase'
import { collection, addDoc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const fuelTypes = ['PMS (Petrol)', 'AGO (Diesel)', 'DPK (Kerosene)']
const recentSales = ref([])
const activeSubTab = ref('log-form')
const loading = ref(false)

// Safe state containers to prevent crashes if user metadata hasn't fully loaded
const dynamicUserEmail = ref('Fetching profile...')
const currentUid = ref(null)
const currentDisplayName = ref('')

const form = reactive({
  fuelType: 'PMS (Petrol)',
  litersSold: '',
  ratePerLiter: '',
  cashReceived: ''
})

onMounted(() => {
  // Safe listener checks to ensure credentials exist before querying Firestore
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUid.value = user.uid
      dynamicUserEmail.value = user.email || 'Attendant Node'
      currentDisplayName.value = user.displayName || user.email || 'Attendant Node'

      // Initialize real-time sales stream query using the validated session state token
      const q = query(
        collection(db, "sales_logs"),
        where("attendantId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      )
      
      onSnapshot(q, (snap) => {
        recentSales.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      })
    }
  })
})

const submitSale = async () => {
  if(!form.litersSold || !form.ratePerLiter || !form.cashReceived || !currentUid.value) return
  loading.value = true
  
  const expected = parseFloat(form.litersSold) * parseFloat(form.ratePerLiter)
  const actual = parseFloat(form.cashReceived)
  
  try {
    await addDoc(collection(db, "sales_logs"), {
      fuelType: form.fuelType,
      litersSold: parseFloat(form.litersSold),
      ratePerLiter: parseFloat(form.ratePerLiter),
      expectedAmount: expected,
      cashReceived: actual,
      variance: actual - expected,
      attendantId: currentUid.value,
      attendantName: currentDisplayName.value,
      timestamp: new Date().toISOString()
    })
    
    // Reset inputs cleanly
    form.litersSold = ''
    form.ratePerLiter = ''
    form.cashReceived = ''
    
    // Switch over to history records tab to view success entry confirmation instantly
    activeSubTab.value = 'records'
  } catch (e) { 
    console.error("❌ Transmission error processing log package:", e) 
  } finally { 
    loading.value = false 
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 max-w-xl mx-auto flex flex-col space-y-4">
    
    <header class="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-sm">
      <span class="text-[10px] uppercase font-black tracking-widest opacity-75">Active Workplace</span>
      <h2 class="text-xl font-black mt-1">Ilesha S/S Fuel Terminal</h2>
      <p class="text-xs mt-1 text-orange-100 font-medium">Attendant: {{ dynamicUserEmail }}</p>
    </header>

    <div class="flex border-b border-slate-200 text-sm font-bold bg-white rounded-xl p-1 shadow-sm">
      <button 
        @click="activeSubTab = 'log-form'" 
        :class="activeSubTab === 'log-form' ? 'bg-orange-500 text-white' : 'text-slate-500'" 
        class="flex-1 py-2.5 rounded-lg transition-all focus:outline-none"
      >
        ➕ Log Shift Entry
      </button>
      <button 
        @click="activeSubTab = 'records'" 
        :class="activeSubTab === 'records' ? 'bg-orange-500 text-white' : 'text-slate-500'" 
        class="flex-1 py-2.5 rounded-lg transition-all focus:outline-none"
      >
        🕒 View Logs ({{ recentSales.length }})
      </button>
    </div>

    <main class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      
      <form v-if="activeSubTab === 'log-form'" @submit.prevent="submitSale" class="space-y-4">
        <div class="flex flex-col space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">Product Segment</label>
          <select v-model="form.fuelType" class="w-full text-base px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-800">
            <option v-for="t in fuelTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="flex flex-col space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">Liters Volume Discharged</label>
          <input v-model="form.litersSold" type="number" step="0.01" placeholder="0.00" required class="w-full text-base px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium" />
        </div>

        <div class="flex flex-col space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pump Rate (per Liter)</label>
          <input v-model="form.ratePerLiter" type="number" placeholder="₦0.00" required class="w-full text-base px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium" />
        </div>

        <div class="flex flex-col space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Cash Remitted</label>
          <input v-model="form.cashReceived" type="number" placeholder="₦0" required class="w-full text-base px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium" />
        </div>

        <button type="submit" :disabled="loading" class="w-full py-4 bg-orange-500 text-white font-black text-sm rounded-xl hover:bg-orange-600 transition-all uppercase tracking-wider disabled:opacity-50">
          {{ loading ? 'Securing Entry Block...' : 'Submit Transaction Log' }}
        </button>
      </form>

      <div v-else class="space-y-3">
        <div v-if="recentSales.length === 0" class="text-center py-6 text-xs text-slate-400 font-medium">
          No records registered for this terminal station profile shift today.
        </div>
        
        <div v-for="log in recentSales" :key="log.id" class="border border-slate-100 rounded-xl p-3 bg-slate-50/50 text-xs">
          <div class="flex justify-between font-bold mb-1">
            <span class="text-slate-900 font-black">{{ log.fuelType }}</span>
            <span :class="(log.variance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'">
              {{ (log.variance || 0) >= 0 ? '+' : '' }}₦{{ (log.variance || 0).toLocaleString() }}
            </span>
          </div>
          <p class="text-slate-400 font-medium">Liters Pumped: <span class="font-bold text-slate-700">{{ log.litersSold }}L</span></p>
        </div>
      </div>
    </main>
  </div>
</template>