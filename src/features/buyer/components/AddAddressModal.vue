<script setup>
import { ref, watch } from "vue";
import { toasted } from "@/utils/utils";

const props = defineProps({
  modelValue: Boolean,
  addressToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'save', 'close']);

// Form data
const formData = ref({
  id: null,
  name: '',
  phone: '',
  alternativePhone: '',
  address: '',
  city: 'Addis Ababa',
  subCity: '',
  landmark: '',
  type: 'HOME',
  isDefault: false
});

const loading = ref(false);
const errors = ref({});

// Cities list
const cities = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Gondar', 'Hawassa', 'Mekelle', 'Jimma', 'Dire Dawa'];

// Address types
const addressTypes = [
  { id: 'HOME', name: 'Home' },
  { id: 'OFFICE', name: 'Office' },
  { id: 'OTHER', name: 'Other' }
];
// Reset form
const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    phone: '',
    alternativePhone: '',
    address: '',
    city: 'Addis Ababa',
    subCity: '',
    landmark: '',
    type: 'HOME',
    isDefault: false
  };
  errors.value = {};
};

// Watch for addressToEdit changes
watch(() => props.addressToEdit, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal };
  } else {
    resetForm();
  }
}, { immediate: true });


// Validate form
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.value.name) newErrors.name = 'Recipient name is required';
  if (!formData.value.phone) newErrors.phone = 'Phone number is required';
  else if (!/^(\+251|0)?9\d{8}$/.test(formData.value.phone.replace(/\s/g, ''))) {
    newErrors.phone = 'Please enter a valid Ethiopian phone number';
  }
  
  if (formData.value.alternativePhone && 
      !/^(\+251|0)?9\d{8}$/.test(formData.value.alternativePhone.replace(/\s/g, ''))) {
    newErrors.alternativePhone = 'Please enter a valid Ethiopian phone number';
  }
  
  if (!formData.value.address) newErrors.address = 'Address is required';
  if (!formData.value.city) newErrors.city = 'City is required';
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Save address
const saveAddress = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    await emit('save', formData.value);
    closeModal();
  } catch (error) {
    // Error is handled in parent component
  } finally {
    loading.value = false;
  }
};

// Close modal
const closeModal = () => {
  resetForm();
  emit('update:modelValue', false);
  emit('close');
};

// Format phone number for display
const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phone = value.replace(/\D/g, '');
  if (phone.startsWith('251')) {
    return '+' + phone.slice(0, 3) + ' ' + phone.slice(3, 6) + ' ' + phone.slice(6);
  } else if (phone.startsWith('0')) {
    return phone.slice(0, 4) + ' ' + phone.slice(4, 7) + ' ' + phone.slice(7);
  }
  return value;
};
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
      
      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          <!-- Header -->
          <div class="flex justify-between items-center p-6 border-b border-stone-200">
            <h3 class="text-xl font-serif text-stone-800">
              {{ addressToEdit ? 'Edit Address' : 'Add New Address' }}
            </h3>
            <button @click="closeModal" class="text-stone-400 hover:text-stone-600">
              <span class="text-2xl">&times;</span>
            </button>
          </div>
          
          <!-- Form -->
          <div class="p-6 space-y-4">
            <!-- Recipient Name -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Recipient Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Full name"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                  errors.name ? 'border-red-500' : 'border-stone-200'
                ]"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
            </div>
            
            <!-- Phone Number -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Phone Number <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="+251 91 234 5678"
                @input="formData.phone = formatPhoneNumber(formData.phone)"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                  errors.phone ? 'border-red-500' : 'border-stone-200'
                ]"
              />
              <p v-if="errors.phone" class="mt-1 text-xs text-red-500">{{ errors.phone }}</p>
            </div>
            
            <!-- Alternative Phone -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Alternative Phone (Optional)
              </label>
              <input
                v-model="formData.alternativePhone"
                type="tel"
                placeholder="+251 91 234 5678"
                @input="formData.alternativePhone = formatPhoneNumber(formData.alternativePhone)"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                  errors.alternativePhone ? 'border-red-500' : 'border-stone-200'
                ]"
              />
              <p v-if="errors.alternativePhone" class="mt-1 text-xs text-red-500">{{ errors.alternativePhone }}</p>
            </div>
            
            <!-- Address Line -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Address <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.address"
                type="text"
                placeholder="Street address, area"
                :class="[
                  'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                  errors.address ? 'border-red-500' : 'border-stone-200'
                ]"
              />
              <p v-if="errors.address" class="mt-1 text-xs text-red-500">{{ errors.address }}</p>
            </div>
            
            <!-- City and Sub-city -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">
                  City <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.city"
                  :class="[
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500',
                    errors.city ? 'border-red-500' : 'border-stone-200'
                  ]"
                >
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </select>
                <p v-if="errors.city" class="mt-1 text-xs text-red-500">{{ errors.city }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">
                  Sub-city/Area
                </label>
                <input
                  v-model="formData.subCity"
                  type="text"
                  placeholder="e.g., Bole"
                  class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            
            <!-- Landmark -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Landmark (Optional)
              </label>
              <input
                v-model="formData.landmark"
                type="text"
                placeholder="e.g., Near Bole Airport"
                class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <!-- Address Type and Default -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">
                  Address Type
                </label>
                <select
                  v-model="formData.type"
                  class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option v-for="type in addressTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
              
              <div class="flex items-center">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="formData.isDefault"
                    type="checkbox"
                    class="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500"
                  />
                  <span class="text-sm text-stone-700">Set as default address</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="flex justify-end gap-3 p-6 border-t border-stone-200">
            <button
              @click="closeModal"
              class="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              @click="saveAddress"
              :disabled="loading"
              class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400 flex items-center gap-2"
            >
              <span v-if="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              {{ loading ? 'Saving...' : (addressToEdit ? 'Update' : 'Save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>