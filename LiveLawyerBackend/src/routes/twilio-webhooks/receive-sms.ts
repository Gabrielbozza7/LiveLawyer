import { Router } from 'express'
import { Request } from 'express'
import twilio from 'twilio'
import { getSupabaseClient } from '../../database/supabase'
const { MessagingResponse } = twilio.twiml

interface TwilioWebookReceiveSmsBody {
  ToCountry: string
  ToState: string
  SmsMessageSid: string
  NumMedia: string
  ToCity: string
  FromZip: string
  SmsSid: string
  FromState: string
  SmsStatus: string
  FromCity: string
  Body: string
  FromCountry: string
  To: string
  MessagingServiceSid: string
  ToZip: string
  NumSegments: string
  MessageSid: string
  AccountSid: string
  From: string
  ApiVersion: string
}

type RequestTwilioWebhooksReceiveSms = Request<never, never, TwilioWebookReceiveSmsBody, never>

export default function registerRoute(router: Router) {
  router.post(
    '/receive-sms', // <-- Necessary to avoid a type error for some reason?
    /**
     * Receive incoming SMS messages
     */
    async (req: RequestTwilioWebhooksReceiveSms, res) => {
      const response = new MessagingResponse()
      const message = req.body.Body
      const sender = req.body.From
      const supabase = await getSupabaseClient()

      const responseString = await (async (): Promise<string> => {
        const matches = message.match(/^\s*(ACCEPT|REJECT|STOP)\s*([1-9]\d{4})\s*$/i)
        if (!(matches && matches[1] && matches[2])) {
          return 'Live Lawyer App - Emergency Contacts System: Your reply was not in the expected format and has not been processed as a result. You can try again.'
        }

        const command = matches[1].toUpperCase() as 'ACCEPT' | 'REJECT' | 'STOP'
        const nonce = Number(matches[2])

        const { data: record, error } = await supabase
          .from('Contact')
          .select('userId, phoneNumber, nonce, consentStatus, client:User(firstName, lastName)')
          .eq('nonce', nonce)
          .maybeSingle()
        if (error) {
          console.log('An error occurred during processing of an SMS message (getting record):')
          console.error(error)
          return 'Live Lawyer App - Emergency Contacts System: An internal error occurred when trying to process your reply. You can try again.'
        }
        if (record === null || record.phoneNumber !== sender) {
          return 'Live Lawyer App - Emergency Contacts System: The number supplied in your reply does not match a consent request. You can try again.'
        }

        switch (command) {
          case 'ACCEPT':
            if (record.consentStatus === 'Pending' || record.consentStatus === 'Rejected') {
              const { error } = await supabase
                .from('Contact')
                .update({ consentStatus: 'Accepted' })
                .eq('userId', record.userId)
                .eq('phoneNumber', record.phoneNumber)
                .single()
              if (error) {
                console.log(
                  'An error occurred during processing of an SMS message (updating record):',
                )
                console.error(error)
                return 'Live Lawyer App - Emergency Contacts System: An internal error occurred when trying to process your reply. You can try again.'
              } else {
                return `Live Lawyer App - Emergency Contacts System: You have successfully opted into receiving notifications from Live Lawyer App on the behalf of ${record.client.firstName} ${record.client.lastName}. Reply "STOP ${record.nonce}" to unsubscribe.`
              }
            } else {
              return `Live Lawyer App - Emergency Contacts System: You have previously provided consent to receive messages from Live Lawyer App on the behalf of ${record.client.firstName} ${record.client.lastName}. Reply "STOP ${record.nonce}" to unsubscribe.`
            }
          case 'REJECT':
          case 'STOP':
            if (record.consentStatus === 'Pending' || record.consentStatus === 'Accepted') {
              const { error } = await supabase
                .from('Contact')
                .update({ consentStatus: 'Rejected' })
                .eq('userId', record.userId)
                .eq('phoneNumber', record.phoneNumber)
                .single()
              if (error) {
                console.log(
                  'An error occurred during processing of an SMS message (updating record):',
                )
                console.error(error)
                return 'Live Lawyer App - Emergency Contacts System: An internal error occurred when trying to process your reply. You can try again.'
              } else {
                return `Live Lawyer App - Emergency Contacts System: You have successfully opted out of receiving notifications from Live Lawyer App on the behalf of ${record.client.firstName} ${record.client.lastName}.`
              }
            } else {
              return `Live Lawyer App - Emergency Contacts System: You have previously rejected consent to receive messages from Live Lawyer App on the behalf of ${record.client.firstName} ${record.client.lastName}. Reply "ACCEPT ${record.nonce}" to provide consent and subscribe.`
            }
        }
      })()

      response.message(responseString)
      res.type('text/xml').send(response.toString())
    },
  )
}
