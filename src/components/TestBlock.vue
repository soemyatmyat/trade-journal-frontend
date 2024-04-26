<template>
  <div class="text-center p-3 border-round-sm bg-primary font-bold">{{ title }}</div>
</template> 

<script setup>
  defineProps(['title']) // the prop name is title
</script>