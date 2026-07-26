import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Fichua"

interface SupportRequestProps {
  reporterName?: string
  reporterContact?: string
  operatorName?: string
  message?: string
}

const SupportRequestEmail = ({ reporterName, reporterContact, operatorName, message }: SupportRequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New support request on {SITE_NAME}{operatorName ? ` — ${operatorName}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New support request</Heading>
        <Text style={text}>
          Someone reported a problem directly to Fichua{operatorName ? <> regarding <strong>{operatorName}</strong></> : ''}.
        </Text>
        <Section style={messageBox}>
          <Text style={label}>From</Text>
          <Text style={value}>{reporterName || 'Not given'}</Text>
          <Text style={label}>Contact</Text>
          <Text style={value}>{reporterContact}</Text>
          <Hr />
          <Text style={label}>Message</Text>
          <Text style={value}>{message}</Text>
        </Section>
        <Text style={footer}>Reply directly to {reporterContact} or follow up via /intranet/support.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SupportRequestEmail,
  subject: (data: Record<string, any>) => `Support request${data.operatorName ? `: ${data.operatorName}` : ''} — Fichua`,
  displayName: 'Support request notification',
  previewData: {
    reporterName: 'Jane Doe',
    reporterContact: 'jane@example.com',
    operatorName: 'Example Property',
    message: 'My payment went through but I never got a confirmation.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px', fontFamily: "'Georgia', 'Times New Roman', serif" }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const messageBox = { backgroundColor: '#f6f3ec', padding: '18px 20px', margin: '0 0 20px' }
const label = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#999999', margin: '0 0 2px' }
const value = { fontSize: '14px', color: '#1a150a', margin: '0 0 14px', lineHeight: '1.5' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
