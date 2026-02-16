<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [0, 200000]
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 200000
  },
  step: {
    type: Number,
    default: 1000
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  formatWithCommas: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Local values
const minValue = ref(props.modelValue[0]);
const maxValue = ref(props.modelValue[1]);
const minInput = ref(formatNumber(props.modelValue[0]));
const maxInput = ref(formatNumber(props.modelValue[1]));

// Preset ranges
const presetRanges = [
  { label: 'Under 25k', min: 0, max: 25000 },
  { label: '25k - 50k', min: 25000, max: 50000 },
  { label: '50k - 75k', min: 50000, max: 75000 },
  { label: '75k - 100k', min: 75000, max: 100000 },
  { label: '100k - 150k', min: 100000, max: 150000 },
  { label: '150k+', min: 150000, max: props.max }
];

// Format number with commas
function formatNumber(num) {
  if (!props.formatWithCommas) return num.toString();
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Parse formatted number
function parseNumber(str) {
  return parseInt(str.replace(/,/g, '')) || 0;
}

// Handle min input change
function updateMinInput() {
  let value = parseNumber(minInput.value);
  value = Math.max(props.min, Math.min(value, maxValue.value - props.step));
  minInput.value = formatNumber(value);
  minValue.value = value;
  emitUpdate();
}

// Handle max input change
function updateMaxInput() {
  let value = parseNumber(maxInput.value);
  value = Math.min(props.max, Math.max(value, minValue.value + props.step));
  maxInput.value = formatNumber(value);
  maxValue.value = value;
  emitUpdate();
}

// Handle slider change
function updateFromSliders() {
  minInput.value = formatNumber(minValue.value);
  maxInput.value = formatNumber(maxValue.value);
  emitUpdate();
}

// Apply preset range
function applyPreset(range) {
  minValue.value = range.min;
  maxValue.value = range.max;
  minInput.value = formatNumber(range.min);
  maxInput.value = formatNumber(range.max);
  emitUpdate();
}

// Emit update
function emitUpdate() {
  const value = [minValue.value, maxValue.value];
  emit('update:modelValue', value);
  emit('change', value);
}

// Percentage positions for slider background
const minPercent = computed(() => 
  ((minValue.value - props.min) / (props.max - props.min)) * 100
);

const maxPercent = computed(() => 
  ((maxValue.value - props.min) / (props.max - props.min)) * 100
);

// Watch external changes
watch(() => props.modelValue, (newVal) => {
  minValue.value = newVal[0];
  maxValue.value = newVal[1];
  minInput.value = formatNumber(newVal[0]);
  maxInput.value = formatNumber(newVal[1]);
});
</script>

<template>
  <div class="price-range-slider space-y-4">
    <!-- Preset Range Pills -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="range in presetRanges"
        :key="range.label"
        @click="applyPreset(range)"
        :class="[
          'px-3 py-1.5 text-xs rounded-full transition-colors border',
          minValue.value === range.min && maxValue.value === range.max
            ? 'bg-amber-600 text-white border-amber-600'
            : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
        ]"
      >
        {{ range.label }}
      </button>
    </div>

    <!-- Slider -->
    <div class="relative pt-6 pb-2">
      <!-- Slider track -->
      <div class="h-2 bg-stone-200 rounded-full">
        <!-- Filled range -->
        <div 
          class="absolute h-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
          :style="{
            left: minPercent + '%',
            right: (100 - maxPercent) + '%'
          }"
        ></div>
      </div>

      <!-- Min slider thumb -->
      <input
        type="range"
        v-model.number="minValue"
        :min="min"
        :max="max"
        :step="step"
        @input="updateFromSliders"
        class="absolute w-full top-0 h-2 appearance-none bg-transparent pointer-events-none"
        :style="{ zIndex: minValue > maxValue - 10000 ? 2 : 1 }"
      />
      
      <!-- Max slider thumb -->
      <input
        type="range"
        v-model.number="maxValue"
        :min="min"
        :max="max"
        :step="step"
        @input="updateFromSliders"
        class="absolute w-full top-0 h-2 appearance-none bg-transparent pointer-events-none"
      />

      <!-- Range labels -->
      <div class="flex justify-between mt-4 text-xs text-stone-500">
        <span>{{ formatNumber(min) }} {{ currency }}</span>
        <span>{{ formatNumber(max) }} {{ currency }}</span>
      </div>
    </div>

    <!-- Input fields -->
    <div class="flex items-center gap-3">
      <div class="flex-1">
        <label class="block text-xs text-stone-500 mb-1">Min Price</label>
        <div class="relative">
          <input
            type="text"
            v-model="minInput"
            @blur="updateMinInput"
            @keyup.enter="updateMinInput"
            class="w-full px-3 py-2 pr-12 border border-stone-200 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <span class="absolute right-3 top-2 text-stone-400 text-sm">{{ currency }}</span>
        </div>
      </div>
      
      <div class="text-stone-400 mt-6">—</div>
      
      <div class="flex-1">
        <label class="block text-xs text-stone-500 mb-1">Max Price</label>
        <div class="relative">
          <input
            type="text"
            v-model="maxInput"
            @blur="updateMaxInput"
            @keyup.enter="updateMaxInput"
            class="w-full px-3 py-2 pr-12 border border-stone-200 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <span class="absolute right-3 top-2 text-stone-400 text-sm">{{ currency }}</span>
        </div>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="bg-amber-50 rounded-lg p-3 text-sm">
      <div class="flex justify-between items-center">
        <span class="text-stone-600">Selected range:</span>
        <span class="font-semibold text-amber-700">
          {{ formatNumber(minValue) }} - {{ formatNumber(maxValue) }} {{ currency }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Range input styling */
input[type=range] {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: transparent;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #b45309;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  margin-top: -6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.1s ease;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  background: #fbbf24;
}

input[type=range]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #b45309;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

input[type=range]::-moz-range-thumb:hover {
  background: #fbbf24;
}

/* Track */
input[type=range]::-webkit-slider-runnable-track {
  height: 8px;
  background: transparent;
}

input[type=range]::-moz-range-track {
  height: 8px;
  background: transparent;
}

/* Remove default focus outline */
input[type=range]:focus {
  outline: none;
}

input[type=range]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(180, 83, 9, 0.2);
}

input[type=range]:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(180, 83, 9, 0.2);
}
</style>