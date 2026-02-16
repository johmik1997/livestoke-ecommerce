<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import OxenCard from "../components/OxenCard.vue";
import ApiService from "@/service/ApiService"; 
import{useAuth} from "@/stores/auth"
const router = useRouter();
const api = new ApiService();
const BASE_URL = "/api";

const activeTab = ref('oxen');
const favorites = ref([]);
const favoriteSellers = ref([]); // You can implement a backend endpoint later

// Replace with actual logged-in user UUID
const auth =useAuth()
  const userUuid = auth.auth?.user?.userUuid;
// Fetch favorite oxen from backend
const fetchFavorites = async () => {
  try {
    const response = await api.addAuthenticationHeader().get(`${BASE_URL}/oxen/favorite`);
    favorites.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch favorite oxen:", error);
  }
};

// Toggle favorite status for an ox
const toggleFavorite = async (ox) => {
  try {
    const response = await api
      .addAuthenticationHeader()
      .put(`${BASE_URL}/oxen/${ox.oxUuid}/favorite/${userUuid}`);
    
    // Update local state
    const updatedOx = response.data;
    const index = favorites.value.findIndex(f => f.oxUuid === updatedOx.oxUuid);
    if (index !== -1) {
      favorites.value[index].favorite = updatedOx.favorite;
    }

  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    alert("Failed to update favorite. Try again.");
  }
};

// Remove from local favorites list
function removeFromFavorites(oxUuid) {
  favorites.value = favorites.value.filter(f => f.oxUuid !== oxUuid);
}

// Seller actions (placeholder, implement backend later)
function removeSeller(id) {
  favoriteSellers.value = favoriteSellers.value.filter(s => s.id !== id);
}

function contactSeller(seller) {
  router.push(`/buyer/messages?seller=${seller.id}`);
}

// Fetch favorites on page load
onMounted(fetchFavorites);
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">My Favorites</h1>
        <p class="text-stone-600">Save oxen and sellers for quick access</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-stone-200 mb-6">
        <button 
          @click="activeTab = 'oxen'"
          :class="[
            'px-4 py-2 font-medium transition-colors relative',
            activeTab === 'oxen' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-stone-500 hover:text-stone-700'
          ]"
        >
          Favorite Oxen ({{ favorites.length }})
        </button>
        <button 
          @click="activeTab = 'sellers'"
          :class="[
            'px-4 py-2 font-medium transition-colors relative',
            activeTab === 'sellers' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-stone-500 hover:text-stone-700'
          ]"
        >
          Favorite Sellers ({{ favoriteSellers.length }})
        </button>
      </div>

      <!-- Favorite Oxen Tab -->
      <div v-if="activeTab === 'oxen'">
        <div v-if="favorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="ox in favorites" :key="ox.oxUuid" class="relative">
            <OxenCard 
              :ox="ox"
              :userUuid="userUuid"
              @click="router.push(`/buyer/oxen/${ox.oxUuid}`)"
              @favorite="toggleFavorite"
            />
            <button 
              @click="removeFromFavorites(ox.oxUuid)"
              class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-md flex items-center justify-center hover:bg-red-600 transition-colors z-10"
            >
              ✕
            </button>
          </div>
        </div>
        <div v-else class="text-center py-16 bg-white rounded-xl">
          <span class="text-6xl block mb-4">🤍</span>
          <h3 class="text-xl font-medium text-stone-800 mb-2">No favorites yet</h3>
          <p class="text-stone-500 mb-6">Start browsing and save oxen you're interested in</p>
          <router-link 
            to="/buyer/browse" 
            class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Browse Oxen
          </router-link>
        </div>
      </div>

      <!-- Favorite Sellers Tab -->
      <div v-if="activeTab === 'sellers'">
        <div v-if="favoriteSellers.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="seller in favoriteSellers" :key="seller.id" class="bg-white rounded-xl shadow-md p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl">🏠</span>
                </div>
                <div>
                  <h3 class="font-semibold text-stone-800">{{ seller.name }}</h3>
                  <p class="text-sm text-stone-500">{{ seller.location }}</p>
                </div>
              </div>
              <button 
                @click="removeSeller(seller.id)"
                class="text-stone-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center p-2 bg-stone-50 rounded">
                <p class="text-sm text-stone-500">Rating</p>
                <p class="font-bold text-amber-600">★ {{ seller.rating }}</p>
              </div>
              <div class="text-center p-2 bg-stone-50 rounded">
                <p class="text-sm text-stone-500">Oxen</p>
                <p class="font-bold text-stone-800">{{ seller.totalOxen }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button 
                @click="router.push(`/buyer/browse?seller=${seller.id}`)"
                class="flex-1 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50"
              >
                View Oxen
              </button>
              <button 
                @click="contactSeller(seller)"
                class="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16 bg-white rounded-xl">
          <span class="text-6xl block mb-4">🤝</span>
          <h3 class="text-xl font-medium text-stone-800 mb-2">No favorite sellers</h3>
          <p class="text-stone-500 mb-6">Save trusted sellers for quick access</p>
          <router-link 
            to="/buyer/browse" 
            class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Find Sellers
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
