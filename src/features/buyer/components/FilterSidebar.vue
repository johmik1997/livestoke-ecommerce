<script setup>
const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  breedOptions: {
    type: Array,
    default: () => []
  },
  locationOptions: {
    type: Array,
    default: () => []
  },
  ageOptions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update', 'clear']);

function updateFilter(key, value) {
  emit('update', { [key]: value });
}

function toggleBreed(breed) {
  const current = [...props.filters.breed];
  const index = current.indexOf(breed);
  if (index === -1) {
    current.push(breed);
  } else {
    current.splice(index, 1);
  }
  emit('update', { breed: current });
}

function toggleLocation(location) {
  const current = [...props.filters.location];
  const index = current.indexOf(location);
  if (index === -1) {
    current.push(location);
  } else {
    current.splice(index, 1);
  }
  emit('update', { location: current });
}

function toggleAge(age) {
  const current = [...props.filters.age];
  const index = current.indexOf(age);
  if (index === -1) {
    current.push(age);
  } else {
    current.splice(index, 1);
  }
  emit('update', { age: current });
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-stone-800">Filters</h2>
      <button @click="$emit('clear')" class="text-sm text-amber-600 hover:text-amber-700">
        Clear All
      </button>
    </div>

    <!-- Breed Filter -->
    <div class="mb-6">
      <h3 class="font-medium text-stone-700 mb-3">Breed</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <label v-for="breed in breedOptions" :key="breed" class="flex items-center gap-2">
          <input 
            type="checkbox" 
            :checked="filters.breed.includes(breed)"
            @change="toggleBreed(breed)"
            class="rounded text-amber-600 focus:ring-amber-500"
          >
          <span class="text-sm text-stone-600">{{ breed }}</span>
        </label>
      </div>
    </div>

    <!-- Price Range -->
    <div class="mb-6">
      <h3 class="font-medium text-stone-700 mb-3">Price Range (ETB)</h3>
      <div class="flex gap-2">
        <input 
          type="number" 
          :value="filters.priceRange[0]"
          @input="updateFilter('priceRange', [$event.target.value, filters.priceRange[1]])"
          class="w-1/2 px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Min"
        >
        <input 
          type="number" 
          :value="filters.priceRange[1]"
          @input="updateFilter('priceRange', [filters.priceRange[0], $event.target.value])"
          class="w-1/2 px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Max"
        >
      </div>
    </div>

    <!-- Location Filter -->
    <div class="mb-6">
      <h3 class="font-medium text-stone-700 mb-3">Location</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <label v-for="location in locationOptions" :key="location" class="flex items-center gap-2">
          <input 
            type="checkbox" 
            :checked="filters.location.includes(location)"
            @change="toggleLocation(location)"
            class="rounded text-amber-600 focus:ring-amber-500"
          >
          <span class="text-sm text-stone-600">{{ location }}</span>
        </label>
      </div>
    </div>

    <!-- Age Filter -->
    <div class="mb-6">
      <h3 class="font-medium text-stone-700 mb-3">Age</h3>
      <div class="space-y-2">
        <label v-for="age in ageOptions" :key="age" class="flex items-center gap-2">
          <input 
            type="checkbox" 
            :checked="filters.age.includes(age)"
            @change="toggleAge(age)"
            class="rounded text-amber-600 focus:ring-amber-500"
          >
          <span class="text-sm text-stone-600">{{ age }}</span>
        </label>
      </div>
    </div>

    <!-- Health Filters -->
    <div class="mb-6">
      <h3 class="font-medium text-stone-700 mb-3">Health Status</h3>
      <div class="space-y-2">
        <label class="flex items-center gap-2">
          <input 
            type="checkbox" 
            :checked="filters.healthCertified"
            @change="updateFilter('healthCertified', $event.target.checked)"
            class="rounded text-amber-600 focus:ring-amber-500"
          >
          <span class="text-sm text-stone-600">Health Certified</span>
        </label>
        <label class="flex items-center gap-2">
          <input 
            type="checkbox" 
            :checked="filters.vaccinated"
            @change="updateFilter('vaccinated', $event.target.checked)"
            class="rounded text-amber-600 focus:ring-amber-500"
          >
          <span class="text-sm text-stone-600">Vaccinated</span>
        </label>
        <label class="flex items-center gap-2">
          <input 
            type="checkbox" 
            :checked="filters.dewormed"
            @change="updateFilter('dewormed', $event.target.checked)"
            class="rounded text-amber-600 focus:ring-amber-500"
          >
          <span class="text-sm text-stone-600">Dewormed</span>
        </label>
      </div>
    </div>

    <!-- Apply Filters Button (Mobile) -->
    <button class="w-full lg:hidden py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
      Apply Filters
    </button>
  </div>
</template>