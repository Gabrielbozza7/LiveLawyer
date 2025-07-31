import { Router } from 'express'
import { Request } from 'express'
import { ApiResponse, WithAccessToken } from 'livelawyerlibrary/api/types/general'
import {
  RequestBodyContactsModify,
  RequestResponseContactsModify,
  ROUTE_CONTACTS_MODIFY,
} from 'livelawyerlibrary/api/types/contacts'
import { authenticate, getSupabaseClient } from '../../database/supabase'
import TwilioManager from '../../TwilioManager'

type RequestContactsModify = Request<
  never,
  ApiResponse<RequestResponseContactsModify>,
  WithAccessToken<RequestBodyContactsModify>,
  never
>

export default function registerRoute(router: Router) {
  router.post(
    ROUTE_CONTACTS_MODIFY,
    /**
     * Enable a client to create an emergency contact
     */
    async (req: RequestContactsModify, res) => {
      const supabase = await getSupabaseClient()
      let userId: string
      try {
        userId = await authenticate(req.body.accessToken)
      } catch (authError) {
        res.status(400).json({ success: false, error: (authError as Error).message })
        return
      }

      // If a name and a new phone number are provided, the contact should be created.
      // If a name and an existing phone number are provided, the contact should be updated.
      // If no name is provided but an existing phone number is, the associated contact should be deleted (name getting set to null).

      const { name, phoneNumber } = req.body

      // Checking if the contact already exists:
      const { data: existingContact, error: existingContactError } = await supabase
        .from('Contact')
        .select('userId, name, phoneNumber')
        .eq('userId', userId)
        .eq('phoneNumber', phoneNumber)
        .maybeSingle()
      if (existingContactError) {
        res.status(400).json({ success: false, error: (existingContactError as Error).message })
        return
      }

      if (existingContact !== null) {
        // Update/"delete" the contact:
        const { error } = await supabase
          .from('Contact')
          .update({ name })
          .eq('userId', userId)
          .eq('phoneNumber', phoneNumber)
          .single()
        if (error) {
          console.log('Error when updating contact:')
          console.error(error)
          res.status(500).json({ success: false, error: 'Database error' })
          return
        }
        res.status(200).json({
          success: true,
          result: {
            action:
              name !== null
                ? existingContact.name === null
                  ? 'RECREATED'
                  : 'NAME_UPDATED'
                : 'DELETED',
          },
        })
        return
      } else {
        // Create the contact:
        const { data: noncesRaw, error: noncesError } = await supabase
          .from('Contact')
          .select('nonce')
          .eq('phoneNumber', phoneNumber)
        if (noncesError) {
          console.log("Error when fetching a phone number's nonces:")
          console.error(noncesError)
          res.status(500).json({ success: false, error: 'Database error' })
          return
        }
        const nonces = new Set(noncesRaw.map(nonce => nonce.nonce))
        let newNonce: number
        do {
          newNonce = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
        } while (nonces.has(newNonce))
        const { error } = await supabase.from('Contact').insert({
          userId,
          phoneNumber,
          name,
          nonce: newNonce,
        })
        if (error) {
          console.log('Error when creating new contact:')
          console.error(noncesError)
          res.status(500).json({ success: false, error: 'Database error' })
          return
        }
        // TODO: Avoid creating a new TwilioManager and doing a client name fetch.
        const { data: clientNameData, error: clientNameError } = await supabase
          .from('User')
          .select('firstName, lastName')
          .eq('id', userId)
          .single()
        if (clientNameError) {
          console.log('Error when fetching client name for consent request:')
          console.error(clientNameError)
          res.status(500).json({ success: false, error: 'Database error' })
          return
        }
        try {
          await new TwilioManager().promptContactForConsent(
            `${clientNameData.firstName} ${clientNameData.lastName}`,
            newNonce,
            phoneNumber,
          )
        } catch {
          res.status(500).json({ success: false, error: 'Database error' })
          return
        }
        res.status(200).json({ success: true, result: { action: 'CREATED' } })
        return
      }
    },
  )
}
