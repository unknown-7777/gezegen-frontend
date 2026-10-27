<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-gray-100 py-3 px-8 flex justify-between items-center shadow-sm">
    <router-link to="/" class="flex items-center space-x-3 group">
      <div class="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.5 1.2c-.2.5 0 1.1.4 1.4l5 4-3.5 3.5H3l2 2 2 2h1.5l3.5-3.5 4 5c.3.4.9.6 1.4.4l1.2-.5c.4-.2.6-.6.5-1.1Z"/>
        </svg>
      </div>
      <div class="flex flex-col">
        <span class="text-xl font-extrabold text-blue-600 tracking-wider">
          GEZEGEN
        </span>
        <span class="text-[10px] font-semibold text-slate-600 tracking-widest uppercase -mt-1">
          Travel
        </span>
      </div>
    </router-link>


    <div class="space-x-8 flex items-center">
      <router-link to="/flights"
        class="text-sm font-medium transition-colors text-slate-600 hover:text-blue-600"
        exact-active-class="!text-blue-600 !font-semibold">
        Flights
      </router-link>
      <router-link to="/my-tickets"
        class="text-sm font-medium transition-colors text-slate-600 hover:text-blue-600"
        active-class="!text-blue-600 !font-semibold">
        My Tickets
      </router-link>
    </div>
  </nav>
</template>
