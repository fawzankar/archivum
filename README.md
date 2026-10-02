# ARCHIVUM

Academic archive web app for SJS students.

## Stack

Next.js, React, TypeScript, Tailwind CSS, Turso and Cloudflare R2.

## Development

```bash
npm install
npm run dev
```

Required environment variables are listed in `.env.example`.

## Push Notifications

Study reminders and admin announcements use Web Push. Generate a VAPID key pair with `npx web-push generate-vapid-keys`, then set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` in the deployment environment. Set a private `CRON_SECRET` as well; the included Vercel cron checks each subscriber's chosen local reminder hour once per hour. Students opt in from the hamburger menu and can choose their daily reminder time. Admins can send a custom title and message from the Notifications tab.
