import RouteFolder from '../views/RouteFolder.vue'
import RoutePlayer from '../views/RoutePlayer.vue'
import RouteSearch from '../views/RouteSearch.vue'
import RouteTracklist from '../views/RouteTracklist.vue'

export default [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'RouteFolder' },
  },
  {
    path: '/folder',
    name: 'RouteFolder',
    component: RouteFolder,
    meta: {
      title: 'Your music folder',
    },
  },
  {
    path: '/player/:id?',
    name: 'RoutePlayer',
    component: RoutePlayer,
  },
  {
    path: '/search',
    name: 'RouteSearch',
    component: RouteSearch,
  },
  {
    path: '/tracklist',
    name: 'RouteTracklist',
    component: RouteTracklist,
  },
]
