import { Router } from 'express'
import { Request } from 'express'
import { ApiResponse, WithAccessToken } from 'livelawyerlibrary/api/types/general'
import {
  ContactSingle,
  RequestParamsContactsList,
  RequestResponseContactsList,
  ROUTE_CONTACTS_LIST,
} from 'livelawyerlibrary/api/types/contacts'
import { authenticate, getSupabaseClient } from '../../database/supabase'

type RequestContactsList = Request<
  never,
  ApiResponse<RequestResponseContactsList>,
  never,
  WithAccessToken<RequestParamsContactsList>
>

export default function registerRoute(router: Router) {
  router.get(
    ROUTE_CONTACTS_LIST,
    /**
     * Fetch a client's contacts
     */
    async (req: RequestContactsList, res) => {
      const supabase = await getSupabaseClient()
      let userId: string
      try {
        userId = await authenticate(req.query.accessToken)
      } catch (authError) {
        res.status(400).json({ success: false, error: (authError as Error).message })
        return
      }

      const { data, error } = await supabase
        .from('Contact')
        .select('phoneNumber, name, nonce, consentStatus')
        .eq('userId', userId)
        .neq('name', null)
      if (error) {
        res.status(500).json({ success: false, error: 'Database error' })
        return
      }

      const contacts: ContactSingle[] = data.map(contact => {
        return {
          phoneNumber: contact.phoneNumber,
          name: contact.name ?? '',
          nonce: contact.nonce,
          consentStatus: contact.consentStatus,
        }
      })

      res.status(200).json({ success: true, result: { contacts } })
      return
    },
  )
}
