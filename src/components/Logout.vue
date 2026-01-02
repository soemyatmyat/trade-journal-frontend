<template>
  <Button icon="pi pi-sign-out" class="mr-2" label="Exit" @click="handleLogOutSubmit" />
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { logout } from '@/services/api';
  const router = useRouter();
  
  const handleLogOutSubmit = () => {
    // sessionStorage.removeItem("token");
    logout(); // clear the cookies
    router.push('/');
  }
</script>