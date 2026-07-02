<script setup>
import { onMounted } from 'vue'
import Chart from 'chart.js/auto'

onMounted(() => {
  new Chart(document.getElementById('chart'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'Debt', data: [1000, 800, 500] }]
    }
  })
})
</script>

<template>
<canvas id="chart"></canvas>
</template>
