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
  // 'unconfirmed' = swept after 7d without operator confirmation (try again is valid)
  // 'dates_passed' = check_in has already passed while still pending (try again is wrong)
  reason?: 'unconfirmed' | 'dates_passed'
}

// Sent when a pending_operator booking is swept, either because the
// operator did not confirm within the TTL window OR the travel dates
// passed while still unconfirmed. Distinct status so it never pollutes
// cancellation-rate reporting.
const BookingExpiredEmail = ({
  guestName, operatorName, operatorUrl, checkIn, checkOut, reason = 'unconfirmed',
}: BookingExpiredProps) => {
  const datesPassed = reason === 'dates_passed'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {datesPassed
          ? `Your enquiry to ${operatorName} was never confirmed`
          : `Your enquiry to ${operatorName} expired without a reply`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {datesPassed ? 'Your enquiry was never confirmed' : 'Your enquiry expired'}
          </Heading>
          <Text style={text}>Hi {guestName},</Text>
          {datesPassed ? (
            <>
              <Text style={text}>
                Your enquiry to <strong>{operatorName}</strong> for{' '}
                <strong>{checkIn}</strong> to <strong>{checkOut}</strong> was
                never confirmed, and those dates have now passed. We're closing
                the enquiry on our side so it isn't sitting open.
              </Text>
              <Text style={text}>
                If you did stay with them and just never heard back through us,
                no action needed. If you'd like to plan a future stay, you can
                view the property below.
              </Text>
              {operatorUrl && (
                <Section style={{ margin: '24px 0' }}>
                  <Button href={operatorUrl} style={button}>View property</Button>
                </Section>
              )}
            </>
          ) : (
            <>
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
            </>
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
}

export const template = {
  component: BookingExpiredEmail,
  subject: (d: Record<string, any>) =>
    d.reason === 'dates_passed'
      ? `Your enquiry to ${d.operatorName ?? 'the operator'} was never confirmed`
      : `Your enquiry to ${d.operatorName ?? 'the operator'} expired`,
  displayName: 'Booking expired (unconfirmed or dates passed)',
  previewData: {
    guestName: 'Amina',
    operatorName: 'Kilima Ridge',
    operatorUrl: 'https://fichua.co/operators/kilima-ridge',
    checkIn: '2026-08-14',
    checkOut: '2026-08-17',
    reason: 'unconfirmed',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const button = { backgroundColor: '#b8922a', color: '#ffffff', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0', lineHeight: '1.6' }
