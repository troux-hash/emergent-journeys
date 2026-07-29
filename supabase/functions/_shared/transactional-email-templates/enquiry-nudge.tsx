import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Section, Button } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  reference?: string
  operatorName?: string
  channel?: string
  waitedMinutes?: string
  message?: string
  draft?: string
  ackUrl?: string
}

// Sent to the OPERATOR, not the traveller. Fichua does not answer on their
// behalf -- it hands them a draft and gets out of the way.
const EnquiryNudgeEmail = ({ reference, channel, waitedMinutes, message, draft, ackUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>A traveller is waiting — {waitedMinutes} minutes</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>A traveller is waiting</Heading>
        <Text style={text}>
          Someone contacted you via Fichua on {channel} about <strong>{waitedMinutes} minutes ago</strong> and
          hasn't heard back yet. Reference {reference}.
        </Text>
        <Section style={box}>
          <Text style={label}>What they said</Text>
          <Text style={value}>{message}</Text>
        </Section>
        {draft ? (
          <>
            <Text style={text}><strong>A reply you can send as-is:</strong></Text>
            <Section style={draftBox}><Text style={draftText}>{draft}</Text></Section>
            <Text style={small}>
              Written from your own listed rooms and rates. Edit it however you like — it's your guest.
            </Text>
          </>
        ) : null}
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href={ackUrl}>I've replied</Button>
        </Section>
        <Text style={footer}>
          Replying quickly is the single biggest thing that turns an enquiry into a booking.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EnquiryNudgeEmail,
  subject: (d: Record<string, any>) => `A traveller is waiting (${d.reference || 'enquiry'})`,
  displayName: 'Enquiry nudge (to operator)',
  previewData: {
    reference: 'FCH-K7M2QP', operatorName: 'Kilima Ridge', channel: 'whatsapp',
    waitedMinutes: '18', message: 'Do you have space for 3 nights in August?',
    draft: 'Hello! Yes, I would be glad to host you.', ackUrl: 'https://fichua.co/enquiry/FCH-K7M2QP',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const small = { fontSize: '12px', color: '#999999', margin: '0 0 16px' }
const box = { backgroundColor: '#f6f3ec', padding: '16px 18px', margin: '0 0 20px' }
const draftBox = { backgroundColor: '#fbf6e8', borderLeft: '3px solid #b08d3f', padding: '16px 18px', margin: '0 0 12px' }
const draftText = { fontSize: '14px', color: '#1a150a', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' as const }
const label = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#999999', margin: '0 0 2px' }
const value = { fontSize: '14px', color: '#1a150a', margin: '0', lineHeight: '1.5' }
const button = { backgroundColor: '#b08d3f', color: '#1a150a', fontSize: '13px', fontWeight: 'bold' as const, textTransform: 'uppercase' as const, letterSpacing: '0.1em', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
