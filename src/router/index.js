import { createRouter, createWebHistory } from "vue-router";
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuth } from '@/stores/auth';

// Lazy-loaded page components
const Dashboard = () => import('@/features/buyer/pages/BuyerDashboard.vue');
const Login = () => import('@/pages/login/Login.vue');
const SignUp = () => import('@/pages/signUp.vue');

// Add this route in the children array

import rolesRoutes from './roles.routes';
import privilagesRoutes from './privilages.routes';
import usersRoutes from './users.routes';
import profileRoutes from './profile.routes';
import BuyerRoute from './buyrer.routes';
import sellerRoute from "./seller.route";

const routes = [
  {
    path: "",
    name: "Root",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "/dashboard", name: "dashboard", component: Dashboard, meta: { requiresAuth: true } },
      
      
      // Include other route modules
      ...rolesRoutes,
      ...privilagesRoutes,
      ...usersRoutes,
      ...profileRoutes,
      ...BuyerRoute,
      ...sellerRoute
    ],
  },
  { path: "/login", name: "Login", component: Login },
  { path: "/signUp", name: "SignUp", component: SignUp },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const auth = useAuth();

  // Try to restore auth from localStorage if not in store
  if (!auth.auth?.accessToken) {
    let detail = localStorage.getItem('userDetail');
    if (detail) {
      try {
        detail = JSON.parse(detail);
        auth.setAuth({
          user: detail,
          accessToken: detail?.token,
        });
      } catch (e) {
        console.error("Failed to parse user detail", e);
      }
    }
  }

  // If going to login and already authenticated, redirect back
  if (to.path == '/login' && auth.auth?.accessToken) {
    return { path: from.path || '/dashboard' };
  }

  // If no authentication and trying to access protected route
  if (!auth.auth?.accessToken && to.meta?.requiresAuth) {
    return {
      path: `/login`,
      query: { redirect: to.path },
    };
  }

  // If route doesn't require auth, allow access
  if (!to.meta?.requiresAuth) {
    return true;
  }

  // Check privileges for authenticated users
  if (
    auth.auth?.user?.privileges?.includes('All Privileges') ||
    auth.auth?.user?.roleName === 'Super Admin'
  ) {
    return true;
  }

  // Role-based access
  if (
    (auth.auth?.user?.roleName && to.meta?.role && 
     auth.auth?.user?.roleName == to.meta?.role) ||
    (!to.meta?.role && !to.meta?.privileges)
  ) {
    return true;
  }

  // Privilege-based access
  const privileges = auth.auth.user?.privileges || [];
  const found = (to.meta?.privileges || []).find((privilege) => {
    return privileges?.includes(`ROLE_${privilege}`);
  });

  if (found) return true;

  return { path: '/forbidden' };
});

export default router;