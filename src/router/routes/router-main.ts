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
