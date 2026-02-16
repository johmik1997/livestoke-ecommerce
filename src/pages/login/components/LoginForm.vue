<template>
  <div class="h-full flex items-center justify-center px-4 sm:pr-20">
    <div class="bg-stone-900/60 backdrop-blur-xl px-6 sm:px-10 py-8 w-full max-w-lg rounded-2xl shadow-2xl border border-amber-700/30 flex flex-col gap-6 relative z-10">
      <!-- Logo / Brand Mark -->
      <div class="flex justify-center">
        <div class="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center border-4 border-amber-400/30">
          <span class="text-4xl">🐂</span>
        </div>
      </div>

      <!-- Form -->
      <NewFormLayout v-slot="{ submit }" id="login-form">
        <div class="flex flex-col gap-5">
          <Input
            v-model="loginmobilePhone"
            label="Phone Number"
            :attributes="{ 
              placeholder: 'Enter your mobilePhone', 
              class: 'bg-stone-800/50 border-stone-700 text-white placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500 py-2 rounded-lg'
            }"
          />

          <InputPassword
            v-model="loginPassword"
            label="Password"
            :attributes="{ 
              placeholder: 'Enter your password', 
              class: 'bg-stone-800/50 border-stone-700 text-white placeholder-stone-400 focus:border-amber-600 focus:ring-amber-500 py-2 rounded-lg'
            }"
          />

          <div class="flex justify-end text-sm text-stone-300">
            <button
              type="button"
              class="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              @click="openForgotPasswordModal"
            >
              Forgot Password?
            </button>
          </div>

          <FormSubmitButton
            class="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 
                   text-white font-semibold py-2 rounded-lg transition-all shadow-lg hover:shadow-amber-900/50
                   border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            @click.prevent="submit(handleLogin)"
            btn-text="Login"
            :pending="loginReq.pending.value"
          />
        </div>
      </NewFormLayout>

      <!-- Signup Link -->
      <div class="text-center text-sm text-stone-300">
        Don't have an account?
        <button @click="goToSignup" class="text-amber-400 font-medium hover:text-amber-300 hover:underline transition-all">
          Register as seller
        </button>
      </div>
    </div>

    <!-- Account Verification Modal -->
    <div
      v-if="showVerificationModal"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-stone-900 rounded-2xl w-full max-w-md shadow-2xl border border-amber-700/30 p-6 relative animate-fadeIn">
        <!-- Close Button -->
        <button
          @click="closeVerificationModal"
          class="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-amber-800/30 rounded-full flex items-center justify-center border-2 border-amber-500/30">
            <span class="text-3xl">🔐</span>
          </div>
        </div>

        <h3 class="text-xl font-serif text-white mb-2 text-center">
          Verify Your Account
        </h3>
        <p class="text-stone-300 text-sm text-center mb-6">
          Enter the code we sent to your phone to activate your seller account.
        </p>

        <!-- Phone Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-stone-300 mb-2">Phone Number</label>
          <div class="flex gap-2">
            <input
              type="text"
              v-model="phoneNumber"
              placeholder="+251 XXX XXX XXX"
              class="flex-1 py-2 px-3 bg-stone-800 border border-stone-700 rounded-lg text-white 
                     placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              @click="sendVerification"
              :disabled="!phoneNumber.trim() || verifyReq.pending.value"
              class="whitespace-nowrap text-sm font-medium px-4 py-2 rounded-lg transition-colors
                     bg-amber-700 text-white hover:bg-amber-800
                     disabled:bg-stone-700 disabled:cursor-not-allowed"
            >
              <span v-if="verifyReq.pending.value">Sending...</span>
              <span v-else>Send Code</span>
            </button>
          </div>
        </div>

        <!-- Code Input (4 boxes) -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-stone-300 mb-2 text-center">Verification Code</label>
          <div class="flex justify-center gap-3">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              type="text"
              maxlength="1"
              v-model="otpInputs[index]"
              @input="focusNext(index)"
              class="w-12 h-12 text-center text-lg font-bold bg-stone-800 border border-stone-700 
                     rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div class="flex justify-between gap-3">
          <button
            @click="closeVerificationModal"
            class="flex-1 bg-stone-800 text-stone-300 px-6 py-2 text-sm font-medium hover:bg-stone-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitVerification"
            :disabled="otpInputs.join('').length < 4 || verifyReq.pending.value"
            class="flex-1 text-white px-6 py-2 text-sm font-medium rounded-lg transition-colors
                   bg-amber-700 hover:bg-amber-800
                   disabled:bg-stone-700 disabled:cursor-not-allowed"
          >
            <span v-if="verifyReq.pending.value">Verifying...</span>
            <span v-else>Verify</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div
      v-if="showForgotPasswordModal"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-stone-900 rounded-2xl w-full max-w-md shadow-2xl border border-amber-700/30 p-6 relative animate-fadeIn">
        <!-- Close -->
        <button
          @click="closeForgotPasswordModal"
          class="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-amber-800/30 rounded-full flex items-center justify-center border-2 border-amber-500/30">
            <span class="text-3xl">🔑</span>
          </div>
        </div>

        <h3 class="text-xl font-serif text-white mb-4 text-center">
          Reset Your Password
        </h3>

        <!-- Step 1: Phone -->
        <div v-if="forgotStep === 1" class="space-y-4">
          <p class="text-stone-300 text-sm text-center">
            Enter your registered phone number to receive an OTP.
          </p>
          <input
            type="text"
            v-model="forgotPhone"
            placeholder="Phone number"
            class="w-full py-2 px-3 bg-stone-800 border border-stone-700 rounded-lg text-white 
                   placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            @click="sendForgotPassword"
            :disabled="!forgotPhone.trim() || forgotReq.pending.value"
            class="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 
                   transition-colors disabled:bg-stone-700 disabled:cursor-not-allowed"
          >
            <span v-if="forgotReq.pending.value">Sending...</span>
            <span v-else>Send OTP</span>
          </button>
        </div>

        <!-- Step 2: OTP -->
        <div v-if="forgotStep === 2" class="space-y-4">
          <p class="text-stone-300 text-sm text-center">Enter the 4-digit code sent to your phone.</p>
          <div class="flex justify-center gap-3">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              type="text"
              maxlength="1"
              v-model="forgotOtpInputs[index]"
              @input="focusNextForgotOtp(index)"
              class="w-12 h-12 text-center text-lg font-bold bg-stone-800 border border-stone-700 
                     rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <button
            @click="verifyForgotOtp"
            :disabled="forgotOtpInputs.join('').length < 4 || forgotReq.pending.value"
            class="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 
                   transition-colors disabled:bg-stone-700 disabled:cursor-not-allowed"
          >
            <span v-if="forgotReq.pending.value">Verifying...</span>
            <span v-else>Verify OTP</span>
          </button>
        </div>

        <!-- Step 3: Reset Password -->
        <div v-if="forgotStep === 3" class="space-y-4">
          <p class="text-stone-300 text-sm text-center">Create your new password below.</p>
          
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-2">New Password</label>
            <input
              type="password"
              v-model="newPassword"
              placeholder="Enter new password"
              class="w-full py-2 px-3 bg-stone-800 border border-stone-700 rounded-lg text-white 
                     placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-2">Confirm Password</label>
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="Confirm new password"
              class="w-full py-2 px-3 bg-stone-800 border border-stone-700 rounded-lg text-white 
                     placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div> 
          <button
            @click="submitResetPassword"
            :disabled="!newPassword.trim() || !confirmPassword.trim() || forgotReq.pending.value"
            class="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 
                   transition-colors disabled:bg-stone-700 disabled:cursor-not-allowed"
          >
            <span v-if="forgotReq.pending.value">Resetting...</span>
            <span v-else>Reset Password</span>
          </button>
        </div>

        <!-- Back to login link (for steps 1-2) -->
        <div v-if="forgotStep < 3" class="mt-4 text-center">
          <button @click="closeForgotPasswordModal" class="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import Input from "@/components/new_form_elements/Input.vue";
