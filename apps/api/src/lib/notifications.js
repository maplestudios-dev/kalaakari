/**
 * KALAAKAARI · Outbound notifications
 *
 * Slack: set SLACK_WEBHOOK_URL — POST is fire-and-forget JSON.
 * Email: set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS + MAIL_FROM + NOTIFY_EMAIL_TO.
 *
 * Both channels degrade silently if not configured. Submission persistence
 * must never depend on either succeeding.
 */
import nodemailer from 'nodemailer'

let _transporter = null
function transporter() {
  if (_transporter) return _transporter
  if (!process.env.SMTP_HOST) return null
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +(process.env.SMTP_PORT || 587),
    secure: +(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  })
  return _transporter
}

async function postToSlack(payload) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!resp.ok) throw new Error(`Slack ${resp.status}`)
}

async function sendEmail({ to, subject, text, html }) {
  const t = transporter()
  if (!t || !to) return
  await t.sendMail({
    from: process.env.MAIL_FROM || 'KALAAKAARI <hello@kalaakaari.in>',
    to, subject, text, html
  })
}

export async function notifyOnLead(sub) {
  const summary = `📥 New brief from *${sub.name}* (${sub.brand})\n` +
    `→ Service: ${sub.service}\n→ Budget: ${sub.budget} · Timeline: ${sub.timeline}\n` +
    `→ Email: ${sub.email}${sub.phone ? `\n→ Phone: ${sub.phone}` : ''}\n\n${sub.message}`

  await Promise.allSettled([
    postToSlack({
      text: `New KALAAKAARI brief from ${sub.name} (${sub.brand})`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: '📥 New brief — KALAAKAARI' } },
        { type: 'section', fields: [
          { type: 'mrkdwn', text: `*Name:*\n${sub.name}` },
          { type: 'mrkdwn', text: `*Brand:*\n${sub.brand}` },
          { type: 'mrkdwn', text: `*Service:*\n${sub.service}` },
          { type: 'mrkdwn', text: `*Budget:*\n${sub.budget}` },
          { type: 'mrkdwn', text: `*Timeline:*\n${sub.timeline}` },
          { type: 'mrkdwn', text: `*Email:*\n${sub.email}` }
        ] },
        { type: 'section', text: { type: 'mrkdwn', text: `*Message:*\n>${sub.message.split('\n').join('\n>')}` } }
      ]
    }),
    sendEmail({
      to: process.env.NOTIFY_EMAIL_TO || process.env.MAIL_TO,
      subject: `New brief — ${sub.name} · ${sub.brand}`,
      text: summary,
      html: `<p>${summary.replace(/\n/g, '<br/>')}</p>`
    })
  ])
}
