<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/stores/auth";
import { toasted } from "@/utils/utils";
import ApiService from "@/service/ApiService";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const api = new ApiService();
const BASE_URL = "/api/oxen";
const ORDER_URL = "/api/orders";

// Checkout steps
const currentStep = ref(1);
const steps = ['Review Order', 'Payment', 'Confirmation'];
const loading = ref(true);

// Order data - matches AddOrderRequest DTO
const orderData = ref({
  items: [],
  userUuid: null, // Will be set from auth
  deliveryAddress: null,
  paymentMethod: null,
  subtotal: 0,
  deliveryFee: 500, // Fixed delivery fee
  total: 0,
  notes: ''
});

// Payment methods
const paymentMethods = [
  { id: 'TELEBIRR', name: 'Telebirr', icon: '📱', processing: 'Instant' },
  { id: 'CBE_BIRR', name: 'CBE Birr', icon: '💳', processing: 'Instant' },
  { id: 'BANK_TRANSFER', name: 'Bank Transfer', icon: '🏦', processing: '1-2 hours' },
  { id: 'CASH_ON_DELIVERY', name: 'Cash on Delivery', icon: '💵', processing: 'On delivery' }
];

const selectedPayment = ref(null);
const paymentProcessing = ref(false);

// Delivery addresses (from user profile)
const addresses = ref([
  {
    id: 1,
    type: 'HOME',
    name: 'Birhane Araya',
    phone: '+251911234567',
    alternativePhone: '',
    address: 'Bole, Addis Ababa',
    city: 'Addis Ababa',
    subCity: 'Bole',
    landmark: 'Near Bole International Airport',
    isDefault: true
  },
  {
    id: 2,
    type: 'OFFICE',
    name: 'Birhane Araya',
    phone: '+251922345678',
    alternativePhone: '+251911234567',
    address: 'Mexico, Addis Ababa',
    city: 'Addis Ababa',
    subCity: 'Mexico',
    landmark: 'Near Mexico Square',
    isDefault: false
  }
]);

const selectedAddress = ref(null);

// Fetch ox details from API
const fetchOxDetails = async (oxUuid) => {
  try {
    const response = await api.addAuthenticationHeader().get(`${BASE_URL}/${oxUuid}`);
    const ox = response.data;
    
    return {
      oxUuid: ox.oxUuid,
      oxName: ox.name,
      oxBreed: ox.breed,
      oxImage: ox.images?.[0] || (ox.pictures?.[0]?.imageUrl) || null,
      sellerUuid: ox.createdBy,
      sellerName: ox.sellerName || "Unknown Seller",
      quantity: 1,
      priceAtPurchase: ox.price,
      specialRequests: ''
    };
  } catch (error) {
    console.error("Error fetching ox details:", error);
    throw error;
  }
};

// Load order items from query params
onMounted(async () => {
  loading.value = true;
  
  try {
    const oxUuid = route.query.ox;
    const quantity = parseInt(route.query.quantity) || 1;
    
    if (!oxUuid) {
      toasted(false, "No item selected for checkout");
      router.push('/buyer/browse');
      return;
    }
    
    if (!auth.auth?.accessToken) {
      toasted(false, "Please login to checkout");
      router.push(`/login?redirect=${route.path}?ox=${oxUuid}&quantity=${quantity}`);
      return;
    }
    
    // Set user UUID from auth
    orderData.value.userUuid = auth.auth?.userUuid || auth.auth?.user?.userUuid;
    
    // Fetch ox details from API
    const oxDetails = await fetchOxDetails(oxUuid);
    oxDetails.quantity = quantity; // Set the quantity from query param
    
    orderData.value.items = [oxDetails];
    
    // Set default address
    selectedAddress.value = addresses.value.find(a => a.isDefault)?.id || addresses.value[0]?.id;
    
    calculateTotals();
    
  } catch (error) {
    console.error("Error loading checkout:", error);
    toasted(false, "Failed to load item details");
    router.push('/buyer/browse');
  } finally {
    loading.value = false;
  }
});

const calculateTotals = () => {
  const subtotal = orderData.value.items.reduce((sum, item) => 
    sum + (item.priceAtPurchase * item.quantity), 0
  );
  orderData.value.subtotal = subtotal;
  orderData.value.total = subtotal + orderData.value.deliveryFee;
};

