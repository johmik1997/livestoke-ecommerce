<script setup>
import Button from "@/components/Button.vue";
import NavBar from "@/components/NavBar.vue";
import navs from "@/config/navs";
import { provide, ref, watch, computed, nextTick, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAuth } from "@/stores/auth";
import icons from "@/utils/icons";

const authStore = useAuth();
const route = useRoute();
const inputData = ref("");
const search = ref("");
const openDropdowns = ref(new Set());
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Prevent flash issue by delaying dropdown state changes
const toggleDropdown = async (navPath, event) => {
  // Prevent event propagation
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  await nextTick();
  
  if (!openDropdowns.value.has(navPath)) {
    openDropdowns.value = new Set([navPath]);
  } else {
    // Toggle off the dropdown when clicked again
    openDropdowns.value.delete(navPath);
  }
};

watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

// Watch for route changes to handle dropdowns when navigating
watch(() => route.path, (newPath, oldPath) => {
  // Close mobile menu on route change
  isMobileMenuOpen.value = false;
  
  // Extract the base paths for comparison
  const newPathBase = newPath.split('/')[1];
  const oldPathBase = oldPath?.split('/')[1];
  
  // Only close dropdowns when navigating to a completely different section
  if (newPathBase !== oldPathBase) {
    // We're navigating to a different main section, close all dropdowns
    openDropdowns.value = new Set();
  }
});

// Filter navs based on privileges
const filteredNavs = computed(() => {
  return navs.filter(nav => {
    const user = authStore.auth?.user;
    
    // Allow access if user is Super Admin or has All Privileges
    if (user?.privileges?.includes("All Privileges") || user?.roleName === 'Super Admin') {
      return true;
    }

    // Check privileges for the nav item
    if (nav.privilage) {
      const userPrivileges = user?.privileges || [];
      return nav.privilage.some(priv => userPrivileges.includes(`ROLE_${priv}`));
    }

    // If no privileges specified, show the nav item
    return true;
  });
});

// Group filtered navs by type
const grouped = computed(() => {
  return Object.groupBy(filteredNavs.value, (el) => el.type);
});

provide("search", search.value);
watch(
  () => search.value,
  () => {
    console.log("search updated:", search.value);
  }
);

const isDropdownOpen = (navPath) => openDropdowns.value.has(navPath);

const isRouteActive = (navPath) => {
  if (navPath === '/') return false;
  
  const currentPath = route.path.toLowerCase();
  const baseNavPath = navPath.toLowerCase();

  // Default case - check if current path starts with the nav path
  return currentPath === baseNavPath || 
         (baseNavPath !== '/' && currentPath.startsWith(baseNavPath + '/'));
};

// Check if a nav item should be visible based on privileges
const shouldShowNavItem = (nav) => {
  const user = authStore.auth?.user;
  
  // Always show if user is Super Admin or has All Privileges
  if (user?.privileges?.includes("All Privileges") || user?.roleName === 'Super Admin') {
    return true;
  }

  // Check privileges for the nav item and its children
  if (nav.privilage || (nav.children && nav.children.some(child => child.privilage))) {
    const userPrivileges = user?.privileges || [];
    const navPrivileges = nav.privilage || [];
    const childrenPrivileges = nav.children?.flatMap(child => child.privilage || []) || [];
    
    return [...navPrivileges, ...childrenPrivileges].some(priv => 
      userPrivileges.includes(`ROLE_${priv}`)
    );
  }

  return true;
};
</script>

