<template>
  <div class="grid">
    <div class="col-4 col-offset-4">
      <div class="col-12">
        <div class="col-4 col-offset-4">
        <Image src="/brand-logo.png" alt="trade-journal-logo" width="150" />
        </div>
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
        <div class="field col-12">
          Note: Apologies for the delay in experience with API request processing. Backend is hosted on free server instance which spins down with inactivity. 
        </div>
        <div class="field col-12">
          Also, check out <a href="#" @click="redirectAnalysisPage">historical stock price analysis dashboard</a> to observe price volatility and identify the price patterns for your next move!
        </div>
        <div class="field col-12">
          <InlineMessage v-if="showError" severity="error">{{errMsg}} :(</InlineMessage>
        </div>
    </div>

  </div>
</template>

<script setup>
  import GuestPass from '@/components/GuestPass.vue'
  import { ref } from 'vue';
  import login from '@/services/authapi';
  import { useRouter } from 'vue-router';
  const username = ref('');
  const password = ref('');
  const router = useRouter();
  const showError = ref(false);
  const errMsg = ref('Error logging in. Please try again later.');

  const callAuthenticationService = async (payload) => {
    try {
      const token = await login(payload);
      // localStorage.setItem('token', token);
      sessionStorage.setItem("token", token);
      router.push('/home');
    } catch (error) {
      // axois error: most likely authentication error  
      if (error.response != undefined) {
        if (error.response.data != undefined) {
          if (error.response.data.detail != undefined) {
            errMsg.value = error.response.data.detail;
          }
        }
      }
      
      showError.value = true;

    }
  }

  const handleLoginSubmit = () => {
    const params = new URLSearchParams();
    params.append('username', username.value);
    params.append('password', password.value);
    //showError.value = true;
    callAuthenticationService(params);
  };

  const redirectAnalysisPage = () => {
    router.push('/analyze');
  }


</script>
