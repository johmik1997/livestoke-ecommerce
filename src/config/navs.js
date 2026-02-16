import icons from "@/utils/icons";

export default [
  // Analytics / Dashboard
  {
    path: "/dashboard",
    icon: icons.dashboard,
    name: "Dashboard",
    type: "Analytics",
    privilage: ['access_buyer'], // Available to all authenticated users
  },
  
  // Buyer Navigation
  {
    path: "/buyer/browse",
    icon: icons.browse || "🔍",
    name: "Browse Oxen",
    type: "Marketplace",
    privilage: ['access_buyer'],
  },
  {
    path: "/buyer/favorites",
    icon: icons.heart || "❤️",
    name: "My Favorites",
    type: "Marketplace",
    privilage: ['access_buyer'],
  },
  {
    path: "/buyer/orders",
    icon: icons.orders || "📦",
    name: "My Orders",
    type: "Marketplace",
    privilage: ['access_buyer'],
  },
  

  // Seller Navigation (if you have seller features)
  {
    path: "/seller/dashboard",
    icon: icons.seller || "🏪",
    name: "Seller Dashboard",
    type: "Seller",
    privilage: ['access_seller'], 
  },
  {
    path: "/seller/my-oxen",
    icon: icons.oxen || "🐂",
    name: "My Oxen",
    type: "Seller",
    privilage: ['access_seller'],
  },
  {
    path: "/seller/add-ox",
    icon: icons.add || "➕",
    name: "Add New Ox",
    type: "Seller",
    privilage: ['access_seller'],
  },
  {
    path: "/seller/orders",
    icon: icons.orders || "📦",
    name: "Seller Orders",
    type: "Seller",
    privilage: ['access_seller'],
  },


  // Payment & Finance
  {
    path: "/payment",
    icon: icons.payment || "💳",
    name: "Payments",
    type: "Finance",
    privilage: [],
    children: [
      {
        path: "/payment/methods",
        name: "Payment Methods",
        privilage: [],
      },
      {
        path: "/payment/transactions",
        name: "Transaction History",
        privilage: [],
      },
      {
        path: "/payment/invoices",
        name: "Invoices",
        privilage: [],
      },
    ],
  },



  // Admin Settings (privilege-protected)
  {
    path: "/users",
    name: "Users",
    icon: icons.users,
    type: "Administration",
    privilage: ['create_user', 'manage_users'],
  },
  {
    path: "/privileges",
    name: "Privileges",
    icon: icons.privilege,
    type: "Administration",
    privilage: ['manage_privileges'],
  },
  {
    path: "/roles",
    name: "Roles",
    icon: icons.role,
    type: "Administration",
    privilage: ['manage_roles'],
  },
];