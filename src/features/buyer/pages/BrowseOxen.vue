<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { toasted } from "@/utils/utils";
import ApiService from "@/service/ApiService";
import OxenCard from "../components/OxenCard.vue";
import FilterSidebar from "../components/FilterSidebar.vue";
import {useAuth} from "@/stores/auth"
const router = useRouter();
const api = new ApiService();
const BASE_URL = "/api/oxen";
const auth =useAuth();

  const userUuid = auth.auth?.user?.userUuid;

// State
const oxen = ref([]);
const loading = ref(true);
const viewMode = ref('grid');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 12;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// Filters
const filters = ref({
  breed: [],
  priceRange: [0, 200000],
  age: [],
  location: [],
  healthCertified: false,
  vaccinated: false,
  dewormed: false,
  sortBy: 'newest',
  searchQuery: ''
});

// Available filter options (populated from API)
const breedOptions = ref([]);
const locationOptions = ref([]);
const ageOptions = ref(['<1 year', '1-2 years', '2-3 years', '3-4 years', '4-5 years', '5+ years']);

// Fetch oxen from API with filters
const fetchOxen = async () => {
  loading.value = true;
  
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append('page', currentPage.value - 1); // Backend often uses 0-based pagination
    params.append('size', itemsPerPage);
    
    if (filters.value.searchQuery) {
      params.append('search', filters.value.searchQuery);
    }
    
    if (filters.value.breed.length > 0) {
      params.append('breeds', filters.value.breed.join(','));
    }
    
    if (filters.value.priceRange[0] > 0) {
      params.append('minPrice', filters.value.priceRange[0]);
    }
    
    if (filters.value.priceRange[1] < 200000) {
      params.append('maxPrice', filters.value.priceRange[1]);
    }
    
    if (filters.value.location.length > 0) {
      params.append('locations', filters.value.location.join(','));
    }
    
    if (filters.value.healthCertified) {
      params.append('healthCertified', true);
    }
    
    if (filters.value.vaccinated) {
      params.append('vaccinated', true);
    }
    
    if (filters.value.dewormed) {
      params.append('dewormed', true);
    }
    
    // Sort params
    switch (filters.value.sortBy) {
      case 'price_low':
        params.append('sort', 'price,asc');
        break;
      case 'price_high':
        params.append('sort', 'price,desc');
        break;
      case 'rating':
        params.append('sort', 'rating,desc');
        break;
      default:
        params.append('sort', 'createdAt,desc');
    }
    
    // Make API call
    const response = await api.addAuthenticationHeader().get(`${BASE_URL}?${params.toString()}`);
    
    // Handle paginated response
    if (response.data.content) {
      // Paginated response
      oxen.value = response.data.content.map(transformOxData);
      totalItems.value = response.data.totalElements || response.data.content.length;
    } else if (Array.isArray(response.data)) {
      // Non-paginated response
      oxen.value = response.data.map(transformOxData);
      totalItems.value = response.data.length;
    } else {
      oxen.value = [];
      totalItems.value = 0;
    }
    
  } catch (error) {
    console.error("Error fetching oxen:", error);
    toasted(false, "Failed to load listings");
    oxen.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

// Transform API data to match component props
const transformOxData = (ox) => ({
  id: ox.oxUuid,
  oxUuid: ox.oxUuid,
  name: ox.name || 'Unnamed Ox',
  breed: ox.breed || 'Unknown Breed',
  age: ox.age || 'Age N/A',
  weight: ox.weight || 'Weight N/A',
  price: ox.price || 0,
  location: ox.location || 'Location N/A',
  seller: ox.sellerName || 'Unknown Seller',
  sellerId: ox.createdBy,
  rating: ox.rating || 4.5,
  healthCertified: ox.healthCertified || false,
  vaccinated: ox.vaccinated || false,
  dewormed: ox.dewormed || false,
  bodyCondition: ox.bodyCondition,
  description: ox.description || 'No description available',
  imageUrl: ox.images?.[0] || (ox.pictures?.[0]?.imageUrl) || null,
  status: ox.status || 'ACTIVE'
});

// Fetch filter options (breeds, locations) from API
const fetchFilterOptions = async () => {
  try {
    // You might need separate endpoints for filter options
    // For now, derive from the data
    const response = await api.addAuthenticationHeader().get(`${BASE_URL}?size=100`);
    
    if (response.data.content) {
      const allOxen = response.data.content;
      
      // Extract unique breeds
      breedOptions.value = [...new Set(allOxen.map(ox => ox.breed).filter(Boolean))];
      
      // Extract unique locations
      locationOptions.value = [...new Set(allOxen.map(ox => ox.location).filter(Boolean))];
    }
  } catch (error) {
    console.error("Error fetching filter options:", error);
    // Fallback options
    breedOptions.value = ["Borana", "Ogaden", "Horro", "Fogera", "Sheko", "Afar"];
    locationOptions.value = ["Oromia", "Somali", "Amhara", "Tigray", "Sidama", "SNNPR"];
  }
};

// Watch for filter changes
watch(filters, () => {
  currentPage.value = 1;
  fetchOxen();
}, { deep: true });

// Watch for page changes
watch(currentPage, () => {
  fetchOxen();
});

// Initial load
onMounted(async () => {
  await fetchFilterOptions();
  await fetchOxen();
});

// Update filters
function updateFilters(newFilters) {
  filters.value = { ...filters.value, ...newFilters };
}

// Clear all filters
function clearFilters() {
  filters.value = {
    breed: [],
    priceRange: [0, 200000],
    age: [],
    location: [],
    healthCertified: false,
    vaccinated: false,
    dewormed: false,
    sortBy: 'newest',
    searchQuery: ''
  };
}

// Handle search
function handleSearch() {
  currentPage.value = 1;
  fetchOxen();
}

// Navigate to ox details
function viewOxDetails(id) {
  router.push(`/buyer/oxen/${id}`);
}

// Pagination functions
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// Computed properties
const startItem = computed(() => {
  return ((currentPage.value - 1) * itemsPerPage) + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalItems.value);
});

