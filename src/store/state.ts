// Global state of the application
import { defineStore } from 'pinia'
import { isEmpty } from 'lodash'

export interface AuthObject {
  access_token: string
  token_type: string
  expires_in: string
  scope: string
  uid: string
  account_id: string
}

interface State {
  token: string
  auth: AuthObject
}

// const debug = { access_token: 'sl.BRqSpFElRAMsT8TQsc4oCsQ2sSRZJ0OrFclsRET7HF5SSwGB98PKdHw167DUICtWoU63LhElo9qQD-5SGKlZthXaZFPwrmkvfVvkRSRBQ-rWFfDL1YCnLwQBGykuyB93EIs1RgM', token_type: 'bearer', expires_in: '14400', scope: 'account_info.read+files.content.read+files.metadata.read+sharing.read', uid: '261403375', account_id: 'dbid%3AAAA5JVFz0nLdJ2SBgYmjLAr5Wh3N0mFjrjU' }

export const useState = defineStore('state', {
  state: () => ({
    token: '',
    auth: {},
  } as State),
  actions: {
    setAuth(data: AuthObject) {
      if (!isEmpty(data)) {
        this.token = data.access_token
        this.auth = data
        localStorage.setItem('dbx-context', JSON.stringify(data))
      }
    },
    init() {
      const saved = localStorage.getItem('dbx-context')

      if (saved) {
        const parsed: AuthObject = JSON.parse(saved)
        this.setAuth(parsed)
      }
    },
  },
})
