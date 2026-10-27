import { createRouter, createWebHistory } from 'vue-router'
import FlightList from '@/views/FlightList.vue'
import BuyTicket from '@/views/BuyTicket.vue'
import TicketSuccess from '@/views/TicketSuccess.vue'
import MyTickets from '@/views/MyTickets.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/flights'
    },
    {
      path: '/flights',
      name: 'flights',
      component: FlightList
    },
    {
      path: '/buy/:flightId',
      name: 'buy-ticket',
      component: BuyTicket
    },
    {
      path: '/success',
      name: 'ticket-success',
      component: TicketSuccess
    },
    {
      path: '/my-tickets',
      name: 'my-tickets',
      component: MyTickets
    },
  ],
})

export default router
