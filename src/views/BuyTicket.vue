<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const flight = ref(null)
const loading = ref(false)
const error = ref(null)
const showToast = ref(false)

const passengers = ref([
  {
    fullName: '', email: '', phone: ''
  }
])

const showError = (msg) => {
  error.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
    error.value = null
  }, 3000)
}

onMounted(async () => {
  const flightId = route.params.flightId
  if (flightId) {
    try {
      const res = await api.get(`/flights/${flightId}`)
      flight.value = res
    } catch (e) {
      console.error('Failed to fetch flight details:', e)
    }
  }
  if (!flight.value) {
    router.push({ name: 'flights' })
  }
})

const addPassengerRow = () => {
  const maxSeats = flight.value?.total_seats ?? 20
  if (passengers.value.length >= maxSeats) {
    showError(`Cannot add more passengers. Maximum available seats: ${maxSeats}.`)
    return
  }
  passengers.value.push({ fullName: '', email: '', phone: '' })
}

const removePassengerRow = (index) => {
  if (passengers.value.length > 1) {
    passengers.value.splice(index, 1)
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return '00:00'
  if (timeStr.includes(' ')) {
    const timePart = timeStr.split(' ')[1]
    return timePart ? timePart.substring(0, 5) : timeStr
  }
  return timeStr.substring(0, 5)
}

const buyTickets = async () => {
  if (!flight.value) return
  loading.value = true

  const currentSeats = flight.value.total_seats ?? 20

  if (passengers.value.length > currentSeats) {
    showError(`Booking exceeds available seats (${currentSeats}).`)
    loading.value = false
    return
  }

  for (const p of passengers.value) {
    if (!p.email || !p.email.includes('@')) {
      showError('Please enter a valid email for all passengers.')
      loading.value = false
      return
    }
  }

  try {
    let lastTicketId = null

    for (let i = 0; i < passengers.value.length; i++) {
      const p = passengers.value[i]
      const nameParts = p.fullName.trim().split(' ')
      const firstName = nameParts[0] || 'Guest'
      const lastName = nameParts.slice(1).join(' ') || 'Passenger'

      const passengerRes = await api.post('/passengers', {
        first_name: firstName,
        last_name: lastName,
        email: p.email,
        phone: p.phone || '0000000000',
        passport_number: `NA-${Date.now()}-${i}`,
        date_of_birth: '2000-01-01'
      })

      const passengerId = passengerRes.id

      if (!passengerId) {
        showError('Failed to create passenger.')
        loading.value = false
        return
      }

      const ticketRes = await api.post('/tickets', {
        flight_id: flight.value.id,
        passenger_id: passengerId,
        seat_number: `A${i + 1}`,
        price: flight.value.price
      })

      lastTicketId = ticketRes.id
    }

    router.push({ name: 'ticket-success', query: { ticketId: lastTicketId } })

  } catch {
    showError('Failed to complete booking.')
  } finally {
    loading.value = false
  }
}
</script>

<template>

  <transition name="slide-down">
    <div
      v-if="showToast"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
    >
      ⚠️ {{ error }}
    </div>
  </transition>

  <div v-if="flight" class="max-w-3xl mx-auto px-4 py-8 text-slate-800">
    <div class="mb-6 flex justify-between items-center">
      <button @click="router.push({ name: 'flights' })" class="text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
        &larr; Back to Flights
      </button>
      <h2 class="text-xl font-bold text-slate-800 tracking-tight">Checkout</h2>
    </div>

    <div class="bg-white border border-slate-200/80 rounded-2xl p-6 mb-6 shadow-sm">
      <div class="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
        Flight #{{ flight.id }}
      </div>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-6">
          <div>
            <span class="text-2xl font-black text-slate-900 tracking-tight block leading-none">{{ formatTime(flight.departure_time) }}</span>
            <span class="text-xs text-slate-500 font-medium mt-1 inline-block">{{ flight.departure_airport?.city }}</span>
          </div>
          <div class="text-slate-400 text-xs font-bold uppercase">&rarr;</div>
          <div>
            <span class="text-2xl font-black text-slate-900 tracking-tight block leading-none">{{ formatTime(flight.arrival_time) }}</span>
            <span class="text-xs text-slate-500 font-medium mt-1 inline-block">{{ flight.arrival_airport?.city }}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-2xl font-black text-slate-900 tracking-tight leading-none">${{ flight.price }}</span>
          <span class="text-[11px] text-slate-400 block mt-0.5">per person</span>
        </div>
      </div>
    </div>

    <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-sm font-bold text-slate-800">Passenger Details</h4>
        <button
          @click="addPassengerRow"
          class="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition"
        >
          + Add Passenger
        </button>
      </div>

      <div class="space-y-4 mb-6">
        <div
          v-for="(passenger, index) in passengers"
          :key="index"
          class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Passenger {{ index + 1 }}</span>
            <button
              v-if="passengers.length > 1"
              @click="removePassengerRow(index)"
              class="text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
            >
              Remove
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Full name</label>
              <input v-model="passenger.fullName" type="text" placeholder="..."
                class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Email</label>
              <input v-model="passenger.email" type="email" placeholder="email@example.com"
                class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Phone</label>
              <input v-model="passenger.phone" type="text" placeholder="+993..."
                class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div>
          <p class="text-xs font-semibold text-slate-700">
            Total: <span class="text-teal-600 text-sm font-bold">${{ flight.price * passengers.length }}</span>
          </p>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Seats available: {{ flight.total_seats ?? 20 }}
          </p>
        </div>

        <button
          @click="buyTickets"
          :disabled="loading"
          class="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-8 py-3 rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Confirm & Buy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
