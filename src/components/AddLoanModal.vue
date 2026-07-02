<script setup>
import { ref, reactive } from 'vue'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const isVisible = ref(false)
const isSubmitting = ref(false)

// Using reactive for the form state
const form = reactive({
  lender: '',
  amount: null,
  description: '',
  dueDate: ''
})

const resetForm = () => {
  form.lender = ''
  form.amount = null
  form.description = ''
  form.dueDate = ''
}

const addLoan = async () => {
  if (!form.lender || !form.amount) return alert('Please fill in required fields')
  
  isSubmitting.value = true
  try {
    await addDoc(collection(db, 'loans'), {
      ...form,
      amount: Number(form.amount),
      createdAt: serverTimestamp(),
      status: 'pending'
    })
    isVisible.value = false
    resetForm()
  } catch (error) {
    console.error("Error adding document: ", error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <button 
      @click="isVisible = true" 
      class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-lg shadow-indigo-500/20"
    >
      + Add New Loan
    </button>

    <Transition name="fade">
      <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        
        <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          
          <div class="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-white">Create Loan Record</h2>
            <button @click="isVisible = false" class="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1.5">Lender Name</label>
              <input 
                v-model="form.lender" 
                type="text" 
                placeholder="Ex: John Doe / Bank" 
                class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1.5">Amount ($)</label>
              <input 
                v-model="form.amount" 
                type="number" 
                placeholder="0.00" 
                class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1.5">Due Date (Optional)</label>
              <input 
                v-model="form.dueDate" 
                type="date" 
                class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div class="px-6 py-4 bg-slate-800/50 flex flex-col sm:flex-row-reverse gap-3">
            <button 
              @click="addLoan" 
              :disabled="isSubmitting"
              class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-all"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Loan' }}
            </button>
            <button 
              @click="isVisible = false" 
              class="w-full sm:w-auto text-slate-300 hover:bg-slate-700 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

