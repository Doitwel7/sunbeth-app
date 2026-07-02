<script setup>

const cards = [
{ title: "Total Loan", amount: "$15,000" },
{ title: "Total Paid", amount: "$6,500" },
{ title: "Remaining Balance", amount: "$8,500" }
]

</script>

<template>

<div class="grid md:grid-cols-3 gap-6 mb-8">

<div
v-for="card in cards"
:key="card.title"
class="bg-white p-6 rounded shadow"
>

<p class="text-gray-500 text-sm">
{{ card.title }}
</p>

<h2 class="text-2xl font-bold mt-2">
{{ card.amount }}
</h2>

</div>

</div>

</template>