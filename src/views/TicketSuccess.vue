<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const tickets = ref([])
const loading = ref(true)

onMounted(async () => {
  const rawIds = route.query.ticketIds || route.query.ticketId
  if (!rawIds) {
    router.push({ name: 'flights' })
    return
  }

  const ids = String(rawIds).split(',').map(id => id.trim()).filter(Boolean)
  if (ids.length === 0) {
    router.push({ name: 'flights' })
    return
  }

  try {
    const promises = ids.map(id => api.get(`/tickets/${id}`))
    tickets.value = await Promise.all(promises)
  } catch (err) {
    console.error('Failed to load tickets', err)
    router.push({ name: 'flights' })
  } finally {
    loading.value = false
  }
})

const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A'
  if (timeStr.includes(' ')) return timeStr.split(' ')[1].substring(0, 5)
  return timeStr.substring(0, 5)
}

const formatDate = (timeStr) => {
  if (!timeStr) return 'N/A'
  return timeStr.split(' ')[0]
}

const getBookingRef = (id) => {
  return `TKT-${String(id).padStart(5, '0')}`
}

const downloadTicket = () => {
  window.print()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 flex flex-col items-center justify-center print:bg-white print:py-0">

    <div v-if="loading" class="text-gray-500 text-sm">Loading your tickets...</div>

    <div v-else-if="tickets.length > 0" class="max-w-2xl w-full space-y-8">

      <div class="text-center print:hidden">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900">Booking Confirmed!</h1>
        <p class="mt-2 text-sm text-gray-600">
          Your {{ tickets.length }} ticket{{ tickets.length > 1 ? 's' : '' }} have been booked successfully.
        </p>
      </div>

      <div v-for="ticket in tickets" :key="ticket.id" class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 print:shadow-none print:border-gray-300 print:rounded-none mb-6">

        <div class="bg-teal-600 px-6 py-4 text-white flex justify-between items-center print:bg-teal-600">
          <div>
            <p class="text-xs uppercase tracking-wider font-semibold text-teal-200">Boarding Pass</p>
            <h2 class="text-xl font-bold">GEZEGEN AIRLINES</h2>
          </div>
          <div class="text-right">
            <span class="inline-block bg-teal-700 px-3 py-1 rounded-full text-xs font-mono font-medium">
              {{ getBookingRef(ticket.id) }}
            </span>
          </div>
        </div>

        <div class="p-6 md:p-8 space-y-6">

          <div class="flex items-center justify-between border-b pb-6 border-gray-100">
            <div>
              <p class="text-3xl font-black text-gray-800">{{ ticket.flight?.departure_airport?.code || 'N/A' }}</p>
              <p class="text-sm font-medium text-gray-500">{{ ticket.flight?.departure_airport?.city || 'N/A' }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatTime(ticket.flight?.departure_time) }}</p>
            </div>

            <div class="flex flex-col items-center px-4">
              <div class="relative flex items-center w-28 md:w-48">
                <div class="h-0.5 bg-gray-300 w-full"></div>
                <svg class="w-7 h-7 text-teal-600 absolute left-1/2 transform -translate-x-1/2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <span class="text-xs text-gray-400 mt-2">Direct Flight</span>
            </div>

            <div class="text-right">
              <p class="text-3xl font-black text-gray-800">{{ ticket.flight?.arrival_airport?.code || 'N/A' }}</p>
              <p class="text-sm font-medium text-gray-500">{{ ticket.flight?.arrival_airport?.city || 'N/A' }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatTime(ticket.flight?.arrival_time) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Passenger</p>
              <p class="font-semibold text-gray-800 mt-1">
                {{ ticket.passenger?.full_name || ticket.passenger?.first_name || 'N/A' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
              <p class="font-semibold text-gray-800 mt-1">{{ formatDate(ticket.flight?.departure_time) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Departure</p>
              <p class="font-semibold text-gray-800 mt-1">{{ formatTime(ticket.flight?.departure_time) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Arrival</p>
              <p class="font-semibold text-gray-800 mt-1">{{ formatTime(ticket.flight?.arrival_time) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Seat</p>
              <p class="font-semibold text-teal-600 mt-1">{{ ticket.seat || ticket.seat_number || 'A1' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</p>
              <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-green-100 text-green-700">
                {{ ticket.status || 'Booked' }}
              </span>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Price</p>
              <p class="font-semibold text-gray-800 mt-1">${{ ticket.price }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Class</p>
              <p class="font-semibold text-gray-800 mt-1">Economy</p>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
            <p class="font-semibold text-gray-800 mt-1 text-sm">{{ ticket.passenger?.email || 'N/A' }}</p>
          </div>

          <div class="border-t border-dashed border-gray-200 pt-6 flex justify-center">
            <div class="font-mono text-center tracking-widest text-xs bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
              ||| | |||| | ||| || ||{{ getBookingRef(ticket.id) }}|| | ||| | ||
            </div>
          </div>

        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center items-center print:hidden">
        <button
          @click="downloadTicket"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download / Print PDF
        </button>

        <router-link
          to="/"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm"
        >
          Back to Flights
        </router-link>
      </div>

    </div>
  </div>
</template>

<style>
@media print {
  nav,
  .print\:hidden {
    display: none !important;
  }
  body {
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-teal-600 {
    background-color: #0d9488 !important;
  }
}
</style>
