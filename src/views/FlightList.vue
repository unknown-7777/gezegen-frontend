<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api.js'

const router = useRouter()

const flights = ref([])
const searchFrom = ref('')
const searchTo = ref('')
const searchDate = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/flights')
    flights.value = Array.isArray(res.data)
      ? res.data
      : (res.data?.data || res || [])
  } catch (err) {
    console.error('Failed to load flights:', err)
  }
})

const availableOrigins = computed(() => {
  const cities = flights.value.map(f => f.departure_airport?.city || f.origin_code).filter(Boolean)
  return [...new Set(cities)]
})

const availableDestinations = computed(() => {
  const cities = flights.value.map(f => f.arrival_airport?.city || f.destination_code).filter(Boolean)
  return [...new Set(cities)]
})

const filteredFlights = computed(() => {
  return flights.value.filter(flight => {
    const origin = flight.departure_airport?.city || flight.origin_code || ''
    const destination = flight.arrival_airport?.city || flight.destination_code || ''
    const departureDate = flight.departure_time ? flight.departure_time.split(' ')[0] : ''

    const matchesFrom = !searchFrom.value || origin === searchFrom.value
    const matchesTo = !searchTo.value || destination === searchTo.value
    const matchesDate = !searchDate.value || departureDate === searchDate.value

    return matchesFrom && matchesTo && matchesDate
  })
})

const selectedRouteTitle = computed(() => {
  const from = searchFrom.value || 'All Origins'
  const to = searchTo.value || 'All Destinations'
  const dateStr = searchDate.value ? new Date(searchDate.value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'All Dates'
  return `${from} → ${to} · ${dateStr}`
})

const selectFlight = (flight) => {
  router.push({
    name: 'buy-ticket',
    params: { flightId: flight.id }
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return '00:00'
  if (timeStr.includes(' ')) {
    const timePart = timeStr.split(' ')[1]
    return timePart ? timePart.substring(0, 5) : timeStr
  }
  return timeStr.substring(0, 5)
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 text-slate-800">
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 mb-8 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">From</label>
          <select v-model="searchFrom" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition">
            <option value="">All Origins</option>
            <option v-for="city in availableOrigins" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">To</label>
          <select v-model="searchTo" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition">
            <option value="">All Destinations</option>
            <option v-for="city in availableDestinations" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
          <input type="date" v-model="searchDate" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition" />
        </div>

        <div>
          <button @click="searchFrom = ''; searchTo = ''; searchDate = ''" class="w-full bg-slate-300 hover:bg-slate-400 text-slate-600 font-medium py-2.5 px-4 rounded-xl text-sm transition">
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <div class="mb-6 px-1">
      <h2 class="text-xl font-bold text-slate-800 tracking-tight">
        {{ selectedRouteTitle }}
      </h2>
    </div>

    <div v-if="filteredFlights.length === 0" class="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      No flights match your selected filters.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="flight in filteredFlights"
        :key="flight.id"
        class="bg-white border border-slate-200/80 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md"
      >
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex-1">
            <div class="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">
              {{ flight.airline || 'Airline' }} &bull; Flight #{{ flight.id }}
            </div>

            <div class="flex items-center gap-8">
              <div>
                <span class="text-2xl font-black text-slate-900 tracking-tight block leading-none">{{ formatTime(flight.departure_time) }}</span>
                <span class="text-xs text-slate-500 font-medium mt-1 inline-block">{{ flight.departure_airport?.city || flight.origin_code }}</span>
              </div>

              <div class="flex flex-col items-center text-slate-300 px-2">
                <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Direct</span>
                <div class="w-24 h-[2px] bg-slate-200 relative flex items-center justify-center">
                  <div class="absolute w-1.5 h-1.5 rounded-full bg-slate-300 left-0"></div>
                  <svg class="w-3.5 h-3.5 text-teal-600 rotate-90 z-10 bg-white px-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                  <div class="absolute w-1.5 h-1.5 rounded-full bg-slate-300 right-0"></div>
                </div>
              </div>

              <div>
                <span class="text-2xl font-black text-slate-900 tracking-tight block leading-none">{{ formatTime(flight.arrival_time) }}</span>
                <span class="text-xs text-slate-500 font-medium mt-1 inline-block">{{ flight.arrival_airport?.city || flight.destination_code }}</span>
              </div>
            </div>
          </div>

          <div class="text-right flex flex-col items-end w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <span class="text-2xl font-black text-slate-900 tracking-tight leading-none">${{ flight.price }}</span>
            <span class="text-[11px] text-slate-400 font-medium mt-0.5 mb-1">per person</span>
            <span class="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mb-3">Empty seats: {{ flight.empty_seats ?? flight.available_seats ?? 20 }}</span>
            <button
              @click="selectFlight(flight)"
              class="w-full md:w-auto bg-slate-900 hover:bg-teal-600 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