import InputPassword from "@/components/new_form_elements/InputPassword.vue";
import NewFormLayout from "@/components/NewFormLayout.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useAuth } from "@/stores/auth";
import { useRoute, useRouter } from "vue-router";
import { toasted } from "@/utils/utils";
import { login } from "../api/LoginApi";
import {
  sendVerificationCode,
  verifyUser,
  forgotPassword,
  enterVerificationCode,
  resetPassword,
} from "@/features/users/Api/UserApi";
import { ref } from "vue";

const router = useRouter();
const route = useRoute();
const auth = useAuth();
let detiail = localStorage.getItem("userDetail");

// ------------------ LOGIN ------------------
const loginReq = useApiRequest();
const verifyReq = useApiRequest();

const showVerificationModal = ref(false);
const phoneNumber = ref("");
const pendingLoginData = ref(null);

function reRoute() {
  if (route.query.redirect && route.query?.from == "other")
    location.href = route.query.redirect;
  else if (route.query.redirect) router.replace(route.query.redirect);
  else router.replace("/dashboard");
}

if (detiail) {
  detiail = JSON.parse(detiail);
  auth.setAuth({ user: detiail, accessToken: detiail.token });
  reRoute();
}

const loginmobilePhone = ref("");
const loginPassword = ref("");

function handleLogin() {
  if (loginReq.pending.value) return;

  const loginData = {
    mobilePhone: loginmobilePhone.value,
    password: loginPassword.value
  };

  loginReq.send(() => login(loginData), (res) => {
    if (res.success) {
      auth.setAuth({ user: res.data, accessToken: res.data.token });
      localStorage.setItem("userDetail", JSON.stringify(res.data));
      reRoute();
    } else {
      const errorMsg = res?.error?.toLowerCase?.() || res?.message?.toLowerCase?.() || "";
      
      // Check if account is not active/needs verification
      if (res.status === 404 && errorMsg.includes("not active")) {
        pendingLoginData.value = loginData;
        showVerificationModal.value = true;
        toasted(false, "", "Account verification required");
        return;
      }
      
      toasted(false, "Login failed", res.error || res.message || "Something went wrong");
    }
  });
}

