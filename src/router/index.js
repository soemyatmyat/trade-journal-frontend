import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/services/auth'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import TestView from '../views/TestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView // Render Login
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView, 
      meta: { requiresAuth: true } 
    },
    {
      path: '/analyze',
      name: 'analysis',
      component: AnalysisView, // check if token is still valid and render ui
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    const auth = useAuthStore();
    // Check if the user is authenticated
    if (!auth.isAuthenticated) {
      // Redirect to login page if not authenticated
      next({ name: 'login' });
    } else {
      // Continue to the protected route
      next();
    }
  } else {
    // Continue to other routes
    next();
  }
});

// function isAuthenticated() {
//   // Implement logic to check if the user is authenticated
//   // For example, check if there is a valid authentication token
//   return sessionStorage.getItem('token') !== null;
// }

export default router