<template>
  <div class="flex h-full w-full overflow-hidden rounded-lg">
    <!-- Mobile Menu Button -->
    <button 
      @click="toggleMobileMenu"
      class="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-white shadow-lg border border-amber-200"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-5 w-5 text-amber-700 transition-transform duration-300" 
        :class="{ 'rotate-90': isMobileMenuOpen }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Sidebar -->
    <div 
      class="__scrollable-hidden fixed lg:relative w-full sm:w-80 lg:w-[20%] border-r text-amber-50 bg-gradient-to-b from-amber-800 to-amber-900 overflow-y-scroll h-full transition-transform duration-300 ease-in-out z-40 shadow-xl"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !isMobileMenuOpen,
        'translate-x-0': isMobileMenuOpen 
      }"
    >
      <!-- Logo Header -->
      <div class="p-4 px-6 h-20 flex gap-4 items-center sticky top-0 bg-amber-900 z-10 border-b border-amber-700/30">
        <div 
          v-html="icons.logo" 
          class="w-48 h-36 flex items-center text-amber-100"
        ></div>

        <!-- Close button for mobile -->
        <button 
          @click="toggleMobileMenu"
          class="lg:hidden ml-auto p-1 rounded hover:bg-amber-800/50 text-amber-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <div class="flex flex-col justify-start p-4 px-6 gap-6 pb-20">
        <!-- Loop through grouped navigation items -->
        <div v-for="(navItems, category) in grouped" :key="category" class="flex flex-col gap-3">
          <!-- Category Header -->
          <h3 class="text-xs font-semibold opacity-70 uppercase tracking-wider pt-4 first:pt-0 text-amber-300/70">{{ category }}</h3>
          
          <!-- Navigation Items -->
          <div v-for="nav in navItems" :key="nav.name" class="flex flex-col">
            <!-- Parent Nav Item -->
            <div v-if="shouldShowNavItem(nav)" 
                 class="flex rounded-lg transition-all duration-200 ease-linear hover:bg-amber-700/50"
                 :class="{ 
                   'bg-amber-700/30 text-amber-100': isRouteActive(nav.path)
                 }">
              <RouterLink
                v-if="!nav.children"
                :to="nav.path"
                class="w-full rounded-lg"
                :class="{
                  'bg-amber-600 text-white shadow-md': isRouteActive(nav.path),
                  'router-link-active': isRouteActive(nav.path)
                }"
                @click="isMobileMenuOpen = false"
              >
                <div class="w-full flex gap-3 items-center px-4 py-3 rounded-lg">
                  <div class="grid place-items-center w-5 h-5 flex-shrink-0">
                    <span v-html="nav.icon" class="w-5 h-5" />
                  </div>
                  <span class="text-sm font-medium truncate">{{ nav.name }}</span>
                </div>
              </RouterLink>
              
              <!-- Dropdown Toggle Button -->
              <div
                v-else
                class="flex-1 flex justify-between items-center px-4 py-3 cursor-pointer rounded-lg"
                :class="{
                  'bg-amber-600 text-white shadow-md': isRouteActive(nav.path),
                  'hover:bg-amber-700/50': !isRouteActive(nav.path)
                }"
                @click.stop="(event) => toggleDropdown(nav.path, event)"
              >
                <div class="flex gap-3 items-center">
                  <div class="grid place-items-center w-5 h-5 flex-shrink-0">
                    <span v-html="nav.icon" class="w-5 h-5" />
                  </div>
                  <span class="text-sm font-medium truncate">{{ nav.name }}</span>
                </div>
                <i
                  class="transition-transform duration-200 w-4 h-4 flex-shrink-0"
                  :class="{ 'rotate-180': isDropdownOpen(nav.path) }"
                  v-html="icons.down"
                />
              </div>
            </div>

            <!-- Child Nav Items -->
            <div
              v-if="nav.children"
              class="overflow-hidden transition-all duration-300 ease-in-out mt-2"
              :style="{ 
                height: isDropdownOpen(nav.path) ? `${nav.children.length * 44}px` : '0px'
              }"
            >
              <RouterLink
                v-for="child in nav.children"
                :key="child.name"
                :to="child.path"
                class="block ml-8 text-left child-link h-11 flex items-center rounded-lg"
                :class="{
                  'bg-amber-600 text-white shadow-md': isRouteActive(child.path),
                  'router-link-active': isRouteActive(child.path)
                }"
                @click="isMobileMenuOpen = false"
              >
                <div 
                  class="flex items-center w-full justify-start text-left px-4 py-2 hover:bg-amber-700/50 cursor-pointer rounded-lg transition-colors text-amber-100"
                  :class="{
                    'bg-amber-600 text-white': isRouteActive(child.path),
                    'font-semibold': isRouteActive(child.path)
                  }"
                >
                  <span class="text-sm">{{ child.name }}</span>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      @click="toggleMobileMenu"
    ></div>

    <!-- Main content -->
    <div class="flex flex-col w-full lg:w-[80%] min-h-screen">
      <!-- Navbar -->
      <div class="navbar-height flex items-center px-4 sm:px-6 py-2 bg-white border-b border-amber-200">
        <NavBar 
          v-model="search" 
          class="w-full" 
          :title="$route.name"
        />
      </div>
      
      <!-- Main Content Area -->
      <div class="__scrollable-hidden flex-1 bg-stone-50 overflow-y-auto">
        <div class="p-4 sm:p-6">
          <RouterView :search="search" :inputData="inputData" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but maintain functionality */
.__scrollable-hidden {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.__scrollable-hidden::-webkit-scrollbar {
  display: none;
}

/* Mobile-specific styles */
@media (max-width: 1024px) {
  .navbar-height {
    padding-left: 4rem; /* Space for mobile menu button */
  }
}

/* Active route styling */
.__scrollable-hidden .router-link-active {
  background-color: #D97706 !important; /* amber-600 */
  color: white !important;
}

.__scrollable-hidden .router-link-active .nav-button {
  background-color: transparent !important;
}

.__scrollable-hidden .router-link-active span {
  font-weight: 600;
}

/* Child link styling */
.child-link {
  transition: all 0.2s ease !important;
}

/* Add touch scrolling for mobile */
@media (max-width: 1024px) {
  .__scrollable-hidden {
    -webkit-overflow-scrolling: touch;
  }
}

/* Responsive sidebar adjustments */
@media (max-width: 640px) {
  .navbar-height {
    padding-left: 3.5rem;
  }
}

/* Ensure proper mobile menu positioning */
@media (max-width: 1024px) {
  .fixed.z-40 {
    top: 0;
    left: 0;
    bottom: 0;
  }
}
</style>