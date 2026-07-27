import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface LeadAckProps {
  propertyName?: string
}

// Sent to the operator immediately on sign-up. Deliberately sets a
// concrete expectation (what happens next, and roughly when) rather than
// a vague "we'll be in touch" -- the first message they get from us is
// also the first test of whether we do what we say.
const LeadAckEmail = ({ propertyName }: LeadAckProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've got your details — here's what happens next</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thanks — we've got your details.</Heading>
        <Text style={text}>
          We've received the sign-up for <strong>{propertyName}</strong>.
        </Text>
        <Text style={text}><strong>What happens next:</strong></Text>
        <Text style={step}>1. A member of our team will message you on WhatsApp within one working day.</Text>
        <Text style={step}>2. We verify four things — that you are who you say, that your photos match your location, that your WhatsApp reaches a real person, and that we can pay you.</Text>
        <Text style={step}>3. Once all four check out, your page goes live and travellers can find and book you.</Text>
        <Text style={text}>
          You pay nothing until we've brought you ten bookings. There's no setup fee and no card needed to be listed.
        </Text>
        <Text style={footer}>
          Questions in the meantime? Just reply to this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: LeadAckEmail,
  subject: "We've got your details — here's what happens next",
  displayName: 'Operator sign-up acknowledgement',
  previewData: { propertyName: 'Kilima Ridge' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px', fontFamily: "'Georgia', 'Times New Roman', serif" }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const step = { fontSize: '14px', color: '#1a150a', lineHeight: '1.6', margin: '0 0 12px', paddingLeft: '4px' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
