<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header with search and filter -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-serif text-stone-800 mb-4">Track Your Orders</h1>
        
        <!-- Search and Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by order ID, ox name, or seller..."
              class="w-full px-4 py-3 pl-12 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <span class="absolute left-4 top-3.5 text-stone-400">🔍</span>
          </div>
          
          <div class="flex gap-2">
            <select
              v-model="statusFilter"
              class="px-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[140px]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              v-model="dateFilter"
              class="px-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[140px]"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="space-y-6">
        <div v-if="filteredOrders.length === 0" class="text-center py-12">
          <span class="text-6xl mb-4 block">📦</span>
          <h3 class="text-xl font-medium text-stone-700 mb-2">No orders found</h3>
          <p class="text-stone-500">Try adjusting your search or filter criteria</p>
        </div>

        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <!-- Order Header -->
          <div class="p-6 border-b border-stone-100">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-stone-800">Order #{{ order.orderId }}</h3>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      statusClasses[order.status]
                    ]"
                  >
                    {{ order.status }}
                  </span>
                </div>
                <p class="text-sm text-stone-500">
                  Placed on {{ formatDate(order.orderDate) }} • 
                  <span class="text-amber-600 font-medium">{{ order.totalAmount }} ETB</span>
                </p>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="viewOrderDetails(order.id)"
                  class="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  v-if="order.status === 'delivered'"
                  @click="leaveReview(order)"
                  class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                >
                  Leave Review
                </button>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="divide-y divide-stone-100">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="p-6 flex flex-col sm:flex-row gap-4"
            >
              <!-- Ox Image/Icon -->
              <div class="w-20 h-20 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-3xl">🐂</span>
              </div>

              <!-- Item Details -->
              <div class="flex-1">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 class="font-medium text-stone-800">{{ item.oxName }}</h4>
                  <p class="text-sm text-stone-600">Qty: {{ item.quantity }} × {{ item.price }} ETB</p>
                </div>
                
                <p class="text-sm text-stone-500 mb-2">Seller: {{ item.sellerName }}</p>
                
                <!-- Tracking Progress -->
                <div class="relative pt-2">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-stone-500">Order Progress</span>
                    <span class="text-xs font-medium text-amber-600">{{ getProgressStatus(item.status) }}</span>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                      :style="{ width: getProgressWidth(item.status) }"
                    ></div>
                  </div>
                  
                  <!-- Tracking Steps -->
                  <div class="flex justify-between mt-4 text-xs">
                    <div 
                      v-for="(step, index) in trackingSteps" 
                      :key="step.key"
                      class="flex flex-col items-center"
                      :class="{ 'text-amber-600': getStepStatus(item.status, step.key) }"
                    >
                      <span class="text-lg mb-1">{{ step.icon }}</span>
                      <span class="hidden sm:inline">{{ step.label }}</span>
                      <span class="text-[10px] text-stone-400">{{ step.date }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Footer -->
          <div class="p-6 bg-stone-50 border-t border-stone-100">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4 text-sm">
                <span class="text-stone-600">
                  <span class="font-medium">Delivery:</span> 
                  {{ order.deliveryMethod }}
                </span>
                <span class="text-stone-600">
                  <span class="font-medium">Payment:</span> 
                  {{ order.paymentMethod }}
                </span>
              </div>
              
              <div class="flex gap-3">
                <button
                  v-if="canCancel(order.status)"
                  @click="cancelOrder(order.id)"
                  class="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Cancel Order
                </button>
                <button
                  v-if="order.status === 'shipped'"
                  @click="trackShipment(order)"
                  class="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Track Shipment
                </button>
                <button
                  @click="contactSupport(order)"
                  class="text-sm text-stone-600 hover:text-stone-700 font-medium"
                >
                  Need Help?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-8 flex justify-center">
        <nav class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-200 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'w-10 h-10 rounded-lg font-medium',
              currentPage === page
                ? 'bg-amber-600 text-white'
                : 'border border-stone-200 hover:bg-amber-50'
            ]"
          >
            {{ page }}
          </button>
          
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-stone-200 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </nav>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-stone-200 flex justify-between items-center">
          <h3 class="text-xl font-serif text-stone-800">Order Details</h3>
          <button @click="showOrderModal = false" class="text-stone-400 hover:text-stone-600">
            ✕
          </button>
        </div>
        
        <div class="p-6">
          <!-- Order details content -->
          <p class="text-stone-600">Order details would go here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toasted } from "@/utils/utils";

const router = useRouter();
const searchQuery = ref("");
const statusFilter = ref("");
const dateFilter = ref("");
const currentPage = ref(1);
const showOrderModal = ref(false);
const selectedOrder = ref(null);

// Tracking steps configuration
const trackingSteps = [
  { key: "pending", label: "Order Placed", icon: "📝", date: "" },
  { key: "confirmed", label: "Confirmed", icon: "✅", date: "" },
  { key: "processing", label: "Processing", icon: "⚙️", date: "" },
  { key: "shipped", label: "Shipped", icon: "🚚", date: "" },
  { key: "delivered", label: "Delivered", icon: "📦", date: "" },
];

// Status classes for badges
const statusClasses = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

// Sample orders data
const orders = ref([
  {
    id: 1,
    orderId: "ORD-2024-001",
    orderDate: "2024-02-15",
    status: "delivered",
    totalAmount: 45000,
    deliveryMethod: "Standard Delivery",
    paymentMethod: "Bank Transfer",
    items: [
      {
        id: 101,
        oxName: "Borana Bull",
        quantity: 1,
        price: 45000,
        sellerName: "Ethio Cattle Farms",
        status: "delivered",
      },
    ],
  },
  {
    id: 2,
    orderId: "ORD-2024-002",
    orderDate: "2024-02-18",
    status: "shipped",
    totalAmount: 85000,
    deliveryMethod: "Express Delivery",
    paymentMethod: "Credit Card",
    items: [
      {
        id: 102,
        oxName: "Borana Heifer",
        quantity: 2,
        price: 42500,
        sellerName: "Oromia Livestock",
        status: "shipped",
      },
    ],
  },
  {
    id: 3,
    orderId: "ORD-2024-003",
    orderDate: "2024-02-20",
    status: "processing",
    totalAmount: 38000,
    deliveryMethod: "Standard Delivery",
    paymentMethod: "Mobile Money",
    items: [
      {
        id: 103,
        oxName: "Sahiwal Bull",
        quantity: 1,
        price: 38000,
        sellerName: "Green Pastures Ranch",
        status: "processing",
      },
    ],
  },
]);

// Computed properties
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const matchesSearch = 
        order.orderId.toLowerCase().includes(query) ||
        order.items.some(item => item.oxName.toLowerCase().includes(query)) ||
        order.items.some(item => item.sellerName.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter.value && order.status !== statusFilter.value) {
      return false;
    }
    
    // Date filter (simplified for demo)
    if (dateFilter.value) {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      
      switch(dateFilter.value) {
        case "today":
          if (orderDate.toDateString() !== today.toDateString()) return false;
          break;
        case "week":
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          if (orderDate < weekAgo) return false;
          break;
        case "month":
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
          if (orderDate < monthAgo) return false;
          break;
      }
    }
    
    return true;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / 5)));

// Methods
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getProgressWidth(status) {
  const progressMap = {
    pending: "10%",
    confirmed: "30%",
    processing: "50%",
    shipped: "75%",
    delivered: "100%",
    cancelled: "100%",
  };
  return progressMap[status] || "0%";
}

function getProgressStatus(status) {
  const statusMap = {
    pending: "Awaiting confirmation",
    confirmed: "Order confirmed",
    processing: "Being processed",
    shipped: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
}

function getStepStatus(itemStatus, stepKey) {
  const stepOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentIndex = stepOrder.indexOf(itemStatus);
  const stepIndex = stepOrder.indexOf(stepKey);
  
  return stepIndex <= currentIndex;
}

function canCancel(status) {
  return ["pending", "confirmed"].includes(status);
}

function viewOrderDetails(orderId) {
  selectedOrder.value = orders.value.find(o => o.id === orderId);
  showOrderModal.value = true;
}

function leaveReview(order) {
  router.push(`/buyer/review/${order.id}`);
}

function cancelOrder(orderId) {
  if (confirm("Are you sure you want to cancel this order?")) {
    // API call would go here
    toasted(true, "Order cancelled successfully");
  }
}

function trackShipment(order) {
  router.push(`/buyer/tracking/${order.id}`);
}

function contactSupport(order) {
  // Open support chat or modal
  toasted(true, "Support contact would open here");
}

onMounted(() => {
  // Fetch orders from API
  console.log("Fetching orders...");
});
</script>