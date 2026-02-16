<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/stores/auth";
import { toasted } from "@/utils/utils";
import ApiService from "@/service/ApiService";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const api = new ApiService();
const BASE_URL = "/api/oxen";

const ox = ref(null);
const loading = ref(true);
const activeImageIndex = ref(0);
const quantity = ref(1);
const showContactModal = ref(false);
const showOrderModal = ref(false);

// Fetch ox data from backend using oxUuid
const fetchOxDetails = async () => {
  loading.value = true;
  try {
    const oxUuid = route.params.id; // Get oxUuid from route params
    const response = await api.addAuthenticationHeader().get(`${BASE_URL}/${oxUuid}`);
    
    // Transform backend data to match frontend format
    const oxData = response.data;
    ox.value = {
      id: oxData.oxUuid,
      oxUuid: oxData.oxUuid,
      name: oxData.name,
      breed: oxData.breed,
      age: oxData.age,
      weight: oxData.weight,
      height: oxData.height,
      color: oxData.color,
      price: oxData.price,
      location: oxData.location,
      description: oxData.description,
      healthCertified: oxData.healthCertified || false,
      vaccinated: oxData.vaccinated || false,
      dewormed: oxData.dewormed || false,
      bodyCondition: oxData.bodyCondition,
      sellerName:oxData.sellerName,
      sellerUuid:oxData.sellerUuid,
      seller: {
        id: oxData.sellerId || oxData.createdBy,
        name: oxData.sellerName || "Unknown Seller",
        rating: oxData.sellerRating || 4.5,
        totalSales: oxData.sellerTotalSales || 0,
        verified: oxData.sellerVerified || false,
        phone: oxData.sellerPhone || "+251 XXX XXX XXX",
        email: oxData.sellerEmail || "seller@example.com",
        joinedDate: oxData.sellerJoinedDate || "2024-01-01"
      },
      images: oxData.images || (oxData.pictures?.map(p => p.imageUrl) || []),
      specifications: {
        hornSize: oxData.hornSize || "Medium",
        bodyCondition: oxData.bodyCondition || "Good",
        breedingHistory: oxData.breedingHistory || "Available",
        temperament: oxData.temperament || "Calm"
      },
      status: oxData.status || "ACTIVE"
    };
    
  } catch (error) {
    console.error("Error fetching ox details:", error);
    toasted(false, "Failed to load ox details");
  } finally {
    loading.value = false;
  }
};

// Load data on mount
onMounted(() => {
  fetchOxDetails();
});

// Add to favorites
async function addToFavorites() {
  if (!auth.auth?.accessToken) {
    toasted(false, "Please login to add to favorites");
    router.push(`/login?redirect=${route.path}`);
    return;
  }
  
  try {
    // You'll need to implement this endpoint
    // await api.addAuthenticationHeader().post("/api/favorites", { oxUuid: ox.value.oxUuid });
    toasted(true, "Added to favorites");
  } catch (error) {
    console.error("Error adding to favorites:", error);
    toasted(false, "Failed to add to favorites");
  }
}

// Contact seller
function contactSeller() {
  if (!auth.auth?.accessToken) {
    toasted(false, "Please login to contact seller");
    router.push(`/login?redirect=${route.path}`);
    return;
  }
  showContactModal.value = true;
}

// Make offer / Buy now
async function makeOffer() {
  if (!auth.auth?.accessToken) {
    toasted(false, "Please login to make an offer");
    router.push(`/login?redirect=${route.path}`);
    return;
  }
  
   router.push({
    path: '/buyer/checkout',
    query: {
      ox: ox.value.id,
      quantity: quantity.value
    }
  });
}

// Place order
async function placeOrder() {
  try {
    const orderData = {
      oxUuid: ox.value.oxUuid, // Send oxUuid, not numeric ID
      quantity: quantity.value,
      totalAmount: ox.value.price * quantity.value
    };
    
    // You'll need to implement this endpoint
    // const response = await api.addAuthenticationHeader().post("/api/orders", orderData);
    
    console.log("Placing order:", orderData);
    toasted(true, "Order placed successfully!");
    showOrderModal.value = false;
    
    // Redirect to order tracking
    router.push("/buyer/orders");
  } catch (error) {
    console.error("Error placing order:", error);
    toasted(false, "Failed to place order");
  }
}

// View seller profile
function viewSellerProfile() {
  router.push(`/buyer/sellers/${ox.value.sellerUuid}`);
}

