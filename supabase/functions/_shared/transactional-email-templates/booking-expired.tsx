import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BookingExpiredProps {
  guestName?: string
  operatorName?: string
  operatorUrl?: string
  checkIn?: string
  checkOut?: string
}

// Sent when a pending_operator booking is swept because the operator did
// not confirm within the TTL window. Not a cancellation by us or the guest
// -- distinct status so it never pollutes cancellation-rate reporting.
const BookingExpiredEmail = ({
  guestName, operatorName, operatorUrl, checkIn, checkOut,
}: BookingExpiredProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your enquiry to {operatorName} expired without a reply</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your enquiry expired</Heading>
        <Text style={text}>Hi {guestName},</Text>
        <Text style={text}>
          Your enquiry to <strong>{operatorName}</strong> for{' '}
          <strong>{checkIn}</strong> to <strong>{checkOut}</strong> expired
          because we did not receive confirmation in time.
        </Text>
        <Text style={text}>
          The room is now free again. If you would still like to stay, you
          can try again below — we suggest also messaging on WhatsApp so the
          operator sees it faster.
        </Text>
        {operatorUrl && (
          <Section style={{ margin: '24px 0' }}>
            <Button href={operatorUrl} style={button}>Try again</Button>
          </Section>
        )}
        <Text style={footer}>
          If you already spoke to the operator on WhatsApp and agreed the
          stay, your booking with them still stands — this email only means
          our record of it lapsed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingExpiredEmail,
  subject: (d: Record<string, any>) =>
    `Your enquiry to ${d.operatorName ?? 'the operator'} expired`,
  displayName: 'Booking expired (unconfirmed after 7 days)',
  previewData: {
    guestName: 'Amina',
    operatorName: 'Kilima Ridge',
    operatorUrl: 'https://fichua.co/operators/kilima-ridge',
    checkIn: '2026-08-14',
    checkOut: '2026-08-17',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const button = { backgroundColor: '#b8922a', color: '#ffffff', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0', lineHeight: '1.6' }
