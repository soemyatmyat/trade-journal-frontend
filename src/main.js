import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'primevue/resources/themes/lara-dark-teal/theme.css'
import 'primeflex/primeflex.css';
import PrimeVue from 'primevue/config';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, { ripple: true })
app.use(ToastService);
app.component('Toast', Toast);
app.mount('#app')


//import 'primevue/resources/themes/saga-blue/theme.css'; // theme style
// import 'primevue/resources/primevue.min.css'; // core css
// //import 'primeicons/primeicons.css'; // icons
//import "bootstrap/dist/css/bootstrap.min.css"
// import "bootstrap"