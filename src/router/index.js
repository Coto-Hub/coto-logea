import { createRouter, createWebHistory } from 'vue-router'
import { state } from "@/socket";
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/menus',
      name: 'menus',
      component: () => import('../views/MenusView.vue')
    },
    {
      path: '/residents',
      name: 'residents',
      component: () => import('../views/ResidentsView.vue')
    },
    {
      path: '/menus/:id/today',
      name: 'today',
      component: () => import('../views/TodayView.vue')
    }
  ]
});

router.beforeEach(async (to) => {
  const publicPages = ['/', '/menus/:id/today'];
  const authRequired = !publicPages.includes((to.matched && to.matched[0]) ? to.matched[0].path : to.path);

  if (authRequired && !(state.company && state.company.id)) {
    // auth.returnUrl = to.fullPath;
    return '/';
  }
});

export default router