function sendVerification() {
  verifyReq.send(() => sendVerificationCode(phoneNumber.value), (res) => {
    let parsed = null;
    if (typeof res.data === "string" && res.data.startsWith("Success:")) {
      try {
        parsed = JSON.parse(res.data.replace("Success: ", ""));
      } catch (e) {
        console.error("Failed to parse verification response:", e);
      }
    }
    if (parsed && parsed.acknowledge === "success") {
      toasted(true, "Verification code sent successfully");
    } else {
      const errorMsg =
        parsed?.response?.errors?.[0] || parsed?.acknowledge || res.error || "Verification failed";
      toasted(false, "Send Code Failed", errorMsg);
    }
  });
}

function submitVerification() {
  const verificationCode = otpInputs.value.join("");
  
  if (!verificationCode || !phoneNumber.value.trim()) {
    toasted(false, "", "Please enter both phone number and verification code");
    return;
  }
  
  verifyReq.send(() => verifyUser(phoneNumber.value, verificationCode), (res) => {
    if (res.success) {
      toasted(true, "Account verified successfully");
      closeVerificationModal();
      if (pendingLoginData.value) {
        // Retry login after verification
        loginReq.send(() => login(pendingLoginData.value), (loginRes) => {
          if (loginRes.success) {
            auth.setAuth({ user: loginRes.data, accessToken: loginRes.data.token });
            localStorage.setItem("userDetail", JSON.stringify(loginRes.data));
            reRoute();
          }
        });
      }
    } else {
      toasted(false, "", res.error || "Verification failed");
    }
  });
}

function closeVerificationModal() {
  showVerificationModal.value = false;
  phoneNumber.value = "";
  pendingLoginData.value = null;
  otpInputs.value = ["", "", "", ""];
}

// ------------------ FORGOT PASSWORD ------------------
const showForgotPasswordModal = ref(false);
const forgotStep = ref(1);
const forgotPhone = ref("");
const forgotOtp = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const forgotReq = useApiRequest();

function openForgotPasswordModal() {
  showForgotPasswordModal.value = true;
  forgotStep.value = 1;
}

function closeForgotPasswordModal() {
  showForgotPasswordModal.value = false;
  forgotPhone.value = "";
  forgotOtp.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  forgotStep.value = 1;
  forgotOtpInputs.value = ["", "", "", ""];
}

function sendForgotPassword() {
  forgotReq.send(() => forgotPassword(forgotPhone.value), (res) => {
    console.log("Forgot Password Response:", res);

    if (res.success) {
      toasted(true, "OTP sent successfully");
      forgotStep.value = 2;
    } else {
      const msg = res.message || res.error || "";
      console.log("Error message:", msg);

      if (
        msg.toLowerCase().includes("otp has already been sent")
      ) {
        toasted(true, "OTP already sent. Please enter the last received OTP");
        forgotStep.value = 2;
      } else {
        toasted(false, "", msg || "Failed to send OTP");
      }
    }
  });
}

function verifyForgotOtp() {
  forgotOtp.value = forgotOtpInputs.value.join("");
  
  forgotReq.send(() => enterVerificationCode(forgotPhone.value, forgotOtp.value), (res) => {
    if (res.success) {
      toasted(true, "OTP verified");
      forgotStep.value = 3;
    } else {
      toasted(false, "", res.error || "Invalid OTP");
    }
  });
}

function submitResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    toasted(false, "", "Passwords do not match");
    return;
  }
  
  forgotOtp.value = forgotOtpInputs.value.join("");
  
  const data = {
    passwordResetOtp: forgotOtp.value,
    userName: forgotPhone.value,
    confirmPassword: confirmPassword.value,
    newPassword: newPassword.value,
  };
  
  forgotReq.send(() => resetPassword(data), (res) => {
    if (res.success) {
      toasted(true, "Password reset successfully");
      closeForgotPasswordModal();
    } else {
      toasted(false, "", res.error || "Reset failed");
    }
  });
}

function goToSignup() {
  router.push("/signUp");
}

// OTP Input Handling
const otpInputs = ref(["", "", "", ""]);

function focusNext(index) {
  if (otpInputs.value[index].length === 1 && index < 3) {
    const next = document.querySelectorAll('.fixed input[type="text"]')[index + 1];
    next?.focus();
  }
}

const forgotOtpInputs = ref(["", "", "", ""]);

function focusNextForgotOtp(index) {
  if (forgotOtpInputs.value[index].length === 1 && index < 3) {
    const inputs = document.querySelectorAll('.fixed input[type="text"]');
    // Find the next input in the forgot password modal
    const nextInput = inputs[index + 5]; // Adjust index based on DOM structure
    if (nextInput) {
      nextInput.focus();
    }
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

/* Input autofill styles */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: white;
  -webkit-box-shadow: 0 0 0px 1000px #2d2a24 inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>