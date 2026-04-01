import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Fichua"

interface ChatNotificationProps {
  visitorName?: string
  visitorEmail?: string
  message?: string
  language?: string
}

const ChatNotificationEmail = ({ visitorName, visitorEmail, message, language }: ChatNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New chat message from {visitorName || 'a visitor'} on {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Chat Message</Heading>
        <Text style={text}>
          You have a new message on <strong>{SITE_NAME}</strong>.
        </Text>
        <Section style={messageBox}>
          <Text style={label}>From</Text>
          <Text style={value}>{visitorName || 'Unknown visitor'}</Text>
          {visitorEmail && (
            <>
              <Text style={label}>Email</Text>
              <Text style={value}>{visitorEmail}</Text>
            </>
          )}
          {language && (
            <>
              <Text style={label}>Language</Text>
              <Text style={value}>{language === 'en' ? 'English' : language === 'fr' ? 'Français' : language === 'zh' ? '中文' : language}</Text>
            </>
          )}
          <Hr style={hr} />
          <Text style={label}>Message</Text>
          <Text style={messageText}>{message || '(no message)'}</Text>
        </Section>
        <Text style={footer}>This notification was sent by {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ChatNotificationEmail,
  subject: (data: Record<string, any>) => `New chat from ${data.visitorName || 'a visitor'} — ${SITE_NAME}`,
  displayName: 'Chat notification',
  previewData: { visitorName: 'Jane Doe', visitorEmail: 'jane@example.com', message: 'Hi, I would like to know more about your services.', language: 'en' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px', fontFamily: "'Georgia', 'Times New Roman', serif" }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const messageBox = { backgroundColor: '#faf7f2', border: '1px solid #e8e0d4', borderRadius: '4px', padding: '20px', margin: '0 0 24px' }
const label = { fontSize: '11px', color: '#8a7d6b', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 2px', fontWeight: 'bold' as const }
const value = { fontSize: '14px', color: '#1a150a', margin: '0 0 14px' }
const messageText = { fontSize: '14px', color: '#1a150a', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' as const }
const hr = { borderColor: '#e8e0d4', margin: '16px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