const proceedToPayment = () => {
  if (!selectedAddress.value) {
    toasted(false, "Please select delivery address");
    return;
  }
  
  // Set delivery address in the format expected by backend
  const address = addresses.value.find(a => a.id === selectedAddress.value);
  orderData.value.deliveryAddress = {
    recipientName: address.name,
    phoneNumber: address.phone,
    alternativePhone: address.alternativePhone || '',
    address: address.address,
    city: address.city,
    subCity: address.subCity || '',
    landmark: address.landmark || '',
    addressType: address.type
  };
  
  currentStep.value = 2;
};

const processPayment = async () => {
  if (!selectedPayment.value) {
    toasted(false, "Please select payment method");
    return;
  }
  
  paymentProcessing.value = true;
  
  try {
    // Set payment method
    orderData.value.paymentMethod = selectedPayment.value;
    
    // Ensure delivery address is set
    if (!orderData.value.deliveryAddress) {
      const address = addresses.value.find(a => a.id === selectedAddress.value);
      orderData.value.deliveryAddress = {
        recipientName: address.name,
        phoneNumber: address.phone,
        alternativePhone: address.alternativePhone || '',
        address: address.address,
        city: address.city,
        subCity: address.subCity || '',
        landmark: address.landmark || '',
        addressType: address.type
      };
    }
    
    // Prepare the exact payload matching AddOrderRequest DTO
    const orderPayload = {
      items: orderData.value.items.map(item => ({
        oxUuid: item.oxUuid,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        specialRequests: item.specialRequests || ''
      })),
      userUuid: orderData.value.userUuid,
      deliveryAddress: orderData.value.deliveryAddress,
      paymentMethod: orderData.value.paymentMethod,
      subtotal: orderData.value.subtotal,
      deliveryFee: orderData.value.deliveryFee,
      total: orderData.value.total,
      notes: orderData.value.notes || `Order for ${orderData.value.items.length} item(s)`
    };
    
    console.log("Order payload:", orderPayload); // For debugging
    
    // Call order creation API
    const response = await api.addAuthenticationHeader().post(ORDER_URL, orderPayload);
    
    if (response.data) {
      toasted(true, "Payment successful! Order placed.");
      
      // Store order UUID for tracking
      const orderUuid = response.data.orderUuid;
      localStorage.setItem('lastOrderUuid', orderUuid);
      
      currentStep.value = 3;
    } else {
      throw new Error("Failed to create order");
    }
    
  } catch (error) {
    console.error("Payment error:", error);
    toasted(false, error.response?.data?.message || "Payment failed. Please try again.");
  } finally {
    paymentProcessing.value = false;
  }
};

const viewOrder = () => {
  router.push('/buyer/orders');
};

const addNewAddress = () => {
  router.push('/profile/addresses/new');
};

// Format price
const formatPrice = (price) => {
  return price?.toLocaleString() || '0';
};

// Get payment method display name
const getPaymentMethodName = (methodId) => {
  return paymentMethods.find(m => m.id === methodId)?.name || methodId;
};
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-serif text-stone-800 mb-2">Checkout</h1>
        
        <!-- Progress Steps -->
        <div class="flex items-center justify-between max-w-2xl">
          <div v-for="(step, index) in steps" :key="step" class="flex items-center">
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center font-medium',
              currentStep > index + 1 ? 'bg-green-500 text-white' :
              currentStep === index + 1 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'
            ]">
              {{ index + 1 }}
            </div>
            <span :class="[
              'ml-2 text-sm',
              currentStep === index + 1 ? 'font-medium text-stone-800' : 'text-stone-500'
            ]">{{ step }}</span>
            <span v-if="index < steps.length - 1" class="mx-4 text-stone-300">—</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p class="text-stone-600 mt-4">Loading checkout details...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Step 1: Review Order -->
          <div v-if="currentStep === 1" class="space-y-6">
            <!-- Order Items -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h2 class="text-lg font-medium text-stone-800 mb-4">Order Items</h2>
              
              <div v-for="(item, index) in orderData.items" :key="index" 
                   class="flex items-center gap-4 py-4 border-b border-stone-100 last:border-0">
                <div class="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center text-3xl">
                  <img v-if="item.oxImage" :src="item.oxImage" class="w-full h-full object-cover rounded-lg" />
                  <span v-else>🐂</span>
                </div>
                <div class="flex-1">
                  <h3 class="font-medium text-stone-800">{{ item.oxName }}</h3>
                  <p class="text-sm text-stone-500">Breed: {{ item.oxBreed }}</p>
                  <p class="text-sm text-stone-500">Seller: {{ item.sellerName }}</p>
                  <p class="text-sm text-stone-500">Quantity: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-amber-600">{{ formatPrice(item.priceAtPurchase * item.quantity) }} ETB</p>
                  <p class="text-xs text-stone-500">{{ formatPrice(item.priceAtPurchase) }} ETB each</p>
                </div>
              </div>
            </div>

            <!-- Delivery Address -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-medium text-stone-800">Delivery Address</h2>
                <button @click="addNewAddress" class="text-sm text-amber-600 hover:text-amber-700">
                  + Add New
                </button>
              </div>
              
              <div class="space-y-3">
                <div v-for="address in addresses" :key="address.id"
                     @click="selectedAddress = address.id"
                     :class="[
                       'p-4 border rounded-lg cursor-pointer transition-all',
                       selectedAddress === address.id 
                         ? 'border-amber-600 bg-amber-50' 
                         : 'border-stone-200 hover:border-amber-300'
                     ]">
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-stone-800">{{ address.name }}</span>
                        <span class="text-xs px-2 py-1 bg-stone-100 rounded-full">{{ address.type }}</span>
                        <span v-if="address.isDefault" class="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                          Default
                        </span>
                      </div>
                      <p class="text-sm text-stone-600">{{ address.phone }}</p>
                      <p class="text-sm text-stone-600">{{ address.address }}, {{ address.subCity }}, {{ address.city }}</p>
                      <p v-if="address.landmark" class="text-xs text-stone-400">Landmark: {{ address.landmark }}</p>
                    </div>
                    <span v-if="selectedAddress === address.id" class="text-amber-600">✓</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Special Notes -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h2 class="text-lg font-medium text-stone-800 mb-4">Additional Notes (Optional)</h2>
              <textarea 
                v-model="orderData.notes"
                rows="3"
                placeholder="Any special instructions for the seller..."
                class="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>
          </div>

          <!-- Step 2: Payment -->
          <div v-if="currentStep === 2" class="space-y-6">
            <!-- Payment Methods -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h2 class="text-lg font-medium text-stone-800 mb-4">Select Payment Method</h2>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="method in paymentMethods" :key="method.id"
                     @click="selectedPayment = method.id"
                     :class="[
                       'p-4 border rounded-lg cursor-pointer transition-all',
                       selectedPayment === method.id 
                         ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-200' 
                         : 'border-stone-200 hover:border-amber-300'
                     ]">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">{{ method.icon }}</span>
                    <div>
                      <h3 class="font-medium text-stone-800">{{ method.name }}</h3>
                      <p class="text-xs text-stone-500">Processing: {{ method.processing }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Info -->
              <div v-if="selectedPayment" class="mt-6 p-4 bg-stone-50 rounded-lg">
                <p class="text-sm text-stone-600 mb-2">
                  You'll pay with <strong>{{ getPaymentMethodName(selectedPayment) }}</strong>
                </p>
                <p class="text-xs text-stone-500">
                  Total amount: <strong class="text-amber-600">{{ formatPrice(orderData.total) }} ETB</strong>
                </p>
              </div>
            </div>
          </div>

          <!-- Step 3: Confirmation -->
          <div v-if="currentStep === 3" class="bg-white rounded-xl shadow-md p-8 text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">✅</span>
            </div>
            <h2 class="text-2xl font-serif text-stone-800 mb-2">Order Placed Successfully!</h2>
            <p class="text-stone-600 mb-6">Thank you for your purchase. We'll notify you when your ox is ready for delivery.</p>
            <div class="flex gap-4 justify-center">
              <button @click="viewOrder"
                      class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Track Order
              </button>
              <router-link to="/buyer/browse"
                         class="px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50">
                Continue Shopping
              </router-link>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 class="text-lg font-medium text-stone-800 mb-4">Order Summary</h2>
            
            <div class="space-y-3 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-stone-600">Subtotal</span>
                <span class="font-medium">{{ formatPrice(orderData.subtotal) }} ETB</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-stone-600">Delivery Fee</span>
                <span class="font-medium">{{ formatPrice(orderData.deliveryFee) }} ETB</span>
              </div>
              <div class="border-t border-stone-200 pt-3">
                <div class="flex justify-between">
                  <span class="font-medium text-stone-800">Total</span>
                  <span class="text-xl font-bold text-amber-600">{{ formatPrice(orderData.total) }} ETB</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <button v-if="currentStep === 1"
                    @click="proceedToPayment"
                    class="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">
              Proceed to Payment
            </button>
            
            <button v-if="currentStep === 2"
                    @click="processPayment"
                    :disabled="paymentProcessing"
                    class="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:bg-stone-400">
              {{ paymentProcessing ? 'Processing...' : 'Pay Now' }}
            </button>
            
            <button v-if="currentStep === 1 || currentStep === 2"
                    @click="router.back()"
                    class="w-full mt-3 py-3 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>