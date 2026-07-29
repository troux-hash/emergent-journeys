/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  fromOverride?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as chatNotification } from './chat-notification.tsx'
import { template as reviewRequest } from './review-request.tsx'
import { template as supportRequest } from './support-request.tsx'
import { template as chatReply } from './chat-reply.tsx'
import { template as newLeadAdmin } from './new-lead-admin.tsx'
import { template as leadAcknowledgement } from './lead-acknowledgement.tsx'
import { template as bookingExpired } from './booking-expired.tsx'

const CHAT_NOTIFICATION_EMAIL = Deno.env.get('CHAT_NOTIFICATION_EMAIL') || ''

export const TEMPLATES: Record<string, TemplateEntry> = {
  'chat-notification': {
    ...chatNotification,
    to: CHAT_NOTIFICATION_EMAIL,
  },
  'review-request': reviewRequest,
  'support-request': {
    ...supportRequest,
    // Reuses the same admin inbox already configured for chat pings, so
    // this needs zero new Supabase secrets to work.
    to: CHAT_NOTIFICATION_EMAIL,
  },
  'chat-reply': chatReply,
  'new-lead-admin': {
    ...newLeadAdmin,
    // Reuses the admin inbox already configured for chat pings.
    to: CHAT_NOTIFICATION_EMAIL,
  },
  'lead-acknowledgement': leadAcknowledgement,
  'booking-expired': bookingExpired,
}
