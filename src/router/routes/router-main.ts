import RouteFolder from '../views/RouteFolder.vue'
import RouteFile from '../views/RouteFile.vue'

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
    path: '/folder/file/:id',
    name: 'RouteFile',
    component: RouteFile,
  },
]
