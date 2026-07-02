<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase'
import { doc, getDoc, updateDoc, increment, serverTimestamp, addDoc, collection } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const loanId = route.params.id // Assumes URL is /payment/:id

const loan = ref(null)
const paymentAmount = ref(0)
const processing = ref(false)

onMounted(async () => {
  const docRef = doc(db, "loans", loanId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    loan.value = { id: docSnap.id, ...docSnap.data() }
    paymentAmount.value = loan.value.amount // Default to full balance
  }
})

const handlePayment = async () => {
  if (paymentAmount.value <= 0) return alert("Enter a valid amount")
  
  processing.value = true
  try {
    const loanRef = doc(db, "loans", loanId)
    
    // 1. Update the loan balance
    await updateDoc(loanRef, {
      amount: increment(-paymentAmount.value),
      status: (loan.value.amount - paymentAmount.value <= 0) ? 'Paid' : 'Partial'
    })

    // 2. Record the transaction in a 'payments' collection
    await addDoc(collection(db, "payments"), {
      loanId: loanId,
      amount: paymentAmount.value,
      date: serverTimestamp(),
      clientName: loan.value.clientName
    })

    alert("Payment Successful!")
    router.push('/transactions')
  } catch (e) {
    console.error("Payment error: ", e)
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div v-if="loan" class="max-w-lg mx-auto mt-10 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
    <button @click="router.back()" class="text-slate-400 text-sm mb-6 hover:text-indigo-600 transition-colors">← Back</button>
    
    <h1 class="text-3xl font-black dark:text-white mb-2">Make a Payment</h1>
    <p class="text-slate-500 mb-8">Settling debt for <span class="font-bold text-slate-800 dark:text-slate-200">{{ loan.clientName }}</span></p>

    <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl mb-8">
      <p class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Current Balance</p>
      <p class="text-5xl font-black text-indigo-700 dark:text-indigo-300">${{ loan.amount }}</p>
    </div>

    <div class="space-y-6">
      <div>
        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Amount</label>
        <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
            <input 
                v-model="paymentAmount" 
                type="number" 
                class="w-full pl-10 pr-4 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
        </div>
      </div>

      <button 
        @click="handlePayment" 
        :disabled="processing"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50"
      >
        {{ processing ? 'Processing...' : 'Confirm Payment' }}
      </button>
    </div>
  </div>
  <div v-else class="text-center mt-20 dark:text-white font-bold">Loading payment details...</div>
</template>