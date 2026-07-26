/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as chatNotification } from './chat-notification.tsx'
import { template as reviewRequest } from './review-request.tsx'

const CHAT_NOTIFICATION_EMAIL = Deno.env.get('CHAT_NOTIFICATION_EMAIL') || ''

export const TEMPLATES: Record<string, TemplateEntry> = {
  'chat-notification': {
    ...chatNotification,
    to: CHAT_NOTIFICATION_EMAIL,
  },
  'review-request': reviewRequest,
}
