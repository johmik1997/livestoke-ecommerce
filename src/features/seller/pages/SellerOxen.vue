<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { toasted } from "@/utils/utils";
import ApiService from "@/service/ApiService";

const { t, locale } = useI18n();
const router = useRouter();
const api = new ApiService();
const BASE_URL = "/api/oxen";

const oxen = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const statusFilter = ref("all");

// Fetch oxen from backend
const fetchOxen = async () => {
  loading.value = true;
  try {
    const response = await api.addAuthenticationHeader().get(BASE_URL);
    console.log("API Response:", response.data); // For debugging
    
    // Transform backend data to match frontend format
    oxen.value = response.data.map(ox => ({
      id: ox.oxUuid, // Store UUID as id for easier access
      oxUuid: ox.oxUuid, // Also keep original for clarity
      name: ox.name,
      breed: ox.breed,
      age: ox.age,
      price: ox.price,
      status: ox.status || "ACTIVE",
      views: ox.views || Math.floor(Math.random() * 500),
      inquiries: ox.inquiries || Math.floor(Math.random() * 30),
      addedDate: ox.createdAt ? new Date(ox.createdAt).toLocaleDateString(locale.value === 'am' ? 'et' : 'en-CA') : new Date().toLocaleDateString(locale.value === 'am' ? 'et' : 'en-CA'),
      imageUrl: ox.images?.[0] || (ox.pictures?.[0]?.imageUrl) || null
    }));
  } catch (error) {
    console.error("Error fetching oxen:", error);
    toasted(false, t('oxen.messages.loadError'));
  } finally {
    loading.value = false;
  }
};

// Load data on mount
onMounted(() => {
  fetchOxen();
});

// Filtered oxen based on search and status
const filteredOxen = computed(() => {
  return oxen.value.filter(ox => {
    const matchesSearch = ox.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         ox.breed?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === "all" || ox.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

// Navigation functions
function editOx(id) {
  router.push(`/seller/oxen/edit/${id}`);
}

function viewOx(id) {
  router.push(`/buyer/oxen/${id}`);
}

// Delete ox function
async function deleteOx(id) {
  if (!confirm(t('oxen.messages.deleteConfirm'))) return;
  
  try {
    await api.addAuthenticationHeader().delete(`${BASE_URL}/${id}`);
    // Remove from local state
    oxen.value = oxen.value.filter(ox => ox.id !== id);
    toasted(true, t('oxen.messages.deleteSuccess'));
  } catch (error) {
    console.error("Error deleting ox:", error);
    toasted(false, t('oxen.messages.deleteError'));
  }
}

// Get status color class
function getStatusColor(status) {
  switch(status?.toUpperCase()) {
    case 'ACTIVE': return 'bg-green-100 text-green-700';
    case 'SOLD': return 'bg-blue-100 text-blue-700';
    case 'DRAFT': return 'bg-stone-100 text-stone-700';
    default: return 'bg-stone-100 text-stone-700';
  }
}

// Format status for display
function formatStatus(status) {
  if (!status) return t('oxen.status.active');
  
  const statusKey = status.toLowerCase();
  return t(`oxen.status.${statusKey}`);
}

// Refresh data
function refreshData() {
  fetchOxen();
}

// Format price
const formatPrice = (price) => {
  if (!price) return `0 ${t('oxen.currency')}`;
  return new Intl.NumberFormat(locale.value === 'am' ? 'et' : 'en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
</script>

<template>
  <div class="min-h-screen bg-stone-50" :lang="locale">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-serif text-stone-800 mb-2">{{ t('oxen.title') }}</h1>
          <p class="text-stone-600">{{ t('oxen.subtitle') }}</p>
        </div>
        <div class="flex gap-3">
          <button @click="refreshData" 
                  class="px-4 py-3 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 flex items-center gap-2"
                  :disabled="loading">
            <span class="text-lg" :class="{ 'animate-spin': loading }">🔄</span> 
            {{ loading ? t('common.loading') : t('common.refresh') }}
          </button>
          <router-link to="/seller/oxen/add" 
                       class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
            <span class="text-lg">➕</span> {{ t('oxen.actions.add') }}
          </router-link>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('oxen.filters.searchPlaceholder')"
              class="w-full px-4 py-2 pl-10 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span class="absolute left-3 top-2.5 text-stone-400">🔍</span>
          </div>
          <select v-model="statusFilter" class="px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="all">{{ t('oxen.filters.allStatus') }}</option>
            <option value="ACTIVE">{{ t('oxen.status.active') }}</option>
            <option value="SOLD">{{ t('oxen.status.sold') }}</option>
            <option value="DRAFT">{{ t('oxen.status.draft') }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16 bg-white rounded-xl">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p class="text-stone-600 mt-4">{{ t('oxen.loading') }}</p>
      </div>

      <!-- Oxen Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="ox in filteredOxen" :key="ox.id" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div class="h-48 bg-amber-100 flex items-center justify-center">
            <img v-if="ox.imageUrl" :src="ox.imageUrl" class="w-full h-full object-cover" :alt="ox.name" />
            <span v-else class="text-6xl">🐂</span>
          </div>
          <div class="p-6">
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-semibold text-stone-800">{{ ox.name }}</h3>
              <span :class="['px-2 py-1 rounded-full text-xs', getStatusColor(ox.status)]">
                {{ formatStatus(ox.status) }}
              </span>
            </div>
            
            <p class="text-sm text-stone-500 mb-2">{{ ox.breed }} • {{ ox.age }}</p>
            
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="text-center p-2 bg-stone-50 rounded">
                <p class="text-xs text-stone-500">{{ t('oxen.stats.views') }}</p>
                <p class="font-bold">{{ ox.views }}</p>
              </div>
              <div class="text-center p-2 bg-stone-50 rounded">
                <p class="text-xs text-stone-500">{{ t('oxen.stats.inquiries') }}</p>
                <p class="font-bold">{{ ox.inquiries }}</p>
              </div>
              <div class="text-center p-2 bg-stone-50 rounded">
                <p class="text-xs text-stone-500">{{ t('oxen.stats.price') }}</p>
                <p class="font-bold text-amber-600">{{ formatPrice(ox.price) }}</p>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <p class="text-xs text-stone-400">{{ t('oxen.addedDate') }}: {{ ox.addedDate }}</p>
              <div class="flex gap-2">
                <button @click="viewOx(ox.id)" class="p-2 text-stone-600 hover:text-amber-600 transition-colors" :title="t('oxen.actions.view')">
                  👁️
                </button>
                <button @click="editOx(ox.id)" class="p-2 text-stone-600 hover:text-amber-600 transition-colors" :title="t('oxen.actions.edit')">
                  ✏️
                </button>
                <button @click="deleteOx(ox.id)" class="p-2 text-stone-600 hover:text-red-600 transition-colors" :title="t('oxen.actions.delete')">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredOxen.length === 0" class="text-center py-16 bg-white rounded-xl mt-8">
        <span class="text-6xl block mb-4">🐂</span>
        <h3 class="text-xl font-medium text-stone-800 mb-2">{{ t('oxen.empty.title') }}</h3>
        <p class="text-stone-500 mb-6">
          {{ searchQuery || statusFilter !== 'all' ? t('oxen.empty.adjustFilters') : t('oxen.empty.noListings') }}
        </p>
        <router-link to="/seller/oxen/add" class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          {{ t('oxen.actions.addFirst') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Amharic text support */
:lang(am) {
  font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', sans-serif;
}
</style>