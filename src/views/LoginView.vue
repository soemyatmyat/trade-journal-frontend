<template>
  <div class="grid">
    <div class="col-4 col-offset-4">
      <div class="col-12">
        <div class="text-center p-6 border-round-sm bg-primary font-bold">Trade Journal</div><br><br>
      </div>
        <div class="field col-12">
          <label for="username" class="form-label">Username</label><br>
          <InputText id="username" v-model="username" class="surface-overlay w-full" required /><br>
        </div>
        <div class="field col-12">
          <label for="password" class="form-label">Password</label><br>
          <InputText id="password" v-model="password" type="password" class="surface-overlay w-full" required /><br>
        </div>
        <div class="field col-12">
          <Button @click="handleLoginSubmit" label="Sign In" class="w-full" />
        </div>
        <div class="field col-12">
          <GuestPass />
        </div>
    </div>

  </div>
</template>

<script setup>
  import GuestPass from '@/components/GuestPass.vue'
  // import GuestPass from '@/components/GuestPass.vue';
  import { ref } from 'vue';
  import login from '@/services/authapi';
  import { useRouter } from 'vue-router';
  const username = ref('');
  const password = ref('');
  const router = useRouter();


  const callAuthenticationService = async (payload) => {
    const token = await login(payload);
    // localStorage.setItem('token', token);
    sessionStorage.setItem("token", token);
    router.push('/home');
  }

  const handleLoginSubmit = () => {
    const params = new URLSearchParams();
    params.append('username', username.value);
    params.append('password', password.value);
    callAuthenticationService(params);
  };

</script>
