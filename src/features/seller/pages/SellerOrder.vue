<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { toasted } from "@/utils/utils";
import ApiService from "@/service/ApiService";
import {useAuth} from "@/stores/auth"

const { t, locale } = useI18n();
const router = useRouter();
const api = new ApiService();
const BASE_URL = "/api/orders";
const auth = useAuth()

// Order status tabs - translated
const statusTabs = computed(() => [
  t('orders.tabs.all'),
  t('orders.status.pending'),
  t('orders.status.confirmed'),
  t('orders.status.processing'),
  t('orders.status.shipped'),
  t('orders.status.delivered'),
  t('orders.status.cancelled')
]);

const activeStatus = ref(t('orders.tabs.all'));

// Dynamic orders from backend
const orders = ref([]);

// Pagination info if needed
const currentPage = ref(0);
const totalPages = ref(0);

// Statistics
const stats = computed(() => {
  const total = orders.value.length;
  const pending = orders.value.filter(o => o.status === t('orders.status.pending')).length;
  const processing = orders.value.filter(o => 
    [t('orders.status.confirmed'), t('orders.status.processing'), t('orders.status.shipped')].includes(o.status)
  ).length;
  const completed = orders.value.filter(o => o.status === t('orders.status.delivered')).length;
  const revenue = orders.value
    .filter(o => o.status === t('orders.status.delivered'))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  
  return { total, pending, processing, completed, revenue };
});

// Filtered orders by status
const filteredOrders = computed(() => {
  if (activeStatus.value === t('orders.tabs.all')) return orders.value;
  return orders.value.filter(order => order.status === activeStatus.value);
});

// Modals and updates
const selectedOrder = ref(null);
const showOrderModal = ref(false);
const showUpdateStatusModal = ref(false);
const updateStatus = ref('');
const sellerNote = ref('');
const statusOptions = computed(() => [
  t('orders.status.pending'),
  t('orders.status.confirmed'),
  t('orders.status.processing'),
  t('orders.status.shipped'),
  t('orders.status.delivered'),
  t('orders.status.cancelled')
]);

// Seller UUID (from local storage / login session)
const userUuid = auth.auth?.user?.userUuid;

const fetchOrders = async (page = 0, size = 10) => {
  try {
    const response = await api.addAuthenticationHeader().get(`${BASE_URL}/seller/${userUuid}?page=${page}&size=${size}`);
    
    const rawOrders = response.data.content || [];
    orders.value = rawOrders.map(o => ({
      id: o.orderUuid,
      status: translateOrderStatus(o.orderStatus),
      paymentStatus: translatePaymentStatus(o.paymentStatus),
      totalAmount: o.total || 0,
      orderDate: new Date(o.orderDate).toLocaleString(locale.value === 'am' ? 'et' : 'en-US'),
      estimatedDelivery: new Date(o.estimatedDeliveryDate).toLocaleDateString(locale.value === 'am' ? 'et' : 'en-US'),
      buyer: {
        name: o.buyerName,
        phone: o.deliveryAddress?.phoneNumber || '',
        location: o.deliveryAddress?.address || ''
      },
      deliveryAddress: `${o.deliveryAddress?.address || ''}, ${o.deliveryAddress?.city || ''}, ${o.deliveryAddress?.subCity || ''}`,
      items: o.items.map(i => ({
        id: i.oxUuid,
        name: i.oxName,
        image: i.oxImage,
        quantity: i.quantity,
        price: i.priceAtPurchase || 0
      })),
      paymentMethod: o.paymentMethod || 'N/A',
      specialInstructions: o.notes || '',
      sellerNotes: o.sellerNotes || ''
    }));

    currentPage.value = response.data.number || 0;
    totalPages.value = response.data.totalPages || 1;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    toasted(false, t('orders.messages.loadError'));
  }
};

// Helper to translate order status from backend
function translateOrderStatus(backendStatus) {
  const statusMap = {
    'PENDING': t('orders.status.pending'),
    'CONFIRMED': t('orders.status.confirmed'),
    'PROCESSING': t('orders.status.processing'),
    'SHIPPED': t('orders.status.shipped'),
    'DELIVERED': t('orders.status.delivered'),
    'CANCELLED': t('orders.status.cancelled')
  };
  return statusMap[backendStatus] || backendStatus;
}

// Helper to translate payment status
function translatePaymentStatus(backendStatus) {
  const paymentMap = {
    'PAID': t('orders.payment.paid'),
    'PENDING': t('orders.payment.pending'),
    'FAILED': t('orders.payment.failed'),
    'REFUNDED': t('orders.payment.refunded')
  };
  return paymentMap[backendStatus] || backendStatus;
}

