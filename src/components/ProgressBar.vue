<script setup>
const props = defineProps(['paid', 'total'])
const percent = (props.paid / props.total) * 100
</script>

<template>
<div>
  <div class="w-full bg-gray-200 rounded h-3">
    <div class="bg-green-500 h-3 rounded" :style="{ width: percent + '%' }"></div>
  </div>
</div>
</template>