// Request info
async function requestInfo() {
  if (!auth.auth?.accessToken) {
    toasted(false, "Please login to request info");
    router.push(`/login?redirect=${route.path}`);
    return;
  }
  
  try {
    // You'll need to implement this endpoint
    // await api.addAuthenticationHeader().post("/api/info-requests", { oxUuid: ox.value.oxUuid });
    toasted(true, "Info request sent to seller");
  } catch (error) {
    console.error("Error sending info request:", error);
    toasted(false, "Failed to send request");
  }
}

// Send message to seller
async function sendMessage() {
  try {
    // You'll need to implement this endpoint
    // await api.addAuthenticationHeader().post("/api/messages", { 
    //   sellerId: ox.value.seller.id,
    //   message: "I'm interested in your ox"
    // });
    toasted(true, "Message sent to seller");
    showContactModal.value = false;
  } catch (error) {
    console.error("Error sending message:", error);
    toasted(false, "Failed to send message");
  }
}

// Computed property for total price
const totalPrice = computed(() => {
  return (ox.value?.price || 0) * quantity.value;
});

// Format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
</script>

<template>
  <div v-if="loading" class="min-h-screen bg-stone-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      <p class="text-stone-600 mt-4">Loading ox details...</p>
    </div>
  </div>

  <div v-else-if="ox" class="min-h-screen bg-stone-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6 text-sm">
        <router-link to="/buyer/browse" class="text-stone-500 hover:text-amber-600">Browse</router-link>
        <span class="mx-2 text-stone-400">›</span>
        <router-link :to="`/buyer/browse?breed=${ox.breed}`" class="text-stone-500 hover:text-amber-600">{{ ox.breed }}</router-link>
        <span class="mx-2 text-stone-400">›</span>
        <span class="text-stone-800">{{ ox.name }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Images -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-md overflow-hidden mb-4">
            <!-- Main Image -->
            <div class="aspect-square bg-stone-100 flex items-center justify-center p-12">
              <img 
                v-if="ox.images && ox.images.length > 0" 
                :src="ox.images[activeImageIndex] || ox.images[0]" 
                :alt="ox.name"
                class="w-full h-full object-contain"
              />
              <span v-else class="text-8xl">🐂</span>
            </div>
          </div>

          <!-- Thumbnails -->
          <div v-if="ox.images && ox.images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
            <div 
              v-for="(img, index) in ox.images" 
              :key="index"
              @click="activeImageIndex = index"
              :class="[
                'w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center cursor-pointer border-2 overflow-hidden',
                activeImageIndex === index ? 'border-amber-600' : 'border-transparent'
              ]"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Right Column - Details -->
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h1 class="text-2xl font-serif text-stone-800 mb-2">{{ ox.name }}</h1>
            <div class="flex items-center gap-2 mb-4">
              <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">{{ ox.breed }}</span>
              <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">📍 {{ ox.location }}</span>
              <span v-if="ox.status === 'ACTIVE'" class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
              <span v-else class="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs">{{ ox.status }}</span>
            </div>

            <div class="flex justify-between items-center mb-6">
              <div>
                <p class="text-sm text-stone-500">Price</p>
                <p class="text-3xl font-bold text-amber-600">{{ ox.price?.toLocaleString() }} ETB</p>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="addToFavorites"
                  class="w-10 h-10 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                  title="Add to favorites"
                >
                  ❤️
                </button>
                <button 
                  @click="contactSeller"
                  class="w-10 h-10 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                  title="Contact seller"
                >
                  💬
                </button>
              </div>
            </div>

            <!-- Specifications Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-stone-50 p-3 rounded-lg">
                <p class="text-xs text-stone-500">Age</p>
                <p class="font-medium">{{ ox.age || 'N/A' }}</p>
              </div>
              <div class="bg-stone-50 p-3 rounded-lg">
                <p class="text-xs text-stone-500">Weight</p>
                <p class="font-medium">{{ ox.weight || 'N/A' }}Kg</p>
              </div>
              <div class="bg-stone-50 p-3 rounded-lg">
                <p class="text-xs text-stone-500">Height</p>
                <p class="font-medium">{{ ox.height || 'N/A' }}</p>
              </div>
              <div class="bg-stone-50 p-3 rounded-lg">
                <p class="text-xs text-stone-500">Color</p>
                <p class="font-medium">{{ ox.color || 'N/A' }}</p>
              </div>
              <div class="bg-stone-50 p-3 rounded-lg">
                <p class="text-xs text-stone-500">Body Condition</p>
                <p class="font-medium">{{ ox.bodyCondition || 'N/A' }}</p>
              </div>
             
            </div>

            <!-- Health Badges -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span v-if="ox.healthCertified" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                ✅ Health Certified
              </span>
              <span v-if="ox.vaccinated" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                💉 Vaccinated
              </span>
              <span v-if="ox.dewormed" class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                🩺 Dewormed
              </span>
            </div>

            <!-- Description -->
            <div class="border-t border-stone-200 pt-6">
              <h3 class="font-medium text-stone-800 mb-2">Description</h3>
              <p class="text-stone-600">{{ ox.description || 'No description provided.' }}</p>
            </div>
          </div>

          <!-- Seller Info -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h3 class="font-medium text-stone-800 mb-4">Seller Information</h3>
            
            <div class="flex items-start gap-4 mb-4">
              <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <span class="text-3xl">🏠</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-semibold text-stone-800">{{ ox.sellerName }}</h4>
                  <span v-if="ox.seller.verified" class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Verified</span>
                </div>
                <p class="text-sm text-stone-500 mb-1">★ {{ ox.seller.rating }} ({{ ox.seller.totalSales }} sales)</p>
                <p class="text-sm text-stone-500">Member since {{ formatDate(ox.seller.joinedDate) }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button 
                @click="viewSellerProfile"
                class="flex-1 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
              >
                View Profile
              </button>
              <button 
                @click="contactSeller"
                class="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          <!-- Purchase Actions -->
          <div v-if="ox.status === 'ACTIVE'" class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center gap-4 mb-4">
              <label class="text-sm text-stone-600">Quantity:</label>
              <select 
                v-model="quantity"
                class="px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
              </select>
              <span class="text-sm text-stone-500 ml-auto">
                Total: <span class="font-bold text-amber-600">{{ totalPrice.toLocaleString() }} ETB</span>
              </span>
            </div>

            <div class="flex gap-3">
              <button 
                @click="makeOffer"
                class="flex-1 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors"
              >
                Buy Now
              </button>
              <button 
                @click="requestInfo"
                class="flex-1 py-3 border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 font-medium transition-colors"
              >
                Request Info
              </button>
            </div>
          </div>

          <!-- Inactive Status Message -->
          <div v-else class="bg-white rounded-xl shadow-md p-6 text-center">
            <p class="text-stone-500">This ox is no longer available for purchase.</p>
            <p class="text-sm text-stone-400 mt-2">Status: {{ ox.status }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <div v-if="showContactModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h3 class="text-xl font-serif text-stone-800 mb-4">Contact Seller</h3>
        
        <div class="space-y-4 mb-6">
          <div class="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <span class="text-xl">📞</span>
            <div>
              <p class="text-sm text-stone-500">Phone</p>
              <p class="font-medium">{{ ox.seller.phone }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <span class="text-xl">✉️</span>
            <div>
              <p class="text-sm text-stone-500">Email</p>
              <p class="font-medium">{{ ox.seller.email }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button 
            @click="showContactModal = false"
            class="flex-1 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Close
          </button>
          <button 
            @click="sendMessage"
            class="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>

    <!-- Order Confirmation Modal -->
    <div v-if="showOrderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h3 class="text-xl font-serif text-stone-800 mb-4">Confirm Order</h3>
        
        <div class="space-y-4 mb-6">
          <div class="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
            <span class="text-stone-600">Ox:</span>
            <span class="font-medium">{{ ox.name }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
            <span class="text-stone-600">Quantity:</span>
            <span class="font-medium">{{ quantity }}</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
            <span class="text-stone-600">Price per ox:</span>
            <span class="font-medium">{{ ox.price?.toLocaleString() }} ETB</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span class="font-medium text-stone-800">Total:</span>
            <span class="font-bold text-amber-600 text-xl">{{ totalPrice.toLocaleString() }} ETB</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button 
            @click="showOrderModal = false"
            class="flex-1 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="placeOrder"
            class="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Not Found State -->
  <div v-else class="min-h-screen bg-stone-50 flex items-center justify-center">
    <div class="text-center">
      <span class="text-6xl block mb-4">🐂</span>
      <h2 class="text-2xl font-serif text-stone-800 mb-2">Ox Not Found</h2>
      <p class="text-stone-500 mb-6">The ox you're looking for doesn't exist or has been removed.</p>
      <router-link to="/buyer/browse" class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
        Browse Oxen
      </router-link>
    </div>
  </div>
</template>