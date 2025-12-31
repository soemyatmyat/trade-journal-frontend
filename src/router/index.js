import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/services/auth';
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
      component: HomeView, // render home
      meta: { requiresAuth: true }  // after authentication
    },
    {
      path: '/analyze',
      name: 'analysis',
      component: AnalysisView, // todo: check if token is still valid and render ui
    },
    {
      path: '/test',
      name: 'test',
      component: TestView, // to remove laters
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

// global guard
router.beforeEach(async (to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    const auth = useAuthStore(); // Check if there is a token and valid
    if (!auth.accessToken) { // if no token
      // Check if there is a refresh token and try to refresh
      try {
        await auth.refreshToken();
      } catch {
        return next({ name: 'login' }); // redirect to login if refresh fails
      }
    } 
  } 
  return next(); // Continue to next route
});

export default router
