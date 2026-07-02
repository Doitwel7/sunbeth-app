<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth, db } from '../firebase'
import { useRouter } from 'vue-router'
import { 
  collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc 
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const router = useRouter()
const transactions = ref([])
const loading = ref(true)

// --- Dynamic Calculations ---
const stats = computed(() => {
  const paid = transactions.value.filter(t => t.status === 'Paid')
  const pending = transactions.value.filter(t => t.status === 'Pending')
  
  return {
    totalRecovered: paid.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    pendingAmount: pending.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    completionRate: transactions.value.length 
      ? Math.round((paid.length / transactions.value.length) * 100) 
      : 0
  }
})

// --- Data Initialization ---
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(
        collection(db, "loans"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      )
      
      onSnapshot(q, (snapshot) => {
        transactions.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        loading.value = false
      }, (err) => {
        console.error("Firestore Error:", err)
        loading.value = false
      })
    } else {
      router.push('/login')
    }
  })
})

// --- Database Actions ---
const markAsPaid = async (loanId) => {
  try {
    const loanRef = doc(db, "loans", loanId)
    await updateDoc(loanRef, { status: 'Paid' })
  } catch (err) {
    console.error(err)
  }
}

const deleteLoan = async (id) => {
  if (confirm("Delete this transaction permanently?")) {
    try {
      await deleteDoc(doc(db, "loans", id))
    } catch (err) {
      alert("Delete failed")
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12 font-sans selection:bg-indigo-100">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <header class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div class="space-y-2">
          <button @click="router.push('/dashboard')" class="group flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-widest hover:gap-3 transition-all">
            <span>&larr;</span> BACK TO DASHBOARD
          </button>
          <div class="flex items-center gap-4">
            <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Ledger</h1>
            <div class="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              Live Sync
            </div>
          </div>
          <p class="text-slate-500 font-medium">Monitoring {{ transactions.length }} active credit facilities.</p>
        </div>

        <div class="flex flex-wrap gap-4">
          <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm min-w-[200px]">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Recovered</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              ${{ stats.totalRecovered.toLocaleString() }}
            </p>
          </div>
          <div class="bg-indigo-600 p-6 rounded-[2rem] shadow-2xl shadow-indigo-200 dark:shadow-none min-w-[200px]">
            <p class="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Outstanding</p>
            <p class="text-3xl font-black text-white tabular-nums">
              ${{ stats.pendingAmount.toLocaleString() }}
            </p>
          </div>
        </div>
      </header>

      <div class="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        
        <div class="h-2 w-full bg-slate-100 dark:bg-slate-800">
          <div 
            class="h-full bg-indigo-600 transition-all duration-1000 ease-out" 
            :style="{ width: stats.completionRate + '%' }"
          ></div>
        </div>

        <div class="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h2 class="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em]">Active Portfolios</h2>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-lg">
              {{ stats.completionRate }}% COLLECTION RATE
            </span>
          </div>
        </div>

        <div v-if="!loading && transactions.length > 0" class="divide-y divide-slate-50 dark:divide-slate-800">
          <div 
            v-for="loan in transactions" 
            :key="loan.id" 
            class="group p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-default"
          >
            
            <div class="flex items-center gap-6">
              <div class="w-14 h-14 rounded-[1.25rem] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-black text-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                {{ loan.clientName?.charAt(0).toUpperCase() }}
              </div>
              
              <div>
                <p class="text-lg font-black text-slate-900 dark:text-white">{{ loan.clientName }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due {{ loan.dueDate || 'No Date' }}</span>
                  <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span 
                    class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                    :class="loan.status === 'Paid' ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'"
                  >
                    {{ loan.status }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-10 mt-6 sm:mt-0">
              <div class="text-left sm:text-right">
                <p class="text-xs font-bold text-slate-400 uppercase mb-1">Principal</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                  ${{ Number(loan.amount).toLocaleString() }}
                </p>
              </div>

              <div class="flex items-center gap-3">
                <button 
                  v-if="loan.status === 'Pending'"
                  @click="markAsPaid(loan.id)"
                  class="sm:opacity-0 group-hover:opacity-100 transition-all bg-green-500 text-white text-[10px] font-black px-5 py-3 rounded-2xl shadow-xl shadow-green-200 dark:shadow-none hover:bg-green-600 active:scale-95"
                >
                  SET PAID
                </button>
                
                <button 
                  @click="deleteLoan(loan.id)"
                  class="sm:opacity-0 group-hover:opacity-100 transition-all bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-5 py-3 rounded-2xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
                >
                  DELETE
                </button>

                <div v-if="loan.status === 'Paid'" class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
                  ✓
                </div>
              </div>
            </div>

          </div>
        </div>

        <div v-else class="py-40 text-center">
          <div v-if="loading" class="flex flex-col items-center gap-4">
            <div class="animate-spin h-12 w-12 border-[6px] border-indigo-600 border-t-transparent rounded-full"></div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Securing Data...</p>
          </div>
          <div v-else class="max-w-sm mx-auto space-y-6 px-6">
            <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-3xl">
              📂
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-black text-slate-900 dark:text-white">Empty Pipeline</h3>
              <p class="text-slate-500 text-sm leading-relaxed">No financial transactions detected. New entries from your dashboard will automatically populate this ledger.</p>
            </div>
            <button @click="router.push('/dashboard')" class="bg-indigo-600 text-white text-xs font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
              CREATE FIRST LOAN
            </button>
          </div>
        </div>
      </div>
      
      <footer class="text-center pb-12">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Encrypted Financial Ledger &copy; 2026</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Optional: Smooth transition for hover effects */
.group:hover {
  transform: translateY(-1px);
}
</style>