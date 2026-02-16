<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
import { toasted } from "@/utils/utils";
import { getOx, createOx, updateOx } from "../api/oxApi.js";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const isEdit = route.path.includes("edit");

const form = ref({
  name: "",
  breed: "",
  age: "",
  weight: "",
  height: "",
  color: "",
  price: "",
  location: "",
  description: "",
  healthCertified: false,
  vaccinated: false,
  dewormed: false,
  bodyCondition: "",
  images: [],
});

// Translated options
const breeds = computed(() => [
  t('oxen.breeds.borana'),
  t('oxen.breeds.sahiwal'),
  t('oxen.breeds.ogaden'),
  t('oxen.breeds.horro'),
  t('oxen.breeds.fogera'),
  t('oxen.breeds.sheko'),
  t('oxen.breeds.other')
]);

const locations = computed(() => [
  t('oxen.locations.oromia'),
  t('oxen.locations.somali'),
  t('oxen.locations.amhara'),
  t('oxen.locations.tigray'),
  t('oxen.locations.sidama'),
  t('oxen.locations.snnpr'),
  t('oxen.locations.other')
]);

const bodyConditions = computed(() => [
  t('oxen.bodyConditions.excellent'),
  t('oxen.bodyConditions.good'),
  t('oxen.bodyConditions.average'),
  t('oxen.bodyConditions.fair')
]);

const previewImages = ref([]);
const filesToUpload = ref([]);
const isSubmitting = ref(false);

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Load existing ox for editing
const fetchOx = async () => {
  try {
    const response = await getOx(route.params.id);
    const oxData = response.data;
    
    form.value = {
      name: oxData.name || "",
      breed: oxData.breed || "",
      age: oxData.age || "",
      weight: oxData.weight || "",
      height: oxData.height || "",
      color: oxData.color || "",
      price: oxData.price || "",
      location: oxData.location || "",
      description: oxData.description || "",
      healthCertified: oxData.healthCertified || false,
      vaccinated: oxData.vaccinated || false,
      dewormed: oxData.dewormed || false,
      bodyCondition: oxData.bodyCondition || "",
      images: oxData.images || [],
    };
    
    // Load existing images for preview
    if (oxData.pictures && oxData.pictures.length) {
      previewImages.value = oxData.pictures.map(p => p.imageUrl);
    }
  } catch (error) {
    console.error("Error fetching ox:", error);
    toasted(false, t('oxen.messages.loadError'));
  }
};

// Call fetchOx if in edit mode
if (isEdit) {
  fetchOx();
}

// Image upload & preview
async function handleImageUpload(event) {
  const files = Array.from(event.target.files);
  
  for (const file of files) {
    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      previewImages.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Store file for later conversion to base64
    filesToUpload.value.push(file);
  }
}

function removeImage(index) {
  previewImages.value.splice(index, 1);
  filesToUpload.value.splice(index, 1);
}

// Submit form
async function submitForm() {
  isSubmitting.value = true;

  if (!form.value.name || !form.value.price) {
    toasted(false, t('oxen.form.validation.required'));
    isSubmitting.value = false;
    return;
  }

  try {
    // Convert all new files to base64
    const imageBase64List = [];
    
    // Keep existing images from preview that are already URLs
    const existingImageUrls = previewImages.value.filter(img => 
      typeof img === 'string' && img.startsWith('http')
    );
    
    // Add existing image URLs
    imageBase64List.push(...existingImageUrls);
    
    // Convert new files to base64
    for (const file of filesToUpload.value) {
      const base64 = await fileToBase64(file);
      imageBase64List.push(base64);
    }

    // Prepare oxData with base64 images
    const oxData = {
      name: form.value.name,
      breed: form.value.breed,
      age: form.value.age,
      weight: form.value.weight,
      height: form.value.height,
      color: form.value.color,
      price: Number(form.value.price),
      location: form.value.location,
      description: form.value.description,
      bodyCondition: form.value.bodyCondition,
      healthCertified: form.value.healthCertified,
      vaccinated: form.value.vaccinated,
      dewormed: form.value.dewormed,
      images: imageBase64List
    };

    console.log("Submitting ox data:", oxData); // For debugging

    if (isEdit) {
      await updateOx(route.params.id, oxData);
      toasted(true, t('oxen.messages.updateSuccess'));
    } else {
      await createOx(oxData);
      toasted(true, t('oxen.messages.createSuccess'));
    }

    router.push("/seller/my-oxen");
  } catch (error) {
    console.error("Error saving ox:", error);
    toasted(false, error.response?.data?.message || t('oxen.messages.saveError'));
  } finally {
    isSubmitting.value = false;
  }
}

function cancel() {
  router.push("/seller/my-oxen");
}

