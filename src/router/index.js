import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Accueil',
      },
    },
    {
      path: '/menus',
      name: 'menus',
      component: () => import('../views/MenusView.vue'),
      meta: {
        title: 'Menus',
      },
    },
    {
      path: '/meals',
      name: 'meals',
      component: () => import('../views/MealsView.vue'),
      meta: {
        title: 'Repas',
      },
    },
    {
      path: '/plannings',
      name: 'plannings',
      component: () => import('../views/PlanningsView.vue'),
      meta: {
        title: 'Animations',
      },
    },
    {
      path: '/menus/:id/today',
      name: 'today',
      component: () => import('../views/TodayView.vue'),
      meta: {
        title: 'Menus du jour',
      },
    },
    {
      path: '/export-meals/:period/:date',
      name: 'export-meals',
      component: () => import('../views/ExportMealsView.vue'),
      meta: {
        title: 'Export des repas',
      },
    }
  ]
});

const defaultTitle = 'Logea App';

router.beforeEach((to, from) => {
  if (['/export-meals/:period/:date'].includes((to.matched && to.matched[0]) ? to.matched[0].path : to.path)) {
    document.title = to.meta?.title ? `${to.params.date} - ${to.meta.title} - ${defaultTitle}` : defaultTitle;
  }
  else {
    document.title = to.meta?.title ? `${to.meta.title} - ${defaultTitle}` : defaultTitle;
  }
});

router.afterEach(async (to) => {
  let sessionObjEncrypt = localStorage.getItem("sessionObj");
  const publicPages = ['/', '/menus/:id/today'];
  const authRequired = !publicPages.includes((to.matched && to.matched[0]) ? to.matched[0].path : to.path);

  if (authRequired && !sessionObjEncrypt) {
    router.push('/');
  }
});

export default router
