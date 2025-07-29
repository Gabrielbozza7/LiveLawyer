import { Database } from '../../database-types'

// Router for: /contacts
export const ROUTER_CONTACTS = '/contacts'

// Route: /list
export const ROUTE_CONTACTS_LIST = '/list'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RequestParamsContactsList {}

export interface RequestResponseContactsList {
  contacts: ContactSingle[]
}

// Route: /modify
export const ROUTE_CONTACTS_MODIFY = '/modify'

export interface RequestBodyContactsModify {
  name: string | null
  phoneNumber: string
}

export interface RequestResponseContactsModify {
  action: 'CREATED' | 'NAME_UPDATED' | 'DELETED'
}

// Data:

export interface ContactSingle {
  phoneNumber: string
  name: string
  nonce: number
  consentStatus: Database['public']['Enums']['ConsentStatus']
}
