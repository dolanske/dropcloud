import { defineStore } from 'pinia'

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
  queue: string []

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
    pushHistory(id: string) {
      // If id is in history -> remove it so that it gets appended again
      if (this.history.includes(id))
        this.history = this.history.filter(track => track !== id)

      this.history.unshift(id)

      if (this.history.length >= this.limit)
        this.history.pop()
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
  // getters: {
  //   getCurrentHistory: store => store.history.at(store.current),
  // },
})
