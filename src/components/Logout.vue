<template>
  <Button icon="pi pi-sign-out" class="mr-2" label="Exit" @click="logOut" />
</template>

<script setup>
  import { useRouter } from 'vue-router';
  const router = useRouter();
  
  const logOut = () => {
    sessionStorage.removeItem("token");
    router.push('/');
  }
</script>