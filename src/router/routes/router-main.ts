import RouteLibrary from '../views/RouteLibrary.vue'
import RoutePlayer from '../views/RoutePlayer.vue'
import RouteSearch from '../views/RouteSearch.vue'
import RouteTracklist from '../views/RouteTracklist.vue'

export default [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'RouteLibrary' },
  },
  {
    path: '/library',
    name: 'RouteLibrary',
    component: RouteLibrary,
    meta: {
      title: 'Your music folder',
      name: 'Library',
    },
  },
  {
    path: '/player/:id?',
    name: 'RoutePlayer',
    component: RoutePlayer,
    meta: {
      title: 'Player & Vizualizedr',
      name: 'Player',
    },
  },
  {
    path: '/search',
    name: 'RouteSearch',
    component: RouteSearch,
    meta: {
      title: 'Search for songs',
      name: 'Search',
    },
  },
  {
    path: '/tracklist',
    name: 'RouteTracklist',
    component: RouteTracklist,
    meta: {
      title: 'History & Query',
      name: 'Tracklist',
    },
  },
]
