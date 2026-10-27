<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api.js'

const tickets = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await api.get('/tickets')
    tickets.value = Array.isArray(data) ? data : (data.data || [])
  } catch (err) {
    console.error('Failed to fetch tickets:', err)
    error.value = 'Could not load your tickets.'
  } finally {
    loading.value = false
  }
})

const getOrigin = (t) => t.flight?.departure_airport?.city || t.flight?.from || t.from || 'Origin'
const getDestination = (t) => t.flight?.arrival_airport?.city || t.flight?.to || t.to || 'Destination'
const getPassengerName = (t) => {
  if (t.passenger) return `${t.passenger.first_name || ''} ${t.passenger.last_name || ''}`.trim() || 'Passenger'
  return t.passenger_name || 'Passenger'
}
const getPrice = (t) => t.price || t.flight?.price || '0.00'
const getDeparture = (t) => t.flight?.departure_time || t.departure_time || 'N/A'
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 text-slate-800">
    <div class="flex justify-between items-center mb-8 px-1">
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">My Booked Tickets</h1>
      <span class="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full" v-if="!loading">
        Total: {{ tickets.length }} tickets
      </span>
    </div>

    <div v-if="loading" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center text-slate-400 text-sm">
      <p>Loading your tickets...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-700 rounded-2xl border border-red-200 p-6 text-center text-sm font-medium">
      {{ error }}
    </div>

    <div v-else-if="tickets.length === 0" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center space-y-4">
      <p class="text-slate-500 text-base font-medium">You haven't booked any tickets yet.</p>
      <router-link to="/flights" class="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-sm">
        Browse Flights
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="ticket in tickets" :key="ticket.id"
        class="bg-white border border-gray-200 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

        <div class="space-y-3 flex-1">
          <div class="flex items-center space-x-3">
            <span class="text-xs font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg">
              #TCK-{{ ticket.id }}
            </span>
            <span v-if="ticket.seat_number" class="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
              Seat {{ ticket.seat_number }}
            </span>
            <span :class="{
              'bg-emerald-50 text-emerald-700 border border-emerald-200': ticket.status === 'booked',
              'bg-red-50 text-red-700 border border-red-200': ticket.status === 'cancelled',
              'bg-blue-50 text-blue-700 border border-blue-200': ticket.status === 'completed',
            }" class="text-xs font-semibold px-2.5 py-1 rounded-lg capitalize">
              {{ ticket.status }}
            </span>
          </div>

          <p class="text-xl font-black text-slate-900 tracking-tight">
            {{ getOrigin(ticket) }} <span class="text-blue-600 font-bold mx-1">→</span> {{ getDestination(ticket) }}
          </p>

          <div class="text-xs text-slate-500 font-medium space-y-1">
            <p>Passenger: <span class="font-semibold text-slate-800">{{ getPassengerName(ticket) }}</span></p>
            <p>Departure: <span class="text-slate-700 font-medium">{{ getDeparture(ticket) }}</span></p>
          </div>
        </div>

        <div class="text-right flex flex-col items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <p class="text-2xl font-black text-blue-600 tracking-tight leading-none mb-1">${{ getPrice(ticket) }}</p>
          <span class="text-[11px] text-slate-400 font-medium mb-3">Total paid</span>
          <router-link :to="{ name: 'ticket-success', query: { ticketId: ticket.id } }"
            class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow-sm text-center">
            View Boarding Pass
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>
