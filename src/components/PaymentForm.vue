<script setup>
import { ref } from 'vue'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'

const amount = ref(0)

const addPayment = async () => {
  await addDoc(collection(db, 'payments'), { amount: amount.value })
}
</script>

<template>
<div class="bg-white p-4 rounded shadow">
  <h3 class="font-bold mb-2">Add Payment</h3>
  <input v-model="amount" type="number" class="border p-2 w-full mb-2" />
  <button @click="addPayment" class="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
</div>
</template>
