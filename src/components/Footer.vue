<template>
  <footer class="bg-white border-t border-gray-200 py-6 px-8 mt-auto">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
      <div class="flex items-center space-x-2">
        <span class="font-extrabold text-blue-600 tracking-wider">GEZEGEN</span>
        <span>&copy; {{ new Date().getFullYear() }} All rights reserved.</span>
      </div>

      <div class="flex space-x-6">
        <router-link to="/flights" class="hover:text-blue-600 transition">Flights</router-link>
        <router-link to="/my-tickets" class="hover:text-blue-600 transition">My Tickets</router-link>
      </div>
    </div>
  </footer>
</template>
