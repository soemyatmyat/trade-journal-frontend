import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia' 
import App from './App.vue' // import the root component App from a single-file component.
import router from './router'
import 'primevue/resources/themes/lara-dark-teal/theme.css'
import 'primeflex/primeflex.css';
import PrimeVue from 'primevue/config';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ProgressSpinner from 'primevue/progressspinner';

const app = createApp(App)
app.use(createPinia())  // install pinia as state management
app.use(router) // install router
app.use(PrimeVue, { ripple: true }) // install & enable ripple effect
app.use(ToastService); // install toast service
app.component('ProgressSpinner',ProgressSpinner); // register spinner 
app.component('Toast', Toast);
app.mount('#app')


//import 'primevue/resources/themes/saga-blue/theme.css'; // theme style
// import 'primevue/resources/primevue.min.css'; // core css
// //import 'primeicons/primeicons.css'; // icons
//import "bootstrap/dist/css/bootstrap.min.css"
// import "bootstrap"