// Page title
const pageTitle = computed(() => {
  return isEdit ? t('oxen.form.editTitle') : t('oxen.form.addTitle');
});

const pageSubtitle = computed(() => {
  return isEdit ? t('oxen.form.editSubtitle') : t('oxen.form.addSubtitle');
});

// Submit button text
const submitButtonText = computed(() => {
  if (isSubmitting.value) return t('common.saving');
  return isEdit ? t('oxen.form.updateButton') : t('oxen.form.addButton');
});
</script>

<template>
  <div class="min-h-screen bg-stone-50" :lang="locale">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">
          {{ pageTitle }}
        </h1>
        <p class="text-stone-600">
          {{ pageSubtitle }}
        </p>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-lg font-medium text-stone-800 mb-4">{{ t('oxen.form.sections.basic') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.name') }} *
              </label>
              <input v-model="form.name" type="text" required
                     :placeholder="t('oxen.form.placeholders.name')"
                     class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.breed') }} *
              </label>
              <select v-model="form.breed" required
                      class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">{{ t('oxen.form.selectPlaceholder') }}</option>
                <option v-for="breed in breeds" :key="breed" :value="breed">{{ breed }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.age') }} *
              </label>
              <input v-model="form.age" type="text" :placeholder="t('oxen.form.placeholders.age')" required
                     class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.weight') }} *
              </label>
              <input v-model="form.weight" type="text" :placeholder="t('oxen.form.placeholders.weight')" required
                     class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.height') }} *
              </label>
              <input v-model="form.height" type="text" :placeholder="t('oxen.form.placeholders.height')" required
                     class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.color') }} *
              </label>
              <input v-model="form.color" type="text" :placeholder="t('oxen.form.placeholders.color')" required
                     class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.price') }} *
              </label>
              <input v-model="form.price" type="number" min="0" step="1000" required
                     :placeholder="t('oxen.form.placeholders.price')"
                     class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.bodyCondition') }}
              </label>
              <select v-model="form.bodyCondition"
                      class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">{{ t('oxen.form.selectPlaceholder') }}</option>
                <option v-for="condition in bodyConditions" :key="condition" :value="condition">{{ condition }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">
                {{ t('oxen.form.fields.location') }} *
              </label>
              <select v-model="form.location" required
                      class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">{{ t('oxen.form.selectPlaceholder') }}</option>
                <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Health Information -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-lg font-medium text-stone-800 mb-4">{{ t('oxen.form.sections.health') }}</h2>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input v-model="form.healthCertified" type="checkbox" class="w-4 h-4 text-amber-600 rounded" />
              <span class="text-stone-700">{{ t('oxen.form.health.healthCertified') }}</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input v-model="form.vaccinated" type="checkbox" class="w-4 h-4 text-amber-600 rounded" />
              <span class="text-stone-700">{{ t('oxen.form.health.vaccinated') }}</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input v-model="form.dewormed" type="checkbox" class="w-4 h-4 text-amber-600 rounded" />
              <span class="text-stone-700">{{ t('oxen.form.health.dewormed') }}</span>
            </label>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-lg font-medium text-stone-800 mb-4">{{ t('oxen.form.sections.description') }}</h2>
          <textarea v-model="form.description" rows="5"
                    :placeholder="t('oxen.form.placeholders.description')"
                    class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
        </div>

        <!-- Images -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-lg font-medium text-stone-800 mb-4">{{ t('oxen.form.sections.images') }}</h2>
          <div class="mb-4">
            <label class="block w-full p-4 border-2 border-dashed border-stone-200 rounded-lg hover:border-amber-500 cursor-pointer transition-colors">
              <input type="file" multiple accept="image/*" @change="handleImageUpload" class="hidden">
              <div class="text-center">
                <span class="text-3xl block mb-2">📸</span>
                <p class="text-stone-600">{{ t('oxen.form.images.uploadText') }}</p>
                <p class="text-xs text-stone-400">{{ t('oxen.form.images.uploadHint') }}</p>
              </div>
            </label>
          </div>
          <div v-if="previewImages.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="(img, index) in previewImages" :key="index" class="relative group">
              <img :src="img" :alt="t('oxen.form.images.previewAlt')" class="w-full h-24 object-cover rounded-lg">
              <button type="button" @click="removeImage(index)" 
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      :title="t('common.delete')">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-4">
          <button type="button" @click="cancel"
                  class="px-6 py-3 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" :disabled="isSubmitting"
                  class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors">
            {{ submitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Amharic text support */
:lang(am) {
  font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', sans-serif;
}

/* Smooth transitions */
.transition-colors {
  transition: all 0.2s ease-in-out;
}
</style>