import { defineStore } from 'pinia'
import { rndMinMax } from '../bin/utils'
import { useFolder } from './folder'

interface State {
  /**
   * Tracks the listening history. Use the `current` to play through
   * the history and keep track of where the player.
   */
  history: string[]
  /**
   * Tracks the upcoming tracks it will play. Does not use `current`.
   * Because any new played track automatically gets added to the history.
   * Which will then use the index
   */
  queue: string[]

  current: number
  limit: number
}

export const useTracklist = defineStore('tracklist', {
  state: () => ({
    history: [],
    queue: [],
    current: 0,
    limit: 100,
  } as State),
  actions: {
    // Adds a history entry
    pushHistory(id: string) {
      // If id is in history -> remove it so that it gets appended again
      if (this.history.includes(id))
        this.history = this.history.filter(track => track !== id)

      this.history.unshift(id)

      if (this.history.length >= this.limit)
        this.history.pop()
    },
    // TODO
    // Should support filling in the queue in case it is below the limit
    shuffleQueue(amount = 25) {
      const folder = useFolder()
      const files = folder.getFiles

      // Until the queue array reaches the desired length, insert unique track
      // ids into it
      while (this.queue.length < amount) {
        // Get a pseudo random file index
        const rndIndex = rndMinMax(0, files.length - 1)
        // Get file's id
        const rndFile = files[rndIndex].id
        // If the queue does not contain it, insert it and continue
        if (!this.queue.includes(rndFile))
          this.queue.push(rndFile)
      }
    },
    // Adds a qyeye entry
    pushQueue(id: string) {
      this.queue.unshift(id)
    },
    removeQueryAtIndex(index: number) {
      this.queue.splice(0, index)
    },
    // Remove all tracks between the start and the index
    // And fill in the mount of missing queue items
    setQueryIndexAsStart(index: number) {
      this.queue = this.queue.splice(0, index)
      this.shuffleQueue()
    },
    getPrevInHistory() {
      const prevIndex = this.current + 1
      const prevItem = this.history.at(prevIndex)

      if (prevItem) {
        this.current = prevIndex
        return prevItem
      }
    },
  },
})
