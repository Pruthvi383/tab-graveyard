# Tab Graveyard

Tab Graveyard is an AI-powered browser tab manager made of two parts:

- A Manifest V3 Chrome extension that groups, archives, suspends, and restores tabs.
- A Next.js 16 dashboard backed by Supabase, Upstash Redis, and Google Gemini.

## What Is Included

- `dashboard/`: Next.js 16 App Router app with TypeScript, Tailwind CSS v4, and shadcn-style components.
- `extension/`: Chrome extension using vanilla JavaScript and a Manifest V3 service worker.
- `db-setup.sql`: Supabase schema for sessions and tab events.

## 1. Create Supabase Tables

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run the contents of [`db-setup.sql`](/Users/pruthvipatil/Tab%20Graveyard/db-setup.sql).
4. Run the contents of [`db-production-upgrade.sql`](/Users/pruthvipatil/Tab%20Graveyard/db-production-upgrade.sql) to add extension tokens and row-level security policies.

## 2. Enable Supabase Auth

1. In Supabase, open Authentication.
2. Enable Email auth.
3. Add your local and production URLs to the redirect allow list:
   - `http://localhost:3001/auth/confirm`
   - `https://your-vercel-domain/auth/confirm`

## 3. Create Upstash Redis

1. Create a Redis database in Upstash.
2. Copy the REST URL and REST token.

## 4. Create Gemini API Credentials

1. Create a Google AI Studio API key.
2. Make sure Gemini access is enabled for `gemini-2.5-flash`.

## 5. Configure the Dashboard

1. Copy [`dashboard/.env.example`](/Users/pruthvipatil/Tab%20Graveyard/dashboard/.env.example) to `dashboard/.env.local`.
2. Fill in all values.
3. No shared extension secret is needed anymore. Users generate personal extension tokens from inside the dashboard after signing in.

## 6. Install Dashboard Dependencies

Run the commands listed at the end of this README, in order.

## 7. Optional Demo Seed

After the environment variables are configured:

```bash
cd dashboard
npm run seed
```

This inserts 20 realistic demo sessions for the `demo-user` account. It is only useful for local demos and is not needed for real users.

## 8. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions`.
2. Turn on Developer Mode.
3. Click Load unpacked.
4. Select the [`extension`](/Users/pruthvipatil/Tab%20Graveyard/extension) folder.
5. Add real icon files at:
   - [`extension/icons/16.png`](/Users/pruthvipatil/Tab%20Graveyard/extension/icons/16.png)
   - [`extension/icons/48.png`](/Users/pruthvipatil/Tab%20Graveyard/extension/icons/48.png)
   - [`extension/icons/128.png`](/Users/pruthvipatil/Tab%20Graveyard/extension/icons/128.png)

The scaffold includes placeholder icons, but you should replace those files with your own branded assets before shipping.

## 9. Extension Notes

- Users sign in on the dashboard with Supabase Auth.
- The dashboard lets each user generate personal extension tokens.
- The extension stores its dashboard URL and personal token in `chrome.storage.local`.
- The extension defaults to `http://localhost:3000` as the dashboard API base.
- For production, update the Vercel URL in [`extension/background.js`](/Users/pruthvipatil/Tab%20Graveyard/extension/background.js) and [`extension/manifest.json`](/Users/pruthvipatil/Tab%20Graveyard/extension/manifest.json).

## 10. Deploy To Vercel

1. Import the `dashboard` folder as a Vercel project.
2. Add the environment variables from [`dashboard/.env.example`](/Users/pruthvipatil/Tab%20Graveyard/dashboard/.env.example).
3. Redeploy after any environment change.
4. Update the extension host permissions and dashboard URL defaults to match the deployed domain.
5. Add the production auth callback URL in Supabase Auth redirect settings.

## Commands To Run

From the repo root:

```bash
cd dashboard
npm install
npm run dev
```

In a second terminal, after your database is ready:

```bash
cd dashboard
npm run seed
```

If you want the exact one-time initialization sequence the scaffold corresponds to, use:

```bash
npx create-next-app@latest dashboard --typescript --tailwind --app --no-src-dir --no-import-alias
cd dashboard
npx shadcn@latest init
npx shadcn@latest add button card badge input scroll-area separator skeleton tooltip
npm install @google/generative-ai @supabase/supabase-js @upstash/redis
```
