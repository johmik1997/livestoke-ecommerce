<script setup>
import icons from "@/utils/icons";
import LoginForm from "./components/LoginForm.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function goToSignup() {
  router.push("/signUp");
}
</script>

<template>
  <div class="min-h-screen w-full relative overflow-auto bg-gradient-to-br from-amber-900/90 via-stone-800 to-emerald-900/90">
    <!-- Rustic Farm Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="farm-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <!-- Hay bale pattern -->
            <circle cx="20" cy="20" r="8" fill="#D4A373" opacity="0.3"/>
            <circle cx="40" cy="20" r="6" fill="#BC8F4B" opacity="0.3"/>
            <!-- Hoof prints -->
            <path d="M60 60 Q65 55 70 60 T80 60" stroke="#8B5E3C" stroke-width="2" fill="none" opacity="0.2"/>
            <!-- Wheat stalks -->
            <path d="M10 70 L15 60 L20 70" stroke="#C4A484" stroke-width="2" fill="none" opacity="0.2"/>
          </pattern>
          <pattern id="wood-grain" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="#5D3A1A" opacity="0.1"/>
            <path d="M0 30 L100 30 M20 0 L20 100 M50 60 L50 100" stroke="#8B5E3C" stroke-width="2" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#farm-pattern)"/>
        <rect width="100%" height="100%" fill="url(#wood-grain)"/>
      </svg>
    </div>

    <!-- Animated Farm Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Floating hay particles -->
      <div class="absolute top-20 left-1/4 w-4 h-4 bg-amber-600/20 rounded-full animate-float-slow"></div>
      <div class="absolute bottom-40 right-1/3 w-6 h-6 bg-emerald-600/20 rounded-full animate-float-delayed"></div>
      
      <!-- Silhouette of oxen at rest -->
      <div class="absolute bottom-10 left-10 opacity-10 hidden lg:block">
        <svg width="200" height="100" viewBox="0 0 200 100">
          <path d="M40 70 L60 40 L80 40 L100 70" stroke="#fff" stroke-width="3" fill="none"/>
          <circle cx="55" cy="35" r="8" stroke="#fff" stroke-width="2" fill="none"/>
          <circle cx="85" cy="35" r="8" stroke="#fff" stroke-width="2" fill="none"/>
        </svg>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen relative z-10">
      <!-- Left Content - Marketplace Info -->
      <div class="hidden lg:flex p-10 xl:p-20 flex-col justify-between bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm">
        <div class="space-y-8">
          <!-- Brand Badge -->
          <div class="inline-flex items-center gap-3 px-4 py-2 bg-amber-800/40 rounded-full border border-amber-500/30 backdrop-blur">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-amber-100 text-sm font-medium tracking-wider">B2B LIVESTOCK MARKETPLACE</span>
          </div>

          <!-- Main Heading -->
          <div class="space-y-4">
            <h1 class="font-serif text-5xl xl:text-6xl text-white font-bold leading-tight">
              <span class="block">MESKEL SQUARE</span>
              <span class="text-amber-300 text-4xl xl:text-5xl">OXEN TRADING PLATFORM</span>
            </h1>
            
            <p class="text-stone-200 text-lg max-w-xl leading-relaxed">
              Join Ethiopia's premier B2B platform for premium oxen. 
              Connect with verified sellers, access detailed analytics, 
              and make informed trading decisions with real-time market data.
            </p>
          </div>

          <!-- Feature Pills -->
          <div class="flex flex-wrap gap-3 mt-4">
            <span class="px-3 py-1.5 bg-amber-900/40 text-amber-100 rounded-full text-sm border border-amber-600/30 backdrop-blur">
              🐂 Premium Listings
            </span>
            <span class="px-3 py-1.5 bg-amber-900/40 text-amber-100 rounded-full text-sm border border-amber-600/30 backdrop-blur">
              📊 Price Analytics
            </span>
            <span class="px-3 py-1.5 bg-amber-900/40 text-amber-100 rounded-full text-sm border border-amber-600/30 backdrop-blur">
              🤝 Verified Sellers
            </span>
            <span class="px-3 py-1.5 bg-amber-900/40 text-amber-100 rounded-full text-sm border border-amber-600/30 backdrop-blur">
              📱 Mobile Access
            </span>
            <span class="px-3 py-1.5 bg-amber-900/40 text-amber-100 rounded-full text-sm border border-amber-600/30 backdrop-blur">
              📋 Health Certificates
            </span>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mt-8 max-w-[500px]">
            <div class="bg-stone-900/40 backdrop-blur rounded-lg p-4 border border-amber-600/30">
              <p class="text-2xl font-bold text-amber-400">2.5k+</p>
              <p class="text-xs text-stone-300">Active Sellers</p>
            </div>
            <div class="bg-stone-900/40 backdrop-blur rounded-lg p-4 border border-amber-600/30">
              <p class="text-2xl font-bold text-amber-400">15k+</p>
              <p class="text-xs text-stone-300">Oxen Listed</p>
            </div>
            <div class="bg-stone-900/40 backdrop-blur rounded-lg p-4 border border-amber-600/30">
              <p class="text-2xl font-bold text-amber-400">98%</p>
              <p class="text-xs text-stone-300">Success Rate</p>
            </div>
          </div>

          <!-- Call to Action -->
          <button 
            class="group w-fit px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 
                   text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-900/50 transition-all 
                   flex items-center gap-3 border border-amber-400/30"
            @click="goToSignup"
          >
            <span class="text-lg">Register Your Oxen</span>
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Right Content - Login Form -->
      <div class="flex items-center justify-center p-4 sm:p-10">
        <div class="relative w-full max-w-md">
          <!-- Mobile Header -->
          <div class="lg:hidden mb-8 text-center space-y-3">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-800/30 rounded-full border border-amber-500/30">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span class="text-amber-100 text-xl font-medium">KERA OXEN TRADE</span>
            </div>
            <h1 class="text-3xl font-bold text-white font-serif">Welcome Back</h1>
            <p class="text-stone-300 text-sm">Access your trading dashboard</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>

    <!-- Footer Status Bar -->
    <div class="absolute bottom-0 left-0 right-0 h-8 bg-black/40 backdrop-blur border-t border-amber-700/30 hidden lg:flex items-center px-6 text-xs text-amber-200">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          MARKET ACTIVE
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          LIVE PRICING
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          VERIFIED LISTINGS
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-30px) scale(1.1); }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 10s ease-in-out infinite;
}

.delay-1000 {
  animation-delay: 1000ms;
}

.delay-700 {
  animation-delay: 700ms;
}

/* Custom scrollbar for the whole page */
.min-h-screen {
  scrollbar-width: thin;
  scrollbar-color: #b45309 #2d2a24;
}

.min-h-screen::-webkit-scrollbar {
  width: 8px;
}

.min-h-screen::-webkit-scrollbar-track {
  background: #2d2a24;
}

.min-h-screen::-webkit-scrollbar-thumb {
  background: #b45309;
  border-radius: 4px;
}

.min-h-screen::-webkit-scrollbar-thumb:hover {
  background: #92400e;
}
</style>