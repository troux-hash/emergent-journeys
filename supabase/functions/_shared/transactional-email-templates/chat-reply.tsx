import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Fichua"

interface ChatReplyProps {
  message?: string
}

// Plain, quote-free reply body -- this is a real back-and-forth conversation
// (the recipient's reply gets routed back through the inbound-email webhook
// into the same admin-visible thread), so it deliberately doesn't look like
// a marketing template.
const ChatReplyEmail = ({ message }: ChatReplyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reply from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{SITE_NAME}</Heading>
        <Text style={text}>{message}</Text>
        <Text style={footer}>Just reply to this email to continue the conversation.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ChatReplyEmail,
  subject: 'Reply from Fichua',
  displayName: 'Chat reply (email channel)',
  // Must match whatever address the Mailgun inbound route is configured
  // for -- see the migration that triggers this send for context. If this
  // ever changes, update it here AND in the Mailgun route configuration.
  fromOverride: 'Fichua Support <support@support.fichua.co>',
  previewData: { message: 'Thanks for reaching out! Here is the answer to your question...' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px', fontFamily: "'Georgia', 'Times New Roman', serif" }
const text = { fontSize: '14px', color: '#1a150a', lineHeight: '1.6', margin: '0 0 20px', whiteSpace: 'pre-wrap' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
