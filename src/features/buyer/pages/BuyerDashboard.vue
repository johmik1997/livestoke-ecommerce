<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useApiRequest } from "@/composables/useApiRequest";
import { toasted } from "@/utils/utils";
import ApiService from "@/service/ApiService";
import OxenCard from "@/features/buyer/components/OxenCard.vue";
import {useAuth} from "@/stores/auth"

const router = useRouter();
const dashboardReq = useApiRequest();
const api = new ApiService();
const BASE_URL = "/api/oxen";
const auth =useAuth()
  const userUuid = auth.auth?.user?.userUuid;


const oxen = ref([]);
const loading = ref(true);
const sellers = ref([]);
const favorites = ref([]);

// Dashboard Stats - will be computed from actual data
const stats = ref({
  totalOrders: 0,
  activeOrders: 0,
  savedSellers: 0,
  favoriteOxen: 0
});

// Recent Activity - will be populated from backend
const recentActivity = ref([]);

// Fetch oxen from backend
const fetchOxen = async () => {
  loading.value = true;
  try {
    const response = await api.addAuthenticationHeader().get(BASE_URL);
    
    // Transform backend data to match frontend format
    oxen.value = response.data.map(ox => ({
      id: ox.oxUuid,
      oxUuid: ox.oxUuid,
      name: ox.name,
      breed: ox.breed,
      age: ox.age,
      price: ox.price,
      weight: ox.weight,
      location: ox.location,
      description: ox.description,
      healthCertified: ox.healthCertified || false,
      vaccinated: ox.vaccinated || false,
      bodyCondition: ox.bodyCondition,
      seller: ox.sellerName || "Unknown Seller",
      rating: ox.rating || 4.5, // Default if not provided
      imageUrl: ox.images?.[0] || (ox.pictures?.[0]?.imageUrl) || null,
      status: ox.status || "ACTIVE"
    }));

    // Update stats based on fetched data
    updateStats();
    
  } catch (error) {
    console.error("Error fetching oxen:", error);
    toasted(false, "Failed to load listings");
  } finally {
    loading.value = false;
  }
};

// Update dashboard stats based on real data
const updateStats = () => {
  // Count unique sellers
  const uniqueSellers = [...new Set(oxen.value.map(ox => ox.seller))];
  
  stats.value = {
    totalOrders: 24, // This would come from orders API
    activeOrders: 3, // This would come from orders API
    savedSellers: uniqueSellers.length,
    favoriteOxen: favorites.value.length
  };
};

// Fetch favorites (you'll need to implement this endpoint)
const fetchFavorites = async () => {
  try {
    // const response = await api.addAuthenticationHeader().get("/api/favorites");
    // favorites.value = response.data;
    favorites.value = []; // Placeholder until endpoint is ready
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
};

// Fetch recent activity (you'll need to implement this endpoint)
const fetchRecentActivity = async () => {
  try {
    // const response = await api.addAuthenticationHeader().get("/api/activity");
    // recentActivity.value = response.data;
    
    // Mock data until backend is ready
    recentActivity.value = [
      { id: 1, type: 'order', message: 'Order #OX-2024-001 confirmed', time: '2 hours ago', status: 'confirmed' },
      { id: 2, type: 'favorite', message: 'Added 2 Borana oxen to favorites', time: '5 hours ago', status: 'info' },
      { id: 3, type: 'view', message: 'Viewed 15 listings today', time: '1 day ago', status: 'view' }
    ];
  } catch (error) {
    console.error("Error fetching activity:", error);
  }
};

// Filter only active oxen for display
const activeOxen = computed(() => {
  return oxen.value.filter(ox => ox.status === "ACTIVE").slice(0, 4); // Show only first 4
});

const quickActions = [
  { icon: '🔍', label: 'Browse Oxen', route: '/buyer/browse', color: 'bg-blue-500' },
  { icon: '❤️', label: 'Favorites', route: '/buyer/favorites', color: 'bg-red-500' },
  { icon: '📦', label: 'My Orders', route: '/buyer/orders', color: 'bg-green-500' },
];

function navigateTo(route) {
  router.push(route);
}

function viewAll(route) {
  router.push(route);
}

// Handle favorite toggle from card
function handleFavorite(oxId) {
  console.log("Favorite toggled for ox:", oxId);
  // Implement favorite logic here
}

onMounted(() => {
  fetchOxen();
  fetchFavorites();
  fetchRecentActivity();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">Welcome back, Buyer!</h1>
        <p class="text-stone-600">Find the perfect oxen for your farm or business</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-stone-500 mb-1">Active Orders</p>
              <p class="text-3xl font-bold text-stone-800">{{ stats.activeOrders }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span class="text-xl">🔄</span>
            </div>
          </div>
          <p class="text-xs text-stone-500 mt-2">{{ stats.activeOrders }} in progress</p>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-stone-500 mb-1">Saved Sellers</p>
              <p class="text-3xl font-bold text-stone-800">{{ stats.savedSellers }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-xl">🤝</span>
            </div>
          </div>
          <p class="text-xs text-stone-500 mt-2">Active sellers in marketplace</p>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-stone-500 mb-1">Favorite Oxen</p>
              <p class="text-3xl font-bold text-stone-800">{{ stats.favoriteOxen }}</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-xl">❤️</span>
            </div>
          </div>
          <p class="text-xs text-stone-500 mt-2">In your wishlist</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <button 
          v-for="action in quickActions" 
          :key="action.label"
          @click="navigateTo(action.route)"
          class="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-stone-200 text-center group"
        >
          <div class="text-2xl mb-2 group-hover:scale-110 transition-transform">{{ action.icon }}</div>
          <p class="text-sm font-medium text-stone-700">{{ action.label }}</p>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p class="text-stone-600 mt-4">Loading listings...</p>
      </div>

      <!-- Main Content Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - 2/3 width -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Recommended Oxen -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-serif text-stone-800">Recommended for You</h2>
              <button @click="viewAll('/buyer/browse')" class="text-amber-600 hover:text-amber-700 text-sm font-medium">
                View All →
              </button>
            </div>
            
            <div v-if="activeOxen.length === 0" class="text-center py-8">
              <p class="text-stone-500">No oxen available at the moment</p>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OxenCard 
                v-for="ox in activeOxen" 
                :key="ox.id"
                :ox="ox"
               :userUuid="userUuid"
                @click="navigateTo(`/buyer/oxen/${ox.id}`)"
                @favorite="handleFavorite"
              />
            </div>
          </div>
        </div>

        <!-- Right Column - 1/3 width -->
        <div class="space-y-8">
          <!-- Recent Activity -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-serif text-stone-800 mb-4">Recent Activity</h2>
            <div v-if="recentActivity.length === 0" class="text-center py-4">
              <p class="text-stone-400 text-sm">No recent activity</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-sm">{{ 
                    activity.type === 'order' ? '📦' : 
                    activity.type === 'favorite' ? '❤️' : 
                    activity.type === 'seller' ? '🤝' : '👁️' 
                  }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-stone-700">{{ activity.message }}</p>
                  <p class="text-xs text-stone-400">{{ activity.time }}</p>
                </div>
                <span v-if="activity.status === 'confirmed'" class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Confirmed</span>
              </div>
            </div>
            <button class="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium">View all activity →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>