// View order details modal
function viewOrderDetails(order) {
  selectedOrder.value = order;
  showOrderModal.value = true;
}

// Close modals
function closeModal() {
  showOrderModal.value = false;
  showUpdateStatusModal.value = false;
  selectedOrder.value = null;
  updateStatus.value = '';
  sellerNote.value = '';
}

// Open update status modal
function openUpdateStatus(order) {
  selectedOrder.value = order;
  updateStatus.value = order.status;
  showUpdateStatusModal.value = true;
  showOrderModal.value = false;
}

// Update order status
async function updateOrderStatus() {
  if (!selectedOrder.value) return;
  try {
    const orderId = selectedOrder.value.id;

    // Map translated status back to backend format
    const statusMap = {
      [t('orders.status.pending')]: 'PENDING',
      [t('orders.status.confirmed')]: 'CONFIRMED',
      [t('orders.status.processing')]: 'PROCESSING',
      [t('orders.status.shipped')]: 'SHIPPED',
      [t('orders.status.delivered')]: 'DELIVERED',
      [t('orders.status.cancelled')]: 'CANCELLED'
    };

    await api.addAuthenticationHeader().put(`${BASE_URL}/${orderId}/status`, {
      status: statusMap[updateStatus.value] || updateStatus.value,
      sellerNote: sellerNote.value
    });

    // Update locally
    const orderIndex = orders.value.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = updateStatus.value;
      if (sellerNote.value) {
        orders.value[orderIndex].sellerNotes = sellerNote.value;
      }
    }

    toasted(true, t('orders.messages.updateSuccess', { id: orderId, status: updateStatus.value }));
    closeModal();
  } catch (error) {
    console.error("Failed to update order:", error);
    toasted(false, t('orders.messages.updateError'));
  }
}

// Contact buyer
function contactBuyer(buyer) {
  router.push(`/messages?user=${buyer.phone}`);
}

// Print invoice
function printInvoice(order) {
  toasted(true, t('orders.messages.printInvoice'));
}

// Status colors
function getStatusColor(status) {
  const statusKey = Object.keys(statusMap).find(key => statusMap[key] === status) || status;
  
  switch(statusKey?.toUpperCase()) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-700';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
    case 'PROCESSING': return 'bg-purple-100 text-purple-700';
    case 'SHIPPED': return 'bg-indigo-100 text-indigo-700';
    case 'DELIVERED': return 'bg-green-100 text-green-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-stone-100 text-stone-700';
  }
}

function getPaymentStatusColor(status) {
  switch(status) {
    case t('orders.payment.paid'): return 'bg-green-100 text-green-700';
    case t('orders.payment.pending'): return 'bg-yellow-100 text-yellow-700';
    case t('orders.payment.failed'): return 'bg-red-100 text-red-700';
    case t('orders.payment.refunded'): return 'bg-purple-100 text-purple-700';
    default: return 'bg-stone-100 text-stone-700';
  }
}

