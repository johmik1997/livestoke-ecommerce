<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/stores/auth";
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuth();

// Statistics with translated labels
const stats = computed(() => [
  { label: t('dashboard.stats.totalOxen'), value: 24, icon: "🐂", change: t('dashboard.stats.thisMonth', { count: 3 }), color: "amber" },
  { label: t('dashboard.stats.ordersReceived'), value: 156, icon: "📦", change: t('dashboard.stats.thisWeek', { count: 28 }), color: "blue" },
  { label: t('dashboard.stats.totalRevenue'), value: "₿ 2.4M", icon: "💰", change: "+18.5%", color: "purple" },
  { label: t('dashboard.stats.activeListings'), value: 18, icon: "📋", change: t('dashboard.stats.thisMonth', { count: 2 }), color: "green" },
]);

// Recent orders with translated status
const recentOrders = ref([
  { id: "ORD-001", buyer: "Birhane A.", ox: "Borana Bull", amount: 45000, status: "Pending", date: "2024-03-10" },
  { id: "ORD-002", buyer: "Tigist M.", ox: "Sahiwal Cow", amount: 35000, status: "Confirmed", date: "2024-03-09" },
  { id: "ORD-003", buyer: "Alemu K.", ox: "Ogaden Ox", amount: 55000, status: "Shipped", date: "2024-03-08" },
  { id: "ORD-004", buyer: "Meron T.", ox: "Fogera Bull", amount: 48000, status: "Delivered", date: "2024-03-07" },
]);

// Top performing oxen
const topOxen = ref([
  { name: "Borana Bull", views: 245, inquiries: 28, sold: 5, revenue: 225000 },
  { name: "Sahiwal Cow", views: 189, inquiries: 21, sold: 4, revenue: 140000 },
  { name: "Ogaden Ox", views: 156, inquiries: 15, sold: 3, revenue: 165000 },
  { name: "Fogera Bull", views: 198, inquiries: 18, sold: 4, revenue: 192000 },
]);

// Performance metrics
const performance = ref({
  responseRate: 98,
  avgResponseTime: "2.5 hrs",
  completionRate: 96,
  rating: 4.8
});

// Quick actions
function quickAction(action) {
  switch(action) {
    case 'add':
      router.push('/seller/oxen/add');
      break;
    case 'orders':
      router.push('/seller/orders');
      break;
    case 'analytics':
      router.push('/seller/analytics');
      break;
    case 'messages':
      router.push('/messages');
      break;
  }
}

// Status color mapping
function getStatusColor(status) {
  switch(status) {
    case 'Pending': return 'bg-yellow-100 text-yellow-700';
    case 'Confirmed': return 'bg-blue-100 text-blue-700';
    case 'Shipped': return 'bg-purple-100 text-purple-700';
    case 'Delivered': return 'bg-green-100 text-green-700';
    case 'Processing': return 'bg-indigo-100 text-indigo-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-stone-100 text-stone-700';
  }
}

