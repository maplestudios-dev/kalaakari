# 13 · Lead Notifications

A new contact submission fires two parallel notifications, both fire-and-forget so a failed channel never blocks the submission from being saved.

## Slack
Set `SLACK_WEBHOOK_URL` to an Incoming Webhook URL. Each lead arrives as a rich block message — header, fields (name, brand, service, budget, timeline, email), and the full message body as a quoted block.

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T0000/B0000/xxxxxxxx
```

## Email
Set the SMTP block:

```
SMTP_HOST=smtp.resend.com         # or any provider
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxx
MAIL_FROM=KALAAKAARI <hello@kalaakaari.in>
NOTIFY_EMAIL_TO=hello@kalaakaari.in
```

Email format mirrors the Slack message — plain-text and HTML, both included.

## Behavior matrix
| `SLACK_WEBHOOK_URL` | `SMTP_*` | Behavior |
|---|---|---|
| set | set | Both channels fire in parallel |
| set | unset | Slack only |
| unset | set | Email only |
| unset | unset | Silent — submission still persists; visible in admin inbox |

## Where it lives
- Utility: `apps/api/src/lib/notifications.js`
- Hook point: `apps/api/src/routes/contact.js` (after `ContactSubmission.create`)

## Failure modes
The handler uses `Promise.allSettled` and logs any failures via `console.warn` without propagating. The contact-form POST always returns `201` to the public site as long as the database write succeeds.
