import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Fichua"

interface ReviewRequestProps {
  guestName?: string
  operatorName?: string
  reviewUrl?: string
}

const ReviewRequestEmail = ({ guestName, operatorName, reviewUrl }: ReviewRequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>How was your stay at {operatorName}?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>How was your stay?</Heading>
        <Text style={text}>
          Hi {guestName || 'there'}, we hope you enjoyed your time at <strong>{operatorName}</strong>.
        </Text>
        <Text style={text}>
          Your review helps other travelers find great, independent places to stay — and it's
          tagged as a <strong>Verified Stay</strong> since it's tied to your actual booking through Fichua.
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href={reviewUrl}>Leave a review</Button>
        </Section>
        <Text style={footer}>Takes less than a minute. Thanks for booking direct with {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReviewRequestEmail,
  subject: (data: Record<string, any>) => `How was your stay at ${data.operatorName || 'your lodge'}?`,
  displayName: 'Review request',
  previewData: { guestName: 'Jane Doe', operatorName: 'Kilima Lodge', reviewUrl: 'https://fichua.co/review/example' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px', fontFamily: "'Georgia', 'Times New Roman', serif" }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const button = {
  backgroundColor: '#b08d3f',
  color: '#1a150a',
  fontSize: '13px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
