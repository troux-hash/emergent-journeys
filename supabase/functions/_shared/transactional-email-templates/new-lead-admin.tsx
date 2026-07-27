import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface NewLeadAdminProps {
  propertyName?: string
  phone?: string
  email?: string
  socials?: string
  numRooms?: string
  priceRange?: string
}

const NewLeadAdminEmail = ({ propertyName, phone, email, socials, numRooms, priceRange }: NewLeadAdminProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New operator sign-up: {propertyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New operator sign-up</Heading>
        <Text style={text}><strong>{propertyName}</strong> just signed up on fichua.co.</Text>
        <Section style={box}>
          <Text style={label}>WhatsApp</Text><Text style={value}>{phone}</Text>
          <Text style={label}>Email</Text><Text style={value}>{email}</Text>
          <Text style={label}>Rooms</Text><Text style={value}>{numRooms}</Text>
          <Text style={label}>Price range</Text><Text style={value}>{priceRange}</Text>
          <Hr />
          <Text style={label}>Socials</Text><Text style={value}>{socials}</Text>
        </Section>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href="https://fichua.co/intranet/operators">Review this lead</Button>
        </Section>
        <Text style={footer}>
          Message them on WhatsApp promptly — responsiveness is the first thing an operator judges us on.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewLeadAdminEmail,
  subject: (data: Record<string, any>) => `New sign-up: ${data.propertyName || 'an operator'}`,
  displayName: 'New operator lead (admin alert)',
  previewData: {
    propertyName: 'Kilima Ridge', phone: '+250 788 000 000', email: 'not given',
    socials: 'Instagram: @kilimaridge', numRooms: '8', priceRange: '80–150',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Georgia', 'Times New Roman', serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a150a', margin: '0 0 16px', fontFamily: "'Georgia', 'Times New Roman', serif" }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const box = { backgroundColor: '#f6f3ec', padding: '18px 20px', margin: '0 0 20px' }
const label = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#999999', margin: '0 0 2px' }
const value = { fontSize: '14px', color: '#1a150a', margin: '0 0 14px', lineHeight: '1.5' }
const button = { backgroundColor: '#b08d3f', color: '#1a150a', fontSize: '13px', fontWeight: 'bold' as const, textTransform: 'uppercase' as const, letterSpacing: '0.1em', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