// Status mapping for backend
const statusMap = {
  'PENDING': t('orders.status.pending'),
  'CONFIRMED': t('orders.status.confirmed'),
  'PROCESSING': t('orders.status.processing'),
  'SHIPPED': t('orders.status.shipped'),
  'DELIVERED': t('orders.status.delivered'),
  'CANCELLED': t('orders.status.cancelled')
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

// On mounted, fetch orders
onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="min-h-screen bg-stone-50" :lang="locale">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">{{ t('orders.title') }}</h1>
        <p class="text-stone-600">{{ t('orders.subtitle') }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <p class="text-2xl font-bold text-amber-600">{{ stats.total }}</p>
          <p class="text-xs text-stone-500">{{ t('orders.stats.total') }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
          <p class="text-xs text-stone-500">{{ t('orders.stats.pending') }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ stats.processing }}</p>
          <p class="text-xs text-stone-500">{{ t('orders.stats.processing') }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.completed }}</p>
          <p class="text-xs text-stone-500">{{ t('orders.stats.completed') }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-md p-4 text-center">
          <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(stats.revenue) }}</p>
          <p class="text-xs text-stone-500">{{ t('orders.stats.revenue') }}</p>
        </div>
      </div>

      <!-- Status Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="tab in statusTabs"
          :key="tab"
          @click="activeStatus = tab"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeStatus === tab
              ? 'bg-amber-600 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100'
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Orders List -->
      <div class="space-y-4">
        <div v-for="order in filteredOrders" :key="order.id" 
             class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          
          <!-- Order Header -->
          <div class="bg-stone-50 px-6 py-4 border-b border-stone-200">
            <div class="flex flex-wrap justify-between items-center">
              <div>
                <p class="text-sm text-stone-500">{{ t('orders.orderId') }} #{{ order.id }}</p>
                <p class="text-sm text-stone-600">{{ t('orders.placedOn') }} {{ order.orderDate }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span :class="['px-3 py-1 rounded-full text-sm', getStatusColor(order.status)]">
                  {{ order.status }}
                </span>
                <span :class="['px-3 py-1 rounded-full text-sm', getPaymentStatusColor(order.paymentStatus)]">
                  {{ order.paymentStatus }}
                </span>
              </div>
            </div>
          </div>

          <!-- Buyer Info & Items -->
          <div class="p-6">
            <div class="flex flex-col sm:flex-row gap-6">
              <!-- Buyer Details -->
              <div class="sm:w-1/3">
                <h3 class="font-medium text-stone-800 mb-2">{{ t('orders.buyerInfo') }}</h3>
                <div class="space-y-2 text-sm">
                  <p><span class="text-stone-500">{{ t('orders.name') }}:</span> {{ order.buyer.name }}</p>
                  <p><span class="text-stone-500">{{ t('orders.phone') }}:</span> {{ order.buyer.phone }}</p>
                  <p><span class="text-stone-500">{{ t('orders.location') }}:</span> {{ order.buyer.location }}</p>
                  <p><span class="text-stone-500">{{ t('orders.delivery') }}:</span> {{ order.deliveryAddress }}</p>
                </div>
              </div>

              <!-- Order Items -->
              <div class="sm:w-1/3">
                <h3 class="font-medium text-stone-800 mb-2">{{ t('orders.items') }}</h3>
                <div v-for="item in order.items" :key="item.id" 
                     class="flex items-center gap-3 mb-2">
                  <span class="text-2xl">
                    <img :src="item.image" :alt="item.name" class="w-8 h-8 object-cover rounded">
                  </span>
                  <div>
                    <p class="font-medium">{{ item.name }}</p>
                    <p class="text-sm text-stone-500">
                      {{ t('orders.qty') }}: {{ item.quantity }} × {{ formatCurrency(item.price) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="sm:w-1/3">
                <h3 class="font-medium text-stone-800 mb-2">{{ t('orders.summary') }}</h3>
                <div class="space-y-2 text-sm">
                  <p><span class="text-stone-500">{{ t('orders.paymentMethod') }}:</span> {{ order.paymentMethod }}</p>
                  <p><span class="text-stone-500">{{ t('orders.estimatedDelivery') }}:</span> {{ order.estimatedDelivery }}</p>
                  <p class="pt-2 border-t border-stone-200">
                    <span class="font-medium">{{ t('orders.total') }}:</span>
                    <span class="text-lg font-bold text-amber-600 ml-2">
                      {{ formatCurrency(order.totalAmount) }}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Special Instructions -->
            <div v-if="order.specialInstructions" class="mt-4 p-3 bg-stone-50 rounded-lg">
              <p class="text-sm text-stone-600">
                <span class="font-medium">{{ t('orders.noteFromBuyer') }}:</span> {{ order.specialInstructions }}
              </p>
            </div>

            <!-- Seller Notes -->
            <div v-if="order.sellerNotes" class="mt-2 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-600">
                <span class="font-medium">{{ t('orders.yourNote') }}:</span> {{ order.sellerNotes }}
              </p>
            </div>
          </div>

          <!-- Order Footer Actions -->
          <div class="bg-stone-50 px-6 py-4 border-t border-stone-200">
            <div class="flex flex-wrap justify-end gap-3">
              <button @click="contactBuyer(order.buyer)"
                      class="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50">
                💬 {{ t('orders.actions.contact') }}
              </button>
              <button @click="printInvoice(order)"
                      class="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100">
                🖨️ {{ t('orders.actions.invoice') }}
              </button>
              <button @click="viewOrderDetails(order)"
                      class="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50">
                📋 {{ t('orders.actions.details') }}
              </button>
              <button @click="openUpdateStatus(order)"
                      class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                {{ t('orders.actions.updateStatus') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="text-center py-16 bg-white rounded-xl">
        <span class="text-6xl block mb-4">📦</span>
        <h3 class="text-xl font-medium text-stone-800 mb-2">{{ t('orders.empty.title') }}</h3>
        <p class="text-stone-500 mb-6">
          {{ activeStatus !== t('orders.tabs.all') ? t('orders.empty.noStatus', { status: activeStatus.toLowerCase() }) : t('orders.empty.noOrders') }}
        </p>
        <router-link to="/seller/oxen" class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          {{ t('orders.actions.manageOxen') }}
        </router-link>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderModal && selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 class="text-xl font-serif text-stone-800">{{ t('orders.modal.details') }} #{{ selectedOrder.id }}</h3>
          <button @click="closeModal" class="text-stone-400 hover:text-stone-600">✕</button>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Order Status -->
          <div class="flex gap-4">
            <div>
              <p class="text-sm text-stone-500">{{ t('orders.modal.orderStatus') }}</p>
              <span :class="['px-3 py-1 rounded-full text-sm inline-block mt-1', getStatusColor(selectedOrder.status)]">
                {{ selectedOrder.status }}
              </span>
            </div>
            <div>
              <p class="text-sm text-stone-500">{{ t('orders.modal.paymentStatus') }}</p>
              <span :class="['px-3 py-1 rounded-full text-sm inline-block mt-1', getPaymentStatusColor(selectedOrder.paymentStatus)]">
                {{ selectedOrder.paymentStatus }}
              </span>
            </div>
          </div>

          <!-- Buyer Details -->
          <div>
            <h4 class="font-medium text-stone-800 mb-2">{{ t('orders.modal.buyerInfo') }}</h4>
            <div class="bg-stone-50 p-4 rounded-lg grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-stone-500">{{ t('orders.name') }}</p>
                <p class="font-medium">{{ selectedOrder.buyer.name }}</p>
              </div>
              <div>
                <p class="text-xs text-stone-500">{{ t('orders.phone') }}</p>
                <p class="font-medium">{{ selectedOrder.buyer.phone }}</p>
              </div>
              <div>
                <p class="text-xs text-stone-500">{{ t('orders.location') }}</p>
                <p class="font-medium">{{ selectedOrder.buyer.location }}</p>
              </div>
              <div>
                <p class="text-xs text-stone-500">{{ t('orders.deliveryAddress') }}</p>
                <p class="font-medium">{{ selectedOrder.deliveryAddress }}</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div>
            <h4 class="font-medium text-stone-800 mb-2">{{ t('orders.modal.itemsOrdered') }}</h4>
            <div class="space-y-3">
              <div v-for="item in selectedOrder.items" :key="item.id" 
                   class="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <img :src="item.image" :alt="item.name" class="w-10 h-10 object-cover rounded">
                  <div>
                    <p class="font-medium">{{ item.name }}</p>
                    <p class="text-sm text-stone-500">{{ t('orders.qty') }}: {{ item.quantity }}</p>
                  </div>
                </div>
                <p class="font-bold">{{ formatCurrency(item.price * item.quantity) }}</p>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div>
            <h4 class="font-medium text-stone-800 mb-2">{{ t('orders.modal.paymentInfo') }}</h4>
            <div class="bg-stone-50 p-4 rounded-lg grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-stone-500">{{ t('orders.paymentMethod') }}</p>
                <p class="font-medium">{{ selectedOrder.paymentMethod }}</p>
              </div>
              <div>
                <p class="text-xs text-stone-500">{{ t('orders.totalAmount') }}</p>
                <p class="font-bold text-amber-600">{{ formatCurrency(selectedOrder.totalAmount) }}</p>
              </div>
            </div>
          </div>

          <!-- Delivery Info -->
          <div>
            <h4 class="font-medium text-stone-800 mb-2">{{ t('orders.modal.deliveryInfo') }}</h4>
            <div class="bg-stone-50 p-4 rounded-lg">
              <p><span class="text-stone-500">{{ t('orders.estimatedDelivery') }}:</span> {{ selectedOrder.estimatedDelivery }}</p>
              <p v-if="selectedOrder.specialInstructions" class="mt-2">
                <span class="text-stone-500">{{ t('orders.specialInstructions') }}:</span><br>
                {{ selectedOrder.specialInstructions }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button @click="closeModal"
                    class="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50">
              {{ t('common.close') }}
            </button>
            <button @click="openUpdateStatus(selectedOrder)"
                    class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              {{ t('orders.actions.updateStatus') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="showUpdateStatusModal && selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h3 class="text-xl font-serif text-stone-800 mb-4">{{ t('orders.modal.updateTitle') }}</h3>
        
        <div class="space-y-4">
          <!-- Order Info -->
          <p class="text-sm text-stone-600">{{ t('orders.orderId') }} #{{ selectedOrder.id }}</p>
          
          <!-- Status Select -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">{{ t('orders.modal.newStatus') }}</label>
            <select v-model="updateStatus" 
                    class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <!-- Seller Notes -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">{{ t('orders.modal.addNote') }}</label>
            <textarea v-model="sellerNote" rows="3"
                      :placeholder="t('orders.modal.notePlaceholder')"
                      class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeModal"
                  class="flex-1 py-2 border border-stone-300 rounded-lg hover:bg-stone-50">
            {{ t('common.cancel') }}
          </button>
          <button @click="updateOrderStatus"
                  class="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
            {{ t('common.update') }}
          </button>
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

img {
  max-width: 100%;
  height: auto;
}
</style>