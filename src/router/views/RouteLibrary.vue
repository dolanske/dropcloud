<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { concat, isEmpty, isObject, orderBy } from 'lodash'
import { useState } from '../../store/state'
import { post } from '../../bin/fetch'
import { useFile } from '../../store/file'
import { useFolder } from '../../store/folder'
import type { DbxFolder, DbxRequest, DbxStructure } from '../../types/dropbox-types'

import FileRow from '../../components/FileRow.vue'
import FolderItem from '../../components/FolderItem.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import { useLoading } from '../../store/loading'

const state = useState()
const file = useFile()
const folder = useFolder()
const loading = useLoading()

const rootPath = '/music'

// Sorting
interface Sorting {
  type: 'name' | 'size' | 'client_modified'
  order: 'desc' | 'asc'
}
const sorting = reactive<Sorting>({
  type: 'name',
  order: 'desc',
})

function toggleSorting(type: Sorting['type']) {
  sorting.order = type === sorting.type
    ? sorting.order === 'desc' ? 'asc' : 'desc'
    : 'desc'
  sorting.type = type
}

// Recursively creates a nested object of folders and their subfolders
function add(source: string, target: Record<any, any>) {
  // Splits path by nesting
  const paths = source.split('/')
  // Returns first item from path
  const path = String(paths.shift())

  // { <path>: {...} || <path>}
  target[path] = target[path] || path

  // If there is nesting (we removed the first one ^^)
  if (paths.length) {
    // If sub path contains object / is nested, assign it, otherwise create empty object
    target[path] = isObject(target[path]) ? target[path] : {}

    // Recursively call self
    add(paths.join('/'), target[path])
  }
}

// Once we are loaded and have a token
onMounted(async () => {
  if (state.token) {
    loading.set('init-folder')

    // file.fetchFilesFromPath(rootPath)
    folder.$patch({ root: rootPath })

    if (isEmpty(folder.folders)) {
      // TODO: Ideally this would be a function
      // Should be a recursive loop until has_next is false
      const batch1 = await post<DbxRequest>('/files/list_folder', {
        path: rootPath,
        include_mounted_folders: true,
        recursive: true,
      })

      const batch2 = await post<DbxRequest>('/files/list_folder/continue', { cursor: batch1.cursor })
      const allEntries = concat(batch1.entries, batch2.entries)

      if (allEntries) {
        folder.$patch({ everything: allEntries })

        const structured: DbxStructure = {}
        // entry is type File
        const folders = allEntries.filter((item: any) => item['.tag'] === 'folder') as DbxFolder[]
        folders.forEach(item => add(item.path_lower, structured))

        // The root folder is {'': {}} So we go one nesting deeper to avoid any issues
        const structure = Object.values(structured)[0] as DbxStructure

        folder.updateStructure(folders, structure)
        // Set active folder as the first available one
        folder.$patch({ active: folders[0] })
      }
    }

    loading.del('init-folder')
  }
})

watch(() => folder.active, (value) => {
  // If active folder changes, fetch for the files within
  file.fetchFilesFromPath(value.path_lower || rootPath)
}, { immediate: true })

// Current folder's files list and sort it alphabetically
const sortedFiles = computed(() => {
  if (!file.files)
    return []

  return orderBy(file.files, ['.tag', sorting.type], ['desc', sorting.order])
})
</script>

<template>
  <div class="route-folder">
    <div class="route-content">
      <!-- <div class="container"> -->
      <div class="wrapper">
        <div class="sidebar-wrapper">
          <Bar v-if="(loading.get('init-folder') || !folder.folderStructure)" :width="156" />
          <aside v-else>
            <h5>Library</h5>

            <ul class="folder-structure">
              <FolderItem v-for="(item, key) in folder.folderStructure" :key="key" :label="key" :values="item" />
            </ul>
          </aside>
        </div>
        <div class="table-wrapper">
          <Transition name="fade" mode="out-in" appear>
            <Bar v-if="loading.get('folder')" />
            <div v-else>
              <Breadcrumbs />

              <table v-if="sortedFiles.length > 0">
                <thead>
                  <tr>
                    <th />
                    <th :class="{ 'is-sorting': sorting.type === 'name' }">
                      <button @click="toggleSorting('name')">
                        Name
                        <Icon :code="sorting.order === 'desc' ? 'e5db' : 'e5d8'" size="1.6" />
                      </button>
                    </th>
                    <th :class="{ 'is-sorting': sorting.type === 'size' }">
                      <button @click="toggleSorting('size')">
                        Size
                        <Icon :code="sorting.order === 'desc' ? 'e5db' : 'e5d8'" size="1.6" />
                      </button>
                    </th>
                    <th :class="{ 'is-sorting': sorting.type === 'client_modified' }">
                      <button @click="toggleSorting('client_modified')">
                        Uploaded
                        <Icon :code="sorting.order === 'desc' ? 'e5db' : 'e5d8'" size="1.6" />
                      </button>
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <FileRow v-for="item in sortedFiles" :key="item.id" :file="item" />
                </tbody>
              </table>
              <div v-else class="no-results">
                <h2>Bruh</h2>
                <p>This file does not contain any files or sub folders.</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
      <!-- </div> -->
    </div>

    <!-- <a :href="url">Login</a> -->
  </div>
</template>
