<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toasted } from "@/utils/utils";

const route = useRoute();
const router = useRouter();
const seller = ref(null);
const sellerOxen = ref([]);
const activeTab = ref("about");

// Sample seller data - in real app, fetch based on route.params.id
const sellerData = {
  id: 101,
  name: "Ethio Cattle Farms",
  logo: "🏠",
  rating: 4.8,
  totalSales: 156,
  verified: true,
  phone: "+251 911 234 567",
  email: "info@ethiocattle.com",
  joinedDate: "2023-01-15",
  location: "Oromia, Ethiopia",
  description: "Ethio Cattle Farms has been providing quality livestock for over 10 years. We specialize in Borana and Sahiwal breeds, ensuring all our animals are health-certified and well-cared for.",
  responseRate: "98%",
  responseTime: "Within 1 hour",
  oxen: [
    {
      id: 1,
      name: "Borana Bull",
      breed: "Borana",
      price: 45000,
      age: "3 years",
      location: "Oromia",
      image: "🐂"
    },
    {
      id: 2,
      name: "Sahiwal Cow",
      breed: "Sahiwal",
      price: 35000,
      age: "2 years",
      location: "Oromia",
      image: "🐄"
    }
  ],
  reviews: [
    {
      id: 1,
      user: "Birhane A.",
      rating: 5,
      date: "2024-02-10",
      comment: "Excellent quality ox, healthy and strong. Delivery was on time."
    },
    {
      id: 2,
      user: "Tigist M.",
      rating: 4,
      date: "2024-02-05",
      comment: "Good communication, very helpful seller."
    }
  ]
};

onMounted(() => {
  const sellerId = route.params.id;
  // In real app: fetch seller data from API
  console.log("Fetching seller with ID:", sellerId);
  seller.value = sellerData;
  sellerOxen.value = sellerData.oxen;
});
// onMounted(() => {
//   const sellerId = route.params.id;
 
//   const response = getPersonalDetails(sellerId)
 
//      seller.value = response.data;
//   sellerOxen.value = sellerData.oxen;
// });


function contactSeller() {
  router.push(`/buyer/messages?seller=${seller.value.id}`);
}

function viewOxDetail(oxId) {
  router.push(`/buyer/oxen/${oxId}`);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function addToFavorites() {
  toasted(true, "Seller added to favorites");
}
</script>

<template>
  <div v-if="seller" class="min-h-screen bg-stone-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6 text-sm">
        <router-link to="/buyer/browse" class="text-stone-500 hover:text-amber-600">Browse</router-link>
        <span class="mx-2 text-stone-400">›</span>
        <router-link to="/buyer/favorites" class="text-stone-500 hover:text-amber-600">Sellers</router-link>
        <span class="mx-2 text-stone-400">›</span>
        <span class="text-stone-800">{{ seller.name }}</span>
      </div>

      <!-- Seller Header -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Logo -->
          <div class="w-24 h-24 bg-amber-100 rounded-2xl flex items-center justify-center text-5xl">
            {{ seller.logo }}
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <h1 class="text-2xl font-serif text-stone-800">{{ seller.name }}</h1>
                  <span v-if="seller.verified" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    ✓ Verified
                  </span>
                </div>
                <p class="text-stone-600 mb-2">📍 {{ seller.location }}</p>
                <div class="flex items-center gap-4 text-sm">
                  <span class="text-stone-600">★ {{ seller.rating }} ({{ seller.totalSales }} sales)</span>
                  <span class="text-stone-600">⏱️ Response: {{ seller.responseTime }}</span>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="addToFavorites"
                  class="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50"
                >
                  ❤️ Save Seller
                </button>
                <button
                  @click="contactSeller"
                  class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-stone-200 mb-6">
        <button
          @click="activeTab = 'about'"
          :class="[
            'px-4 py-2 font-medium text-sm transition-colors',
            activeTab === 'about' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-stone-500 hover:text-stone-700'
          ]"
        >
          About
        </button>
        <button
          @click="activeTab = 'oxen'"
          :class="[
            'px-4 py-2 font-medium text-sm transition-colors',
            activeTab === 'oxen' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-stone-500 hover:text-stone-700'
          ]"
        >
          Oxen for Sale ({{ sellerOxen.length }})
        </button>
        <button
          @click="activeTab = 'reviews'"
          :class="[
            'px-4 py-2 font-medium text-sm transition-colors',
            activeTab === 'reviews' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-stone-500 hover:text-stone-700'
          ]"
        >
          Reviews ({{ seller.reviews.length }})
        </button>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <!-- About Tab -->
        <div v-if="activeTab === 'about'" class="space-y-6">
          <div>
            <h3 class="font-medium text-stone-800 mb-2">About {{ seller.name }}</h3>
            <p class="text-stone-600">{{ seller.description }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-stone-50 p-4 rounded-lg">
              <p class="text-sm text-stone-500 mb-1">Member Since</p>
              <p class="font-medium">{{ formatDate(seller.joinedDate) }}</p>
            </div>
            <div class="bg-stone-50 p-4 rounded-lg">
              <p class="text-sm text-stone-500 mb-1">Response Rate</p>
              <p class="font-medium">{{ seller.responseRate }}</p>
            </div>
            <div class="bg-stone-50 p-4 rounded-lg">
              <p class="text-sm text-stone-500 mb-1">Phone</p>
              <p class="font-medium">{{ seller.phone }}</p>
            </div>
            <div class="bg-stone-50 p-4 rounded-lg">
              <p class="text-sm text-stone-500 mb-1">Email</p>
              <p class="font-medium">{{ seller.email }}</p>
            </div>
          </div>
        </div>

        <!-- Oxen Tab -->
        <div v-if="activeTab === 'oxen'" class="space-y-4">
          <div
            v-for="ox in sellerOxen"
            :key="ox.id"
            class="flex items-center gap-4 p-4 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors"
            @click="viewOxDetail(ox.id)"
          >
            <div class="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center text-3xl">
              {{ ox.image }}
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-stone-800">{{ ox.name }}</h4>
              <p class="text-sm text-stone-500">{{ ox.breed }} • {{ ox.age }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-amber-600">{{ ox.price.toLocaleString() }} ETB</p>
              <p class="text-xs text-stone-500">📍 {{ ox.location }}</p>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="space-y-4">
          <div
            v-for="review in seller.reviews"
            :key="review.id"
            class="p-4 bg-stone-50 rounded-lg"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-medium text-stone-800">{{ review.user }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-amber-600">★ {{ review.rating }}</span>
                  <span class="text-xs text-stone-400">{{ formatDate(review.date) }}</span>
                </div>
              </div>
            </div>
            <p class="text-stone-600 text-sm">{{ review.comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>