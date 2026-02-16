<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Table from '@/components/Table.vue';
import icons from '@/utils/icons';
import DoughnutChart from '../components/DoughnutChart.vue';
import BarChart from '../components/BarChart.vue';
import Button from '@/components/Button.vue';
import LineChart from '../components/lineChart.vue';
import WeeklyRevenue from '../components/weeklyRevenue.vue';
import TableDashboard from '../components/tableDashboard.vue';
import TaskList from '../components/taskList.vue';
import TraficCard from '../components/traficCard.vue';
import PieChart from '../components/pieChart.vue';
import ComplexTable from '../components/complexTable.vue';
import CalanderDashboard from '../components/calanderDashboard.vue';
import Last from '../components/last.vue';
</script>

<template>
  <div class="min-h-screen w-full bg-gray-50/50">
    <!-- Main Container - Mobile First -->
    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">Welcome back, Admin 👋</p>
        </div>
        <!-- <div class="flex items-center gap-2 w-full sm:w-auto">
          <button class="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span class="hidden sm:inline">Filter</span>
          </button>
          <button class="flex-1 sm:flex-none px-4 py-2 bg-[#4318FF] text-white rounded-xl text-sm hover:bg-[#3311DD] transition-colors flex items-center justify-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">New Report</span>
          </button>
        </div> -->
      </div>

      <!-- Stats Cards - Horizontal Scroll on Mobile -->
      <div class="overflow-x-auto pb-2 -mx-3 px-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        <div class="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 min-w-min sm:min-w-0">
          
          <!-- Earnings Card -->
          <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex-shrink-0 w-64 sm:w-auto hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 sm:h-12 sm:w-12 bg-[#4318FF]/10 rounded-xl flex items-center justify-center">
                  <i v-html="icons.bar" class="w-5 h-5 sm:w-6 sm:h-6 text-[#4318FF]" />
                </div>
                <div>
                  <p class="text-xs sm:text-sm text-gray-500">Earnings</p>
                  <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-1">$350.4</p>
                </div>
              </div>
              <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">+12.5%</span>
            </div>
          </div>

          <!-- Cars Card -->
          <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex-shrink-0 w-64 sm:w-auto hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 sm:h-12 sm:w-12 bg-[#6AD2FF]/10 rounded-xl flex items-center justify-center">
                  <i v-html="icons.logo" class="w-5 h-5 sm:w-6 sm:h-6 text-[#6AD2FF]" />
                </div>
                <div>
                  <p class="text-xs sm:text-sm text-gray-500">Cars</p>
                  <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-1">$574.34</p>
                  <p class="text-xs text-gray-400 mt-0.5">+23 since last</p>
                </div>
              </div>
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">+15</span>
            </div>
          </div>

          <!-- Users Card -->
          <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex-shrink-0 w-64 sm:w-auto hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <i v-html="icons.task" class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p class="text-xs sm:text-sm text-gray-500">Users</p>
                  <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-1">154</p>
                </div>
              </div>
              <span class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section - Stack on Mobile, Grid on Desktop -->
      <div class="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Weekly Revenue -->
        <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <WeeklyRevenue />
        </div>
        
        <!-- Doughnut Chart -->
        <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <DoughnutChart />
        </div>
      </div>

      <!-- Table Dashboard -->
      <div class="mt-4 sm:mt-6">
        <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <TableDashboard />
        </div>
      </div>

      <!-- Complex Table and Traffic Card -->
      <div class="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <ComplexTable />
        </div>
        <div class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <TraficCard />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Mobile optimizations */
@media (max-width: 640px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .overflow-x-auto::-webkit-scrollbar {
    display: none;
  }
}

/* Smooth transitions */
.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}

/* Custom scrollbar for desktop */
@media (min-width: 640px) {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}
</style>