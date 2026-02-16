<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useAuth } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import icons from "@/utils/icons";
import imageSrc from "@/assets/img/profile.png";

// Define props
const props = defineProps({
  modelValue: {
    type: String,
  },
  title: {
    type: String,
  },
});

const { locale, t } = useI18n();
const authStore = useAuth();
const router = useRouter();
const isScrolled = ref(false);

const profilePicture = ref(imageSrc);

const user = computed(() => authStore?.auth?.user || { 
  name: t('defaultUser'), 
  role: t('defaultRole') 
});

async function processProfilePicture() {
  console.log("authStore:", authStore);
  console.log("authStore.auth:", authStore.auth);
  console.log("authStore.auth.user:", authStore.auth?.user);
  
  const profilePic = authStore.auth?.user?.profilePicture;

  console.log("Profile Picture:", profilePic);

  if (profilePic) {
    if (!profilePic.startsWith("data:image/")) {
      profilePicture.value = `data:image/png;base64,${profilePic}`;
    } else {
      profilePicture.value = profilePic;
    }
  } else {
    profilePicture.value = imageSrc;
  }
}

function handleImageError() {
  profilePicture.value = imageSrc;
}

function logout() {
  localStorage.removeItem("userDetail");
  window.location.href = "/login";
}

onMounted(() => {
  processProfilePicture();
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 10;
  });
});

const inputData = ref("");
const emit = defineEmits(["update:modelValue"]);
watch(inputData, () => {
  emit("update:modelValue", inputData.value);
});

const showUserMenu = ref(false);
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const goBack = () => {
  router.go(-1);
};

// Language switching
const availableLocales = ['en', 'am'];
const switchLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem('locale', lang);
};

// Navigate to Profile or Settings page
const navigateTo = (page) => {
  if (page === "profile") {
    router.push('/profile'); 
  } else if (page === "settings") {
    router.push('/settings'); 
  }
  showUserMenu.value = false;
};

// Translated texts
const pageTitle = computed(() => {
  return props.title || t('defaultTitle');
});
</script>

