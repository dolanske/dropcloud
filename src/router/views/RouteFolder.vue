<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { concat, get, isEmpty, isNil, isObject, isObjectLike, set } from 'lodash'
import { useState } from '../../store/state'
import { APP_KEY, redirect_uri } from '../../config'
import { post } from '../../bin/fetch'
import { useFile } from '../../store/file'
import { useFolder } from '../../store/folder'

import FileRow from '../../components/FileRow.vue'
import FolderItem from '../../components/FolderItem.vue'

const url = `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&redirect_uri=${redirect_uri}&response_type=token`

const state = useState()
const file = useFile()
const folder = useFolder()

const rootPath = '/music'

// Recursively creates a nested object of folders and their subfolders
const add = (source: any, target: any) => {
  // Splits path by nesting
  const paths = source.split('/')
  // Returns first item from path
  const path = paths.shift()

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
    // file.fetchFilesFromPath(rootPath)
    folder.$patch({ root: rootPath })

    if (isEmpty(folder.folders)) {
      // TODO: Ideally this would be a function
      // Should be a recursive loop until has_next is false
      const batch1 = await post('/files/list_folder', {
        path: rootPath,
        include_mounted_folders: true,
        recursive: true,
      })

      const batch2 = await post('/files/list_folder/continue', { cursor: batch1.cursor })
      const allEntries = concat(batch1.entries, batch2.entries)

      if (allEntries) {
        const structured: any = {}
        const folders = allEntries.filter((item: any) => item['.tag'] === 'folder')
        folders.forEach(item => add(item.path_lower, structured))

        const structure = Object.values(structured)[0] as {}

        folder.updateStructure(folders, structure)
        // Set active folder as the first available one
        folder.$patch({ active: folders[0] })
      }
    }
  }
})

watch(() => folder.active, (value) => {
  file.fetchFilesFromPath(value.path_lower)
}, { immediate: true })
</script>

<template>
  <div class="route-folder">
    <div class="route-content">
      <div class="container">
        <div class="wrapper">
          <div class="sidebar-wrapper">
            <aside>
              <h4>Library</h4>

              <ul class="folder-structure">
                <FolderItem v-for="(item, key) in folder.folderStructure" :key="key" :label="key" :values="item" />
              </ul>
            </aside>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>Size</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <FileRow v-for="item in file.files" :key="item.id" :file="item" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- <a :href="url">Login</a> -->
  </div>
</template>