// Translated status
const translatedStatus = (status) => {
  return t(`order.status.${status.toLowerCase()}`);
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat(locale.value === 'am' ? 'et' : 'en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Welcome message with user name
const welcomeMessage = computed(() => {
  const name = auth.auth?.user?.name || t('dashboard.seller');
  return t('dashboard.welcome', { name });
});

// Pending orders count
const pendingOrdersCount = computed(() => {
  return recentOrders.value.filter(o => o.status === 'Pending').length;
});
</script>

<template>
  <div class="min-h-screen bg-stone-50" :lang="locale">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">{{ t('dashboard.title') }}</h1>
        <p class="text-stone-600">{{ welcomeMessage }}</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button @click="quickAction('add')" 
                class="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3 border-l-4 border-amber-600 group">
          <span class="text-3xl group-hover:scale-110 transition-transform">➕</span>
          <div class="text-left">
            <p class="font-medium text-stone-800">{{ t('dashboard.quickActions.add.title') }}</p>
            <p class="text-sm text-stone-500">{{ t('dashboard.quickActions.add.description') }}</p>
          </div>
        </button>
        
        <button @click="quickAction('orders')" 
                class="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3 border-l-4 border-blue-600 group">
          <span class="text-3xl group-hover:scale-110 transition-transform">📦</span>
          <div class="text-left">
            <p class="font-medium text-stone-800">{{ t('dashboard.quickActions.orders.title') }}</p>
            <p class="text-sm text-stone-500">{{ t('dashboard.quickActions.orders.description', { count: pendingOrdersCount }) }}</p>
          </div>
        </button>

        <button @click="quickAction('analytics')" 
                class="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3 border-l-4 border-purple-600 group">
          <span class="text-3xl group-hover:scale-110 transition-transform">📊</span>
          <div class="text-left">
            <p class="font-medium text-stone-800">{{ t('dashboard.quickActions.analytics.title') }}</p>
            <p class="text-sm text-stone-500">{{ t('dashboard.quickActions.analytics.description') }}</p>
          </div>
        </button>

        <button @click="quickAction('messages')" 
                class="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3 border-l-4 border-green-600 group">
          <span class="text-3xl group-hover:scale-110 transition-transform">💬</span>
          <div class="text-left">
            <p class="font-medium text-stone-800">{{ t('dashboard.quickActions.messages.title') }}</p>
            <p class="text-sm text-stone-500">{{ t('dashboard.quickActions.messages.description') }}</p>
          </div>
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <span class="text-3xl">{{ stat.icon }}</span>
            <span :class="`text-xs px-2 py-1 bg-${stat.color}-100 text-${stat.color}-700 rounded-full`">
              {{ stat.change }}
            </span>
          </div>
          <p class="text-2xl font-bold text-stone-800">{{ stat.value }}</p>
          <p class="text-sm text-stone-500">{{ stat.label }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Orders -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-medium text-stone-800">{{ t('dashboard.recentOrders.title') }}</h2>
            <router-link to="/seller/orders" class="text-sm text-amber-600 hover:text-amber-700">
              {{ t('dashboard.recentOrders.viewAll') }} →
            </router-link>
          </div>
          
          <div class="space-y-4">
            <div v-for="order in recentOrders" :key="order.id" 
                 class="flex items-center justify-between p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
              <div>
                <p class="font-medium text-stone-800">{{ order.ox }}</p>
                <p class="text-sm text-stone-500">{{ t('dashboard.recentOrders.buyer') }}: {{ order.buyer }}</p>
                <p class="text-xs text-stone-400">{{ order.date }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-amber-600">{{ formatCurrency(order.amount) }}</p>
                <span :class="['px-2 py-1 rounded-full text-xs', getStatusColor(order.status)]">
                  {{ translatedStatus(order.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-lg font-medium text-stone-800 mb-6">{{ t('dashboard.performance.title') }}</h2>
          
          <div class="space-y-6">
            <!-- Response Rate -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-stone-600">{{ t('dashboard.performance.responseRate') }}</span>
                <span class="font-bold text-amber-600">{{ performance.responseRate }}%</span>
              </div>
              <div class="w-full bg-stone-200 rounded-full h-2">
                <div class="bg-amber-600 h-2 rounded-full" :style="{ width: performance.responseRate + '%' }"></div>
              </div>
            </div>
            
            <!-- Avg Response Time -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-stone-600">{{ t('dashboard.performance.avgResponseTime') }}</span>
                <span class="font-bold text-amber-600">{{ performance.avgResponseTime }}</span>
              </div>
            </div>
            
            <!-- Completion Rate -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-stone-600">{{ t('dashboard.performance.completionRate') }}</span>
                <span class="font-bold text-amber-600">{{ performance.completionRate }}%</span>
              </div>
              <div class="w-full bg-stone-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" :style="{ width: performance.completionRate + '%' }"></div>
              </div>
            </div>
            
            <!-- Rating -->
            <div class="pt-4 border-t border-stone-200">
              <div class="flex items-center justify-between">
                <span class="text-stone-600">{{ t('dashboard.performance.rating') }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-bold text-amber-600">{{ performance.rating }}</span>
                  <span class="text-yellow-400">⭐</span>
                </div>
              </div>
              <p class="text-xs text-stone-500 mt-1">{{ t('dashboard.performance.basedOnReviews', { count: 128 }) }}</p>
            </div>
          </div>
        </div>

        <!-- Top Performing Oxen -->
        <div class="lg:col-span-3 bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 class="text-lg font-medium text-stone-800 mb-6">{{ t('dashboard.topOxen.title') }}</h2>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-sm text-stone-500 border-b border-stone-200">
                  <th class="pb-3">{{ t('dashboard.topOxen.columns.name') }}</th>
                  <th class="pb-3">{{ t('dashboard.topOxen.columns.views') }}</th>
                  <th class="pb-3">{{ t('dashboard.topOxen.columns.inquiries') }}</th>
                  <th class="pb-3">{{ t('dashboard.topOxen.columns.sold') }}</th>
                  <th class="pb-3">{{ t('dashboard.topOxen.columns.revenue') }}</th>
                  <th class="pb-3">{{ t('dashboard.topOxen.columns.conversion') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ox in topOxen" :key="ox.name" class="border-b border-stone-100 hover:bg-stone-50">
                  <td class="py-3 font-medium">{{ ox.name }}</td>
                  <td class="py-3">{{ ox.views.toLocaleString() }}</td>
                  <td class="py-3">{{ ox.inquiries }}</td>
                  <td class="py-3">{{ ox.sold }}</td>
                  <td class="py-3 font-bold text-amber-600">{{ formatCurrency(ox.revenue) }}</td>
                  <td class="py-3">
                    <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {{ ((ox.sold / ox.views) * 100).toFixed(1) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Amharic text support */
:lang(am) {
  font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', sans-serif;
}
</style>