const showPagination = computed(() => {
  return totalPages.value > 1;
});
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">Browse Oxen</h1>
        <p class="text-stone-600">Find the perfect oxen from verified sellers across Ethiopia</p>
      </div>

      <!-- Search Bar -->
      <div class="mb-6 flex gap-4">
        <div class="flex-1 relative">
          <input 
            v-model="filters.searchQuery"
            type="text" 
            placeholder="Search by name, breed, location, or seller..."
            class="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            @keyup.enter="handleSearch"
          />
          <span class="absolute left-3 top-3 text-stone-400">🔍</span>
        </div>
        <button 
          @click="handleSearch"
          class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Search
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <div class="lg:w-80 flex-shrink-0">
          <FilterSidebar 
            :filters="filters"
            :breed-options="breedOptions"
            :location-options="locationOptions"
            :age-options="ageOptions"
            @update="updateFilters"
            @clear="clearFilters"
          />
        </div>

        <!-- Results -->
        <div class="flex-1">
          <!-- Results Header -->
          <div class="bg-white rounded-lg p-4 mb-6 flex flex-wrap justify-between items-center">
            <p class="text-stone-600">
              <span v-if="loading">Loading...</span>
              <span v-else>
                Showing <span class="font-semibold">{{ startItem }} - {{ endItem }}</span> of 
                <span class="font-semibold">{{ totalItems }}</span> oxen
              </span>
            </p>
            
            <div class="flex items-center gap-4">
              <!-- Sort By -->
              <select 
                v-model="filters.sortBy"
                class="px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              <!-- View Toggle -->
              <div class="flex border border-stone-200 rounded-lg overflow-hidden">
                <button 
                  @click="viewMode = 'grid'"
                  :class="[
                    'px-3 py-2 transition-colors',
                    viewMode === 'grid' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
                  ]"
                  title="Grid view"
                >
                  ⊞
                </button>
                <button 
                  @click="viewMode = 'list'"
                  :class="[
                    'px-3 py-2 transition-colors',
                    viewMode === 'list' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
                  ]"
                  title="List view"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p class="text-stone-600 mt-4">Loading listings...</p>
          </div>

          <!-- Results Grid/List -->
          <div 
            v-else-if="oxen.length > 0"
            :class="[
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            ]"
          >
            <OxenCard 
              v-for="ox in oxen" 
              :key="ox.id"
              :ox="ox"
              :userUuid="userUuid"
              :view-mode="viewMode"
              @click="viewOxDetails(ox.id)"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16 bg-white rounded-xl">
            <span class="text-6xl block mb-4">🐂</span>
            <h3 class="text-xl font-medium text-stone-800 mb-2">No oxen found</h3>
            <p class="text-stone-500 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button 
              @click="clearFilters"
              class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Clear Filters
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="showPagination && !loading" class="mt-8 flex justify-center items-center gap-4">
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
            >
              Previous
            </button>
            
            <div class="flex gap-2">
              <button 
                v-for="page in Math.min(5, totalPages)" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'w-10 h-10 rounded-lg transition-colors',
                  currentPage === page 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                ]"
              >
                {{ page }}
              </button>
              <span v-if="totalPages > 5" class="px-2 text-stone-400">...</span>
            </div>

            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
            >
              Next
            </button>
          </div>

          <!-- Page Info -->
          <div v-if="showPagination && !loading" class="mt-4 text-center text-sm text-stone-500">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>