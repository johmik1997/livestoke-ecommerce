
const BrowseOxen = () => import('@/features/buyer/pages/BrowseOxen.vue');
const OxDetail = () => import('@/features/buyer/pages/OxenDetails.vue');
const Favorite = () => import('@/features/buyer/pages/MyFavorites.vue');
const MyOrder = () => import('@/features/buyer/pages/MyOrders.vue');
const OrderTracking = () => import('@/features/buyer/pages/OrderTracking.vue');
const SellerProfile = () => import('@/features/buyer/pages/SellerInfoCard.vue');
const Checkout = () => import('@/features/buyer/pages/Checkout.vue');


export default[
      // Buyer routes
          { 
            path: "/buyer/browse", 
            name: "browse-oxen", 
            component: BrowseOxen, 
              meta: { requiresAuth: true, privileges: ['access_buyer'] } 

          },
          { 
            path: "/buyer/oxen/:id", 
            name: "ox-detail",
            component: OxDetail,
  meta: { requiresAuth: true, privileges: ['access_buyer'] } 
          },
          { 
            path: "/buyer/favorites", 
            name: "favorites", 
            component: Favorite,
  meta: { requiresAuth: true, privileges: ['access_buyer'] } 
          },
          { 
            path: "/buyer/orders", 
            name: "my-orders",  // Changed from "order" to avoid confusion
            component: MyOrder, 
  meta: { requiresAuth: true, privileges: ['access_buyer'] } 
          },
          { 
            path: "/buyer/orders/tracking",  // This is the list view
            name: "order-tracking-list", 
            component: OrderTracking,
  meta: { requiresAuth: true, privileges: ['access_buyer'] } 
          },
          { 
            path: "/buyer/orders/:id/track",  // This is for tracking a specific order
            name: "order-tracking-detail", 
            component: OrderTracking,
  meta: { requiresAuth: true, privileges: ['access_buyer'] } 
          },
          { 
      path: "/buyer/checkout", 
      name: "checkout", 
      component: Checkout,
  meta: { requiresAuth: true, privileges: ['access_buyer'] } 
    },
          { 
            path: "/buyer/sellers/:id", 
            name: "seller-profile", 
            component: SellerProfile,
  meta: { requiresAuth: true, privileges: ['access_buyer'] } 
          },
]