<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import OrderApi from "../api/buyerApi";
import { useAuth } from "@/stores/auth";

const router = useRouter();
const auth = useAuth();

  const userUuid = auth.auth?.user?.userUuid;
console.log(userUuid);

// Order status tabs (matching your backend status values)
const statusTabs = ['All', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const activeStatus = ref('All');

// Pagination
const currentPage = ref(0);
const pageSize = ref(10);
const totalPages = ref(0);
const totalElements = ref(0);

// Loading state
const isLoading = ref(true);
const error = ref(null);

// Orders data
const orders = ref([]);

// Fetch orders on component mount
onMounted(async () => {
  await fetchBuyerOrders();
});

// Function to fetch buyer orders
async function fetchBuyerOrders(page = 0) {
  if (!userUuid) {
    error.value = 'User not authenticated';
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await OrderApi.getBuyerOrders(
      userUuid,
      page,
      pageSize.value
    );

    // Handle paginated response from Spring Boot
    orders.value = response.data.content || [];
    currentPage.value = response.data.number || 0;
    totalPages.value = response.data.totalPages || 0;
    totalElements.value = response.data.totalElements || 0;
    
  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = err.response?.data?.message || 'Failed to load orders. Please try again.';
    
  } finally {
    isLoading.value = false;
  }
}

// Function to fetch single order details
async function getOrder(orderUuid) {
  try {
    const response = await OrderApi.getOrderByUuid(
      orderUuid,
      userUuid
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching order details:', err);
    throw err;
  }
}

// Function to cancel order
async function cancelOrder(orderUuid) {
  if (!confirm('Are you sure you want to cancel this order?')) {
    return;
  }
  
  try {
    const response = await OrderApi.cancelOrder(
      orderUuid,
      userUuid
    );
    
    // Refresh orders after cancellation
    await fetchBuyerOrders(currentPage.value);
    
    // Show success message
    alert('Order cancelled successfully');
    return response.data;
    
  } catch (err) {
    console.error('Error cancelling order:', err);
    alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    throw err;
  }
}

// Function to process payment
async function processPayment(orderUuid, transactionId) {
  try {
    const response = await OrderApi.processPayment(
      orderUuid,
      userUuid,
      transactionId
    );
    
    // Refresh orders after payment
    await fetchBuyerOrders(currentPage.value);
    
    // Show success message
    alert('Payment processed successfully');
    return response.data;
    
  } catch (err) {
    console.error('Error processing payment:', err);
    alert(err.response?.data?.message || 'Failed to process payment. Please try again.');
    throw err;
  }
}


// Helper function to format order number
function formatOrderNumber(uuid) {
  return uuid ? uuid.substring(0, 8).toUpperCase() : 'N/A';
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Helper function to format currency
function formatCurrency(amount) {
  return amount?.toLocaleString() || '0';
}

// Filter orders by status (client-side filtering)
const filteredOrders = computed(() => {
  if (activeStatus.value === 'All') return orders.value;
  return orders.value.filter(order => order.orderStatus === activeStatus.value);
});

// Navigation functions
function viewOrderDetails(orderUuid) {
  router.push(`/buyer/orders/${orderUuid}`);
}

function trackOrder(orderUuid) {
  router.push(`/buyer/orders/${orderUuid}/track`);
}

// Pagination functions
function goToPage(page) {
  if (page >= 0 && page < totalPages.value) {
    fetchBuyerOrders(page);
  }
}

// Status color functions
function getStatusColor(status) {
  switch(status) {
    case 'DELIVERED': return 'text-green-600 bg-green-100';
    case 'CONFIRMED': return 'text-blue-600 bg-blue-100';
    case 'SHIPPED': return 'text-purple-600 bg-purple-100';
    case 'PENDING': return 'text-yellow-600 bg-yellow-100';
    case 'CANCELLED': return 'text-red-600 bg-red-100';
    default: return 'text-stone-600 bg-stone-100';
  }
}

function getPaymentStatusColor(status) {
  switch(status) {
    case 'PAID': 
    case 'COMPLETED': 
      return 'text-green-600 bg-green-100';
    case 'PENDING': 
      return 'text-yellow-600 bg-yellow-100';
    case 'FAILED': 
    case 'CANCELLED': 
      return 'text-red-600 bg-red-100';
    default: 
      return 'text-stone-600 bg-stone-100';
  }
}

function getPaymentMethodIcon(method) {
  switch(method?.toUpperCase()) {
    case 'TELEBIRR': return '📱';
    case 'CBE BIRR': return '💳';
    case 'BANK_TRANSFER':
    case 'BANK TRANSFER': return '🏦';
    case 'CASH_ON_DELIVERY':
    case 'COD': return '💵';
    default: return '💰';
  }
}

function getPaymentMethodDisplay(method) {
  if (!method) return 'N/A';
  return method.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Check if order can be cancelled
function canCancelOrder(status) {
  return status === 'PENDING';
}

// Check if payment can be processed
function canProcessPayment(status) {
  return status === 'PENDING';
}
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">My Orders</h1>
        <p class="text-stone-600">Track and manage your oxen purchases</p>
        <p v-if="totalElements > 0" class="text-sm text-stone-500 mt-2">
          Total orders: {{ totalElements }}
        </p>
      </div>

      <!-- Authentication Error -->
      <div v-if="!userUuid" class="text-center py-16 bg-white rounded-xl">
        <span class="text-6xl block mb-4">🔒</span>
        <h3 class="text-xl font-medium text-stone-800 mb-2">Not Authenticated</h3>
        <p class="text-stone-500 mb-6">Please log in to view your orders</p>
        <router-link 
          to="/login" 
          class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Login
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div>
        <p class="text-stone-600">Loading your orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16 bg-white rounded-xl">
        <span class="text-6xl block mb-4">⚠️</span>
        <h3 class="text-xl font-medium text-stone-800 mb-2">Something went wrong</h3>
        <p class="text-stone-500 mb-6">{{ error }}</p>
        <button 
          @click="fetchBuyerOrders(0)"
          class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Try Again
        </button>
      </div>

      <template v-else>
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
          <div v-for="order in filteredOrders" :key="order.orderUuid" class="bg-white rounded-xl shadow-md overflow-hidden">
            <!-- Order Header with Payment Status -->
            <div class="bg-stone-50 px-6 py-4 border-b border-stone-200">
              <div class="flex flex-wrap justify-between items-center">
                <div>
                  <p class="text-sm text-stone-500">Order #{{ formatOrderNumber(order.orderUuid) }}</p>
                  <p class="text-sm text-stone-600">Placed on {{ formatDate(order.orderDate) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <!-- Order Status Badge -->
                  <span :class="['px-3 py-1 rounded-full text-sm', getStatusColor(order.orderStatus)]">
                    {{ order.orderStatus }}
                  </span>
                  <!-- Payment Status Badge -->
                  <span :class="['px-3 py-1 rounded-full text-sm flex items-center gap-1', getPaymentStatusColor(order.paymentStatus)]">
                    <span>{{ getPaymentMethodIcon(order.paymentMethod) }}</span>
                    {{ order.paymentStatus }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="px-6 py-4">
              <div v-for="(item, index) in order.items" :key="item.oxUuid || index" class="flex justify-between items-center py-2">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden">
                    <img 
                      v-if="item.oxImage" 
                      :src="item.oxImage" 
                      :alt="item.oxName"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-2xl flex items-center justify-center w-full h-full">🐂</span>
                  </div>
                  <div>
                    <p class="font-medium text-stone-800">{{ item.oxName }}</p>
                    <p class="text-sm text-stone-500">Breed: {{ item.oxBreed || 'N/A' }}</p>
                    <p class="text-sm text-stone-500">Seller: {{ item.sellerName || 'N/A' }}</p>
                    <p class="text-sm text-stone-500">Qty: {{ item.quantity }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium">{{ formatCurrency(item.priceAtPurchase) }} ETB</p>
                  <p class="text-sm text-stone-500">Subtotal: {{ formatCurrency(item.subtotal) }} ETB</p>
                </div>
              </div>
              
              <!-- Total Amount -->
              <div class="flex justify-between items-center pt-4 mt-2 border-t border-stone-200">
                <div>
                  <span class="font-medium text-stone-800">Total Amount:</span>
                  <p class="text-sm text-stone-500">Includes delivery fee: {{ formatCurrency(order.deliveryFee) }} ETB</p>
                </div>
                <span class="text-xl font-bold text-amber-600">{{ formatCurrency(order.total) }} ETB</span>
              </div>
            </div>

            <!-- Payment & Delivery Info -->
            <div class="px-6 pb-2 flex flex-wrap gap-3">
              <div class="flex items-center gap-2 text-sm text-stone-500 bg-stone-50 p-2 rounded-lg">
                <span>💳 Payment Method:</span>
                <span class="font-medium text-stone-700">{{ getPaymentMethodDisplay(order.paymentMethod) }}</span>
              </div>
              <div v-if="order.transactionId" class="flex items-center gap-2 text-sm text-stone-500 bg-stone-50 p-2 rounded-lg">
                <span>🔑 Transaction ID:</span>
                <span class="font-medium text-stone-700">{{ order.transactionId }}</span>
              </div>
            </div>

            <!-- Delivery Address Summary -->
            <div class="px-6 pb-2">
              <div class="text-sm text-stone-500 bg-stone-50 p-2 rounded-lg">
                <span>📍 Delivery to: </span>
                <span class="font-medium text-stone-700">{{ order.deliveryAddress.recipientName }}</span>
                <span class="text-stone-400"> • </span>
                <span class="text-stone-600">{{ order.deliveryAddress.address }}, {{ order.deliveryAddress.city }}</span>
              </div>
            </div>

            <!-- Order Footer -->
            <div class="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-wrap justify-between items-center">
              <div>
                <p class="text-sm text-stone-500">Estimated Delivery</p>
                <p class="font-medium text-stone-800">{{ formatDate(order.estimatedDeliveryDate) }}</p>
              </div>
              <div class="flex gap-3">
                <button 
                  @click="viewOrderDetails(order.orderUuid)"
                  class="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  View Details
                </button>
                <button 
                  v-if="canCancelOrder(order.orderStatus)"
                  @click="cancelOrder(order.orderUuid)"
                  class="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  @click="trackOrder(order.orderUuid)"
                  class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  :disabled="order.orderStatus === 'PENDING' || order.orderStatus === 'CANCELLED'"
                  :class="{ 'opacity-50 cursor-not-allowed': order.orderStatus === 'PENDING' || order.orderStatus === 'CANCELLED' }"
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 0"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
          >
            Previous
          </button>
          <span class="px-4 py-2">
            Page {{ currentPage + 1 }} of {{ totalPages }}
          </span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages - 1"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
          >
            Next
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="filteredOrders.length === 0" class="text-center py-16 bg-white rounded-xl">
          <span class="text-6xl block mb-4">📦</span>
          <h3 class="text-xl font-medium text-stone-800 mb-2">No orders found</h3>
          <p class="text-stone-500 mb-6">You haven't placed any {{ activeStatus !== 'All' ? activeStatus.toLowerCase() : '' }} orders yet</p>
          <router-link 
            to="/buyer/browse" 
            class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Browse Oxen
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>