<template>
  <div class="flex justify-between items-center bg-stone-50 relative">
    <!-- Left Side - Back Button and Title -->
    <div class="flex items-center gap-2 sm:gap-4">
      <button 
        @click="goBack" 
        class="p-2 hover:bg-amber-50 rounded-lg flex items-center gap-2 transition-colors group"
        :aria-label="t('goBack')"
      >
        <span class="item-center">
          <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.6" fill-rule="evenodd" clip-rule="evenodd"
              d="M5.82539 1.0134C6.03505 1.20471 6.05933 1.54072 5.87962 1.76391L2.15854 6.38525L5.87962 11.0066C6.05933 11.2298 6.03505 11.5658 5.82539 11.7571C5.61572 11.9484 5.30007 11.9226 5.12036 11.6994L1.12037 6.73164C0.959876 6.53232 0.959876 6.23819 1.12037 6.03887L5.12036 1.07113C5.30008 0.847943 5.61572 0.822096 5.82539 1.0134Z"
              fill="#92400E" stroke="#92400E" stroke-linecap="round" 
              class="group-hover:fill-amber-700 group-hover:stroke-amber-700"
            />
          </svg>
        </span>
      </button>
      <span class="capitalize text-base sm:text-lg font-bold truncate text-stone-800">{{ pageTitle }}</span>
    </div>

    <!-- Right Side - User Info and Icons -->
    <div class="flex gap-2 sm:gap-4 items-center">
      <!-- Language Switcher -->
      <div class="flex gap-1 border border-amber-200 rounded-lg overflow-hidden">
        <button 
          v-for="lang in availableLocales" 
          :key="lang"
          @click="switchLanguage(lang)" 
          :class="[
            'px-2 py-1 text-sm font-medium transition-colors',
            locale === lang 
              ? 'bg-amber-600 text-white' 
              : 'bg-white text-stone-600 hover:bg-amber-50'
          ]"
          :aria-label="t(`language.${lang}`)"
        >
          {{ lang === 'en' ? 'EN' : 'አማ' }}
        </button>
      </div>

      <!-- Icons - Hidden on mobile, visible on tablet and up -->
      <div class="hidden sm:flex gap-4 items-center">
        <button 
          class="p-2 hover:bg-amber-100 rounded-full transition-colors text-stone-600 hover:text-amber-700"
          :aria-label="t('notifications')"
        >
          <i v-html="icons.notification" />
        </button>
        <button 
          class="p-2 hover:bg-amber-100 rounded-full transition-colors text-stone-600 hover:text-amber-700"
          :aria-label="t('messages')"
        >
          <i v-html="icons.message" />
        </button>
        <button 
          class="p-2 hover:bg-amber-100 rounded-full transition-colors text-stone-600 hover:text-amber-700"
          :aria-label="t('bire')"
        >
          <i v-html="icons.bire" />
        </button>
      </div>

      <!-- User Profile Section -->
      <div class="relative">
        <button 
          @click="toggleUserMenu"
          class="flex items-center gap-2 p-2 hover:bg-amber-100 rounded-lg transition-colors group"
          :aria-label="t('userMenu')"
          :aria-expanded="showUserMenu"
        >
          <div class="relative">
            <div class="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-200 shadow">
              <img
                :src="profilePicture || imageSrc"
                :alt="t('userAvatar')"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                @error="handleImageError"
              />
            </div>
            <span class="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-ping"></span>
          </div>
          <!-- User Info - Hidden on mobile -->
          <div class="hidden sm:block text-right">
            <p class="font-Poppin text-sm text-stone-800">{{ user.name }}</p>
            <p class="text-xs text-amber-700">{{ user.role }}</p>
          </div>
          
          <i v-html="icons.down" class="transition-transform duration-200 text-stone-600 group-hover:text-amber-700" 
             :class="{ 'rotate-180': showUserMenu }" />
        </button>

        <!-- Dropdown Menu -->
        <div v-if="showUserMenu" 
             class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-amber-200"
             role="menu"
             :aria-label="t('userMenu')"
        >
          <!-- Mobile-only icons -->
          <div class="sm:hidden border-b border-amber-100">
            <button 
              class="w-full px-4 py-2 text-left hover:bg-amber-50 flex items-center gap-2 text-stone-700 hover:text-amber-700"
              role="menuitem"
            >
              <i v-html="icons.notification" />
              <span>{{ t('notifications') }}</span>
            </button>
            <button 
              class="w-full px-4 py-2 text-left hover:bg-amber-50 flex items-center gap-2 text-stone-700 hover:text-amber-700"
              role="menuitem"
            >
              <i v-html="icons.message" />
              <span>{{ t('messages') }}</span>
            </button>
          </div>
          
          <!-- Common menu items -->
          <button 
            @click="navigateTo('profile')" 
            class="w-full px-4 py-2 text-left hover:bg-amber-50 text-stone-700 hover:text-amber-700"
            role="menuitem"
          >
            {{ t('profile') }}
          </button>
          <button 
            @click="logout()" 
            class="w-full px-4 py-2 text-left hover:bg-amber-50 text-red-600 hover:text-red-700"
            role="menuitem"
          >
            {{ t('logout') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay for closing dropdown -->
    <div v-if="showUserMenu" 
         @click="showUserMenu = false"
         class="fixed inset-0 z-40"
         :aria-label="t('closeMenu')">
    </div>
  </div>
</template>

<style scoped>
.truncate {
  max-width: 200px;
  @apply overflow-hidden text-ellipsis whitespace-nowrap;
}

@media (max-width: 640px) {
  .truncate {
    max-width: 150px;
  }
}

/* Amharic text support */
:lang(am) {
  font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', sans-serif;
}
</style>