import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Section, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  reference?: string
  operatorName?: string
  channel?: string
  waitedMinutes?: string
  message?: string
}

// Sent to the Fichua team: an enquiry has gone unanswered past the point
// where a nudge was enough. A lead going cold should be visible, not lost.
const EnquiryEscalationEmail = ({ reference, operatorName, channel, waitedMinutes, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Unanswered enquiry: {operatorName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Enquiry still unanswered</Heading>
        <Text style={text}>
          <strong>{operatorName}</strong> has not responded to a traveller who made contact on {channel}{' '}
          <strong>{waitedMinutes} minutes ago</strong>. They were already nudged. Reference {reference}.
        </Text>
        <Section style={box}>
          <Text style={label}>What the traveller said</Text>
          <Text style={value}>{message}</Text>
        </Section>
        <Text style={text}>
          Worth a direct call. A traveller waiting this long has usually moved on — and if this operator does
          it repeatedly, it's a verification concern, not just a service one.
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href="https://fichua.co/intranet/enquiries">Open enquiry queue</Button>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EnquiryEscalationEmail,
  subject: (d: Record<string, any>) => `Unanswered enquiry: ${d.operatorName || 'operator'} (${d.reference || ''})`,
  displayName: 'Enquiry escalation (to Fichua team)',
  previewData: {
    reference: 'FCH-K7M2QP', operatorName: 'Kilima Ridge', channel: 'whatsapp',
    waitedMinutes: '75', message: 'Do you have space for 3 nights in August?',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const box = { backgroundColor: '#f6f3ec', padding: '16px 18px', margin: '0 0 20px' }
const label = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#999999', margin: '0 0 2px' }
const value = { fontSize: '14px', color: '#1a150a', margin: '0', lineHeight: '1.5' }
const button = { backgroundColor: '#b08d3f', color: '#1a150a', fontSize: '13px', fontWeight: 'bold' as const, textTransform: 'uppercase' as const, letterSpacing: '0.1em', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }
