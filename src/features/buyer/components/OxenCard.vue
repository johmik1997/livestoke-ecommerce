<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  ox: {
    type: Object,
    required: true
  },
userUuid: { type: String, required: true } // Current logged-in user UUID
});

const emit = defineEmits(['click', 'favorite']);

const isFavorite = ref(false);

// Computed properties for display
const displayPrice = computed(() => {
  return props.ox.price?.toLocaleString() || '0';
});

const displayName = computed(() => {
  return props.ox.name || 'Unnamed Ox';
});

const displayBreed = computed(() => {
  return props.ox.breed || 'Unknown Breed';
});

const displayAge = computed(() => {
  return props.ox.age || 'Age not specified';
});

const displayLocation = computed(() => {
  return props.ox.location || 'Location not specified';
});

const displaySeller = computed(() => {
  return props.ox.sellerName || 'Unknown Seller';
});

const displayRating = computed(() => {
  return props.ox.rating || '4.5';
});

const displayWeight = computed(() => {
  return props.ox.weight || 'Weight N/A';
});

const hasHealthCertified = computed(() => {
  return props.ox.healthCertified === true;
});

const isVaccinated = computed(() => {
  return props.ox.vaccinated === true;
});
import ApiService from "@/service/ApiService";

const api = new ApiService();
const BASE_URL = "http://localhost:8380/api/medco-digital-parking/v1/api";




  const toggleFavorite = async (event) => {
  event.stopPropagation();
  try {
    const response = await api
      .addAuthenticationHeader()
      .put(`${BASE_URL}/oxen/${props.ox.oxUuid}/favorite/${props.userUuid}`);

    console.log("Backend response:", response.data);

    // Correct property from backend
    isFavorite.value = response.data.favorite;

    emit('favorite', props.ox.oxUuid);

  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    alert("Failed to update favorite. Try again.");
  }
};
</script>

<template>
  <div 
    class="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    @click="$emit('click')"
  >
    <!-- Image -->
    <div class="relative h-40 bg-stone-100 flex items-center justify-center">
      <img 
        v-if="ox.images[0]" 
        :src="ox.images[0]" 
        :alt="displayName"
        class="w-full h-full object-cover"
      />
      <span v-else class="text-6xl">🐂</span>
      
      <!-- Favorite Button -->
      <button 
        @click="toggleFavorite"
        class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
      >
        <span :class="isFavorite ? 'text-red-500' : 'text-stone-400'">{{ isFavorite ? '❤️' : '🤍' }}</span>
      </button>

      <!-- Health Badge -->
      <div v-if="hasHealthCertified" class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
        ✅ Health Certified
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <div>
          <h3 class="font-semibold text-stone-800">{{ displayName }}</h3>
          <p class="text-sm text-stone-500">{{ displayBreed }} • {{ displayAge }} age</p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-amber-600">{{ displayPrice }} ETB</p>
          <p class="text-xs text-stone-400">{{ displayWeight }} Kg</p>
        </div>
      </div>

      <!-- Seller Info -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
          <span class="text-xs">🏠</span>
        </div>
        <span class="text-sm text-stone-600">{{ displaySeller }}</span>
        <span class="text-xs text-stone-400 ml-auto">★ {{ displayRating }}</span>
      </div>

      <!-- Location & Tags -->
      <div class="flex flex-wrap gap-2 mt-2">
        <span class="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-full">
          📍 {{ displayLocation }}
        </span>
        <span v-if="isVaccinated" class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
          💉 Vaccinated
        </span>
        <span v-if="ox.bodyCondition" class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {{ ox.bodyCondition }}
        </span>
      </div>
    </div>
  </div>
</template>