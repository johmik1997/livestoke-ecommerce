<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: "Select breeds"
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Search query
const searchQuery = ref('');

// Available breeds
const breeds = [
  { id: 'borana', name: 'Borana', region: 'Oromia', popularity: 'high', icon: '🐂' },
  { id: 'ogaden', name: 'Ogaden', region: 'Somali', popularity: 'high', icon: '🐂' },
  { id: 'horro', name: 'Horro', region: 'Amhara', popularity: 'medium', icon: '🐂' },
  { id: 'sheko', name: 'Sheko', region: 'SNNPR', popularity: 'medium', icon: '🐂' },
  { id: 'danakil', name: 'Danakil', region: 'Afar', popularity: 'low', icon: '🐂' },
  { id: 'afar', name: 'Afar', region: 'Afar', popularity: 'medium', icon: '🐂' },
  { id: 'fogera', name: 'Fogera', region: 'Amhara', popularity: 'high', icon: '🐂' },
  { id: 'raya', name: 'Raya', region: 'Tigray', popularity: 'medium', icon: '🐂' },
  { id: 'arma', name: 'Arma', region: 'Oromia', popularity: 'low', icon: '🐂' },
  { id: 'jijiga', name: 'Jijiga', region: 'Somali', popularity: 'low', icon: '🐂' },
  { id: 'gurage', name: 'Gurage', region: 'SNNPR', popularity: 'medium', icon: '🐂' },
  { id: 'wello', name: 'Wello', region: 'Amhara', popularity: 'medium', icon: '🐂' }
];

// Filtered breeds based on search
const filteredBreeds = computed(() => {
  if (!searchQuery.value) return breeds;
  
  const query = searchQuery.value.toLowerCase();
  return breeds.filter(breed => 
    breed.name.toLowerCase().includes(query) || 
    breed.region.toLowerCase().includes(query)
  );
});

// Selected breeds
const selectedBreeds = ref(props.modelValue);

// Group breeds by popularity for better organization
const groupedBreeds = computed(() => {
  const groups = {
    high: filteredBreeds.value.filter(b => b.popularity === 'high'),
    medium: filteredBreeds.value.filter(b => b.popularity === 'medium'),
    low: filteredBreeds.value.filter(b => b.popularity === 'low')
  };
  return groups;
});

// Select/Deselect all
const selectAll = () => {
  if (selectedBreeds.value.length === breeds.length) {
    selectedBreeds.value = [];
  } else {
    selectedBreeds.value = breeds.map(b => b.id);
  }
  emitUpdate();
};

// Check if breed is selected
function isSelected(breedId) {
  return selectedBreeds.value.includes(breedId);
}

// Toggle breed selection
function toggleBreed(breedId) {
  if (props.multiple) {
    if (isSelected(breedId)) {
      selectedBreeds.value = selectedBreeds.value.filter(id => id !== breedId);
    } else {
      selectedBreeds.value = [...selectedBreeds.value, breedId];
    }
  } else {
    selectedBreeds.value = [breedId];
  }
  emitUpdate();
}

// Emit update
function emitUpdate() {
  emit('update:modelValue', selectedBreeds.value);
  emit('change', selectedBreeds.value);
}

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  selectedBreeds.value = newVal;
}, { deep: true });

// Get breed name by id
function getBreedName(breedId) {
  const breed = breeds.find(b => b.id === breedId);
  return breed ? breed.name : breedId;
}
</script>

<template>
  <div class="breed-selector">
    <!-- Search Input -->
    <div v-if="showSearch" class="mb-3">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="`🔍 Search breeds...`"
          class="w-full px-3 py-2 pl-9 bg-white border border-stone-200 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
        <span class="absolute left-3 top-2.5 text-stone-400">🔍</span>
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Selected Breeds Tags -->
    <div v-if="selectedBreeds.length > 0" class="flex flex-wrap gap-2 mb-3">
      <span 
        v-for="breedId in selectedBreeds" 
        :key="breedId"
        class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 
               rounded-lg text-xs border border-amber-200"
      >
        <span>🐂</span>
        {{ getBreedName(breedId) }}
        <button 
          @click="toggleBreed(breedId)"
          class="ml-1 hover:text-amber-900"
        >
          ✕
        </button>
      </span>
      
      <!-- Clear all button -->
      <button 
        v-if="selectedBreeds.length > 1"
        @click="selectedBreeds = []; emitUpdate()"
        class="text-xs text-stone-500 hover:text-stone-700 underline"
      >
        Clear all
      </button>
    </div>

    <!-- Breed Selection Area -->
    <div class="breed-list max-h-64 overflow-y-auto pr-2 space-y-3 custom-scroll">
      <!-- Popular Breeds -->
      <div v-if="groupedBreeds.high.length > 0">
        <h4 class="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Popular Breeds
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="breed in groupedBreeds.high"
            :key="breed.id"
            @click="toggleBreed(breed.id)"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
              isSelected(breed.id)
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
            ]"
          >
            <span>{{ breed.icon }}</span>
            <span class="flex-1 text-left">{{ breed.name }}</span>
            <span v-if="isSelected(breed.id)" class="text-white">✓</span>
          </button>
        </div>
      </div>

      <!-- Medium Popularity Breeds -->
      <div v-if="groupedBreeds.medium.length > 0">
        <h4 class="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Regional Breeds
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="breed in groupedBreeds.medium"
            :key="breed.id"
            @click="toggleBreed(breed.id)"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
              isSelected(breed.id)
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
            ]"
          >
            <span>{{ breed.icon }}</span>
            <span class="flex-1 text-left">{{ breed.name }}</span>
            <span class="text-xs text-stone-400">{{ breed.region }}</span>
            <span v-if="isSelected(breed.id)" class="text-white ml-1">✓</span>
          </button>
        </div>
      </div>

      <!-- Rare/Local Breeds -->
      <div v-if="groupedBreeds.low.length > 0">
        <h4 class="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Local Varieties
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="breed in groupedBreeds.low"
            :key="breed.id"
            @click="toggleBreed(breed.id)"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
              isSelected(breed.id)
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
            ]"
          >
            <span>{{ breed.icon }}</span>
            <span class="flex-1 text-left">{{ breed.name }}</span>
            <span v-if="isSelected(breed.id)" class="text-white">✓</span>
          </button>
        </div>
      </div>

      <!-- No results -->
      <div v-if="filteredBreeds.length === 0" class="text-center py-8">
        <span class="text-4xl block mb-2">🔍</span>
        <p class="text-stone-500 text-sm">No breeds found matching "{{ searchQuery }}"</p>
      </div>
    </div>

    <!-- Select All / Count -->
    <div v-if="multiple && breeds.length > 0" class="mt-3 pt-3 border-t border-stone-200 flex justify-between items-center">
      <button 
        @click="selectAll"
        class="text-sm text-amber-600 hover:text-amber-700 font-medium"
      >
        {{ selectedBreeds.length === breeds.length ? 'Deselect All' : 'Select All' }}
      </button>
      <span class="text-xs text-stone-500">
        {{ selectedBreeds.length }} of {{ breeds.length }} selected
      </span>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #d4a373;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #b45309;
}
</style>