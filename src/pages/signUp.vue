<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useApiRequest } from "@/composables/useApiRequest";
import { toasted } from "@/utils/utils";
import Input from "@/components/new_form_elements/Input.vue";
import InputPassword from "@/components/new_form_elements/InputPassword.vue";
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import { signup } from "./login/api/LoginApi";
import { getAllRole } from '../features/roles/Api/RoleApi';

const rolereq = useApiRequest();
const router = useRouter();
const signupReq = useApiRequest();
const roles = ref([]);
const buyerRole = ref(null);
const sellerRole = ref(null);

// ---------------- STEP ----------------
const currentStep = ref(1);
const totalSteps = 3;

// ---------------- ROLE ----------------
const userRole = ref(null); // Will store the full role object

// ---------------- FORM DATA ----------------
const formData = ref({
  firstName: "",
  fatherName: "",
  mobilePhone: "",
  password: "",
  confirmPassword: "",
  businessName: "",
  businessLicense: "",
  tinNumber: "",
  vatNumber: "",
});

// ---------------- ERRORS ----------------
const errors = ref({});

// ---------------- STEP 1 VALIDATION ----------------
const validateStep1 = () => {
  const newErrors = {};

  if (!formData.value.firstName?.trim())
    newErrors.firstName = "First name is required";
  if (!formData.value.fatherName?.trim())
    newErrors.fatherName = "Last name is required";

  if (!formData.value.mobilePhone?.trim())
    newErrors.mobilePhone = "mobilePhone number is required";
  else if (!/^\+?[0-9]{10,15}$/.test(formData.value.mobilePhone.replace(/\s/g, "")))
    newErrors.mobilePhone = "Invalid mobilePhone number";

  if (!formData.value.password)
    newErrors.password = "Password is required";
  else if (formData.value.password.length < 8)
    newErrors.password = "Password must be at least 8 characters";

  if (formData.value.password !== formData.value.confirmPassword)
    newErrors.confirmPassword = "Passwords do not match";

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// ---------------- STEP 2 VALIDATION ----------------
const validateStep2 = () => {
  const newErrors = {};

  if (!userRole.value)
    newErrors.role = "Please select a role";

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// ---------------- STEP 3 VALIDATION ----------------
const validateStep3 = () => {
  const newErrors = {};

  if (!userRole.value) {
    newErrors.role = "Role is required";
  }

  // Check if selected role is seller (using UUID comparison)
  if (userRole.value?.roleUuid === sellerRole.value?.roleUuid) {
    if (!formData.value.businessName?.trim())
      newErrors.businessName = "Business name is required";

    if (!formData.value.businessLicense?.trim())
      newErrors.businessLicense = "Business license is required";

    if (!formData.value.tinNumber?.trim())
      newErrors.tinNumber = "TIN number is required";
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// ---------------- NAVIGATION ----------------
const nextStep = () => {
  let isValid = false;

  if (currentStep.value === 1) isValid = validateStep1();
  else if (currentStep.value === 2) isValid = validateStep2();

  if (isValid) {
    errors.value = {}; // clear old errors
    currentStep.value++;
  }
};

const prevStep = () => {
  errors.value = {}; // clear errors when going back
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// ---------------- FETCH ROLES ----------------
onMounted(() => {
  rolereq.send(
    () => getAllRole({ page: 1, limit: 500 }),
    (res) => {
      if (res.success) {
        // ✅ Access the content array from the paginated response
        const rolesData = res.data.content || [];
        roles.value = rolesData;

        // Find buyer & seller
        buyerRole.value = rolesData.find(r =>
          r.roleName.toLowerCase() === "buyer" // Use exact match for reliability
        );

        sellerRole.value = rolesData.find(r =>
          r.roleName.toLowerCase() === "seller" // Use exact match for reliability
        );

        // Optional: Log to verify roles are found
        console.log('Buyer Role:', buyerRole.value);
        console.log('Seller Role:', sellerRole.value);
      }
    }
  );
});

// ---------------- SUBMIT ----------------
const handleSignup = () => {
  if (!validateStep3()) return;

  const submitData = {
    firstName: formData.value.firstName.trim(),
    fatherName: formData.value.fatherName.trim(),
    mobilePhone: formData.value.mobilePhone.trim(),
    password: formData.value.password,
    roleUuid: userRole.value?.roleUuid, // ✅ Send UUID instead of string
    businessName: formData.value.businessName.trim(),
    businessLicense: formData.value.businessLicense.trim(),
    tinNumber: formData.value.tinNumber.trim(),
    vatNumber: formData.value.vatNumber.trim(),
  };

  signupReq.send(
    () => signup(submitData),
    (res) => {
      if (res.success) {
        toasted(true, "Registration successful!");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        toasted(false, "Registration failed", res.error || "Something went wrong");
      }
    }
  );
};

// ---------------- PROGRESS ----------------
const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100;
});

const goToLogin = () => router.push("/login");

// Helper computed for checking if roles are loaded
const rolesLoaded = computed(() => buyerRole.value && sellerRole.value);
</script>

<template>
  <div class="min-h-screen w-full relative overflow-auto bg-gradient-to-br from-amber-900/90 via-stone-800 to-emerald-900/90">
    <!-- Rustic Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="signup-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="8" fill="#D4A373" opacity="0.3"/>
            <circle cx="60" cy="60" r="12" fill="#BC8F4B" opacity="0.2"/>
            <path d="M30 70 L40 60 L50 70" stroke="#C4A484" stroke-width="2" fill="none" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#signup-pattern)"/>
      </svg>
    </div>

    <!-- Floating Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-40 left-20 w-3 h-3 bg-amber-500/20 rounded-full animate-float-slow"></div>
      <div class="absolute bottom-40 right-20 w-4 h-4 bg-emerald-500/20 rounded-full animate-float-delayed"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-3xl">
        <!-- Header with Progress -->
        <div class="mb-8 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-800/40 rounded-full border border-amber-500/30 backdrop-blur mb-4">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span class="text-amber-100 text-xl font-medium">KERA OXEN MARKETPLACE</span>
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl text-white font-bold mb-2">Create Your Account</h1>
          <p class="text-stone-300 text-sm">Join Ethiopia's leading B2B oxen trading platform</p>
        </div>

        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex justify-between mb-2 text-sm text-stone-300">
            <span :class="{ 'text-amber-400 font-semibold': currentStep >= 1 }">Basic Info</span>
            <span :class="{ 'text-amber-400 font-semibold': currentStep >= 2 }">Choose Role</span>
            <span :class="{ 'text-amber-400 font-semibold': currentStep >= 3 }">Details</span>
          </div>
          <div class="h-2 bg-stone-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 1" class="bg-stone-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-700/30 p-6 sm:p-8">
          <h2 class="text-xl font-serif text-white mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-sm">1</span>
            Basic Information
          </h2>

          <div class="space-y-5">
            <Input
              label="Contact Person First Name"
              v-model="formData.firstName"
              name="firstName"
              validation="required"
              :error="errors.firstName"
              :attributes="{ 
                placeholder: 'Enter your First name',
                class: 'bg-stone-800/50 border-stone-700 text-white placeholder-stone-400 focus:border-amber-500 py-2'
              }"
            />
            <Input
              label="Contact Person Last Name"
              v-model="formData.fatherName"
              name="lastName"
              validation="required"
              :error="errors.lastName"
              :attributes="{ 
                placeholder: 'Enter your Last name',
                class: 'bg-stone-800/50 border-stone-700 text-white placeholder-stone-400 focus:border-amber-500 py-2'
              }"
            />

            <Input
              label="mobilePhone Number"
              v-model="formData.mobilePhone"
              name="mobilePhone"
              validation="required"
              :error="errors.mobilePhone"
              :attributes="{ 
                placeholder: '+251 XXX XXX XXX',
                class: 'bg-stone-800/50 border-stone-700 text-white placeholder-stone-400 focus:border-amber-500 py-2'
              }"
            />

            <InputPassword
              label="Password"
              v-model="formData.password"
              name="password"
              validation="required|min:8"
              :error="errors.password"
              :attributes="{ 
                placeholder: 'Create a password',
                class: 'bg-stone-800/50 border-stone-700 text-white placeholder-stone-400 focus:border-amber-500 py-2'
              }"
            />

            <InputPassword
              label="Confirm Password"
              v-model="formData.confirmPassword"
              name="confirmPassword"
              validation="required"
              :error="errors.confirmPassword"
              :attributes="{ 
                placeholder: 'Confirm your password',
                class: 'bg-stone-800/50 border-stone-700 text-white placeholder-stone-400 focus:border-amber-500 py-2'
              }"
            />
          </div>

          <div class="mt-8 flex justify-end">
            <button 
              @click="nextStep"
              class="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 
                     text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-amber-900/50
                     border border-amber-500/30 flex items-center gap-2"
            >
              Continue
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Step 2: Role Selection -->
        <div v-if="currentStep === 2" class="bg-stone-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-700/30 p-6 sm:p-8">
          <h2 class="text-xl font-serif text-white mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-sm">2</span>
            Choose Your Role
          </h2>

          <!-- Loading state -->
          <div v-if="!rolesLoaded" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
            <p class="text-stone-300 mt-2">Loading roles...</p>
          </div>

          <p v-if="errors.role && rolesLoaded" class="text-red-400 text-sm mb-4">{{ errors.role }}</p>

          <div v-if="rolesLoaded" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Buyer Card -->
            <div 
              @click="userRole = buyerRole"
              :class="[
                'p-6 rounded-xl border-2 cursor-pointer transition-all',
                userRole?.roleUuid === buyerRole?.roleUuid 
                  ? 'border-amber-500 bg-amber-900/30' 
                  : 'border-stone-700 hover:border-amber-700 bg-stone-800/30'
              ]"
            >
              <div class="text-4xl mb-3">🛒</div>
              <h3 class="text-xl font-semibold text-white mb-2">Buyer</h3>
              <p class="text-stone-300 text-sm">
                I want to purchase quality oxen for my farm, business, or community.
              </p>
              <ul class="mt-4 space-y-2 text-sm text-stone-400">
                <li class="flex items-center gap-2">✓ Browse premium listings</li>
                <li class="flex items-center gap-2">✓ Access market analytics</li>
                <li class="flex items-center gap-2">✓ Connect with verified sellers</li>
              </ul>
            </div>

            <!-- Seller Card -->
            <div 
              @click="userRole = sellerRole"
              :class="[
                'p-6 rounded-xl border-2 cursor-pointer transition-all',
                userRole?.roleUuid === sellerRole?.roleUuid 
                  ? 'border-amber-500 bg-amber-900/30' 
                  : 'border-stone-700 hover:border-amber-700 bg-stone-800/30'
              ]"
            >
              <div class="text-4xl mb-3">🐂</div>
              <h3 class="text-xl font-semibold text-white mb-2">Seller</h3>
              <p class="text-stone-300 text-sm">
                I want to list and sell my oxen to qualified buyers across Ethiopia.
              </p>
              <ul class="mt-4 space-y-2 text-sm text-stone-400">
                <li class="flex items-center gap-2">✓ List unlimited oxen</li>
                <li class="flex items-center gap-2">✓ Access seller dashboard</li>
                <li class="flex items-center gap-2">✓ Get verified seller badge</li>
              </ul>
            </div>
          </div>

          <div class="mt-8 flex justify-between">
            <button 
              @click="prevStep"
              class="px-6 py-3 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 transition-colors border border-stone-700"
            >
              Back
            </button>
            <button 
              @click="nextStep"
              :disabled="!rolesLoaded"
              :class="[
                'px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg border border-amber-500/30 flex items-center gap-2',
                !rolesLoaded && 'opacity-50 cursor-not-allowed'
              ]"
            >
              Continue
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Step 3: Role-Specific Information -->
        <div v-if="currentStep === 3"
             class="bg-stone-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-700/30 p-6 sm:p-8">

          <h2 class="text-xl font-serif text-white mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-sm">3</span>
            {{ userRole?.roleUuid === sellerRole?.roleUuid ? 'Seller Details' : 'Buyer Preferences' }}
          </h2>

          <div class="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scroll">

            <!-- ================= BUSINESS INFO ================= -->
            <div class="space-y-5 border-b border-stone-700 pb-6">
              <h3 class="text-lg font-medium text-amber-300">Business Information</h3>

              <Input
                label="Business Name"
                v-model="formData.businessName"
                :error="errors.businessName"
                :attributes="{
                  placeholder: 'Enter your business name',
                  class: 'bg-stone-800/50 border-stone-700 text-white py-2'
                }"
              />

              <Input
                label="Business License Number"
                v-model="formData.businessLicense"
                :error="errors.businessLicense"
                :attributes="{
                  placeholder: 'Enter license number',
                  class: 'bg-stone-800/50 border-stone-700 text-white py-2'
                }"
              />

              <Input
                label="TIN Number"
                v-model="formData.tinNumber"
                :error="errors.tinNumber"
                :attributes="{
                  placeholder: 'Enter TIN number',
                  class: 'bg-stone-800/50 border-stone-700 text-white py-2'
                }"
              />

              <Input
                label="VAT Number (Optional)"
                v-model="formData.vatNumber"
                :attributes="{
                  placeholder: 'Optional',
                  class: 'bg-stone-800/50 border-stone-700 text-white py-2'
                }"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-8 flex justify-between">
            <button
              @click="prevStep"
              class="px-6 py-3 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 border border-stone-700">
              Back
            </button>

            <FormSubmitButton
              @click.prevent="handleSignup"
              btn-text="Create Account"
              :pending="signupReq.pending.value"
              class="px-3 ml-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700
                     text-white font-semibold rounded-lg shadow-lg
                     border border-amber-500/30 min-w-[160px]"
            />
          </div>
        </div>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-stone-300 text-sm">
            Already have an account?
            <button @click="goToLogin" class="text-amber-400 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 10s ease-in-out infinite;
}

/* Custom scrollbar for step 3 container */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #2d2a24;
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #b45309;
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #92400e;
}

/* Input autofill styles */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
select:-webkit-autofill {
  -webkit-text-fill-color: white;
  -webkit-box-shadow: 0 0 0px 1000px #2d2a24 inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>