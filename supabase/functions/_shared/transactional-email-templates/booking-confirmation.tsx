import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Row, Column, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BookingConfirmationProps {
  // 'traveller' and 'operator' get the SAME record, different framing.
  role?: 'traveller' | 'operator'
  reference?: string
  guestName?: string
  guestWhatsapp?: string
  operatorName?: string
  roomName?: string
  checkIn?: string
  checkOut?: string
  nights?: number
  guests?: number
  currency?: string
  total?: string
  pricePerNight?: string
  cancellationPolicy?: string
}

const DEFAULT_POLICY =
  'Free cancellation up to 48 hours before check-in. Within 48 hours, the first ' +
  'night is payable. Payment is made directly to the property on arrival unless ' +
  'agreed otherwise in writing.'

const Line = ({ label, value }: { label: string; value?: string | number }) => (
  <Row style={{ marginBottom: '6px' }}>
    <Column style={cellLabel}>{label}</Column>
    <Column style={cellValue}>{value ?? '—'}</Column>
  </Row>
)

const BookingConfirmationEmail = ({
  role = 'traveller', reference, guestName, guestWhatsapp, operatorName, roomName,
  checkIn, checkOut, nights, guests, currency, total, pricePerNight,
  cancellationPolicy,
}: BookingConfirmationProps) => {
  const isOperator = role === 'operator'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {`Confirmed ${reference ?? ''} — ${operatorName ?? ''}, ${checkIn ?? ''} to ${checkOut ?? ''}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isOperator ? 'You have a confirmed booking' : 'Your stay is confirmed'}
          </Heading>

          <Text style={text}>
            {isOperator
              ? `${guestName ?? 'A traveller'} is confirmed at ${operatorName ?? 'your property'}. The traveller has received this identical record.`
              : `Hi ${guestName ?? 'there'}, ${operatorName ?? 'the property'} has confirmed your stay. They have received this identical record.`}
          </Text>

          <Section style={card}>
            <Line label="Reference" value={reference} />
            <Line label="Property" value={operatorName} />
            <Line label="Room" value={roomName} />
            <Line label="Check-in" value={checkIn} />
            <Line label="Check-out" value={checkOut} />
            <Line label="Nights" value={nights} />
            <Line label="Guests" value={guests} />
            <Line label="Rate per night" value={`${currency ?? ''} ${pricePerNight ?? ''}`.trim()} />
            <Line label="Total" value={`${currency ?? ''} ${total ?? ''}`.trim()} />
            {isOperator && <Line label="Guest WhatsApp" value={guestWhatsapp} />}
          </Section>

          <Hr style={{ borderColor: '#e8e0cc', margin: '24px 0' }} />

          <Text style={h2}>Cancellation policy</Text>
          <Text style={text}>{cancellationPolicy || DEFAULT_POLICY}</Text>

          <Text style={footer}>
            Both parties hold this same written record. Quote the reference{' '}
            <strong>{reference}</strong> in any message about this stay.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BookingConfirmationEmail,
  subject: (d: Record<string, any>) =>
    d.role === 'operator'
      ? `Confirmed booking ${d.reference ?? ''} — ${d.guestName ?? 'traveller'}, ${d.checkIn ?? ''}`
      : `Confirmed: ${d.operatorName ?? 'your stay'} — ${d.checkIn ?? ''} (${d.reference ?? ''})`,
  displayName: 'Booking confirmation (traveller / operator)',
  previewData: {
    role: 'traveller',
    reference: 'FCH-B-1A2B3C4D',
    guestName: 'Amina',
    guestWhatsapp: '+250 700 000 000',
    operatorName: 'Kilima Ridge',
    roomName: 'Garden Room',
    checkIn: '2026-08-14',
    checkOut: '2026-08-17',
    nights: 3,
    guests: 2,
    currency: 'USD',
    total: '360.00',
    pricePerNight: '120.00',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px' }
const h2 = { fontSize: '14px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#faf6ec', border: '1px solid #e8e0cc', borderRadius: '4px', padding: '18px 20px' }
const cellLabel = { fontSize: '13px', color: '#8a7a55', width: '45%' }
const cellValue = { fontSize: '13px', color: '#1a150a', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0', lineHeight: '1.6' }
