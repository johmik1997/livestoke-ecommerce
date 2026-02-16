// Add these imports
const SellerDashboard = () => import('@/features/seller/pages/SellerDashboard.vue');
const SellerOxen = () => import('@/features/seller/pages/SellerOxen.vue');
const AddOx = () => import('@/features/seller/pages/AddOx.vue');
const SellerOrders = () => import('@/features/seller/pages/SellerOrder.vue');
// const SellerAnalytics = () => import('@/features/seller/pages/SellerAnalytics.vue');

export default[
{ 
  path: "/seller/dashboard", 
  name: "seller-dashboard", 
  component: SellerDashboard,
  meta: { requiresAuth: true, privileges: ['access_seller'] } 
},
{ 
  path: "/seller/my-oxen", 
  name: "seller-oxen", 
  component: SellerOxen,
  meta: { requiresAuth: true, privileges: ['access_seller'] } 
},
{ 
  path: "/seller/oxen/add", 
  name: "add-ox", 
  component: AddOx,
  meta: { requiresAuth: true, privileges: ['access_seller'] } 
},
{ 
  path: "/seller/oxen/edit/:id", 
  name: "edit-ox", 
  component: AddOx,
  meta: { requiresAuth: true, privileges: ['access_seller'] } 
},
{ 
  path: "/seller/orders", 
  name: "seller-orders", 
  component: SellerOrders,
  meta: { requiresAuth: true, privileges: ['access_seller'] } 
},
// { 
//   path: "/seller/analytics", 
//   name: "seller-analytics", 
//   component: SellerAnalytics,
//   meta: { requiresAuth: true, privileges: ['seller_access'] } 
// },
]