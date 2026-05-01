# 🚀 360tv Deployment Runbook

Follow these exact steps to transition 360tv from your local development environment to a live, production-ready environment on Vercel using Neon Postgres.

---

## Phase 1: Database Provisioning (Neon.tech)

1. **Create an Account/Project**: Go to [Neon.tech](https://neon.tech/) and create a free account.
2. **Create Database**: Set up a new project (e.g., `360tv-prod`).
3. **Get Connection String**: Once created, go to the project dashboard and copy the PostgreSQL connection string. 
   - It will look like: `postgresql://neondb_owner:password@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Update Local Environment**: 
   - Open your `.env` file.
   - Replace the local SQLite string (`DATABASE_URL="file:./dev.db"`) with your new Neon PostgreSQL connection string.

---

## Phase 2: Update Prisma Schema

Because Vercel is a "serverless" environment, it cannot write to local files (like our `dev.db` SQLite file). We must change Prisma to communicate with Postgres.

1. Open `prisma/schema.prisma`
2. Update the `datasource` block to use `postgresql`:

```prisma
// BEFORE:
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// AFTER:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **In your terminal**, sync your new Postgres DB with the schema by running:
   ```bash
   npx prisma db push
   ```
   *(This will connect to Neon and create your `Stream` and `SyncLog` tables)*

4. **Commit the changes to GitHub**:
   ```bash
   git add prisma/schema.prisma
   git commit -m "chore: migrate from sqlite to postgres"
   git push origin main
   ```

---

## Phase 3: Vercel Deployment

1. **New Vercel Project**: Go to [vercel.com](https://vercel.com/) and click **Add New** -> **Project**.
2. **Import Repository**: Select your `360tv` GitHub repository.
3. **Environment Variables Config**: 
   Before clicking "Deploy", expand the **Environment Variables** section and meticulously add these exact keys from your `.env` file:
   - `DATABASE_URL` (Your Neon Postgres String)
   - `YOUTUBE_API_KEY` (Your Google Cloud / YouTube Data API key)
   - `YOUTUBE_CHANNEL_ID` (The target channel ID)
   - `ADMIN_SECRET` (e.g., the base64 string you generated earlier)
   - `CRON_SECRET` (e.g., the other base64 string you generated earlier)
4. **Deploy**: Click the **Deploy** button. Vercel will install dependencies, generate the Prisma client for postgres, run Turbopack, and deploy your site.

---

## Phase 4: Post-Deploy Verification & Sync

1. **Visit the Live Admin Page**: Navigate to `https://<your-vercel-domain>.vercel.app/admin`.
2. **Authenticate**: Type in the `ADMIN_SECRET` string you configured in Vercel.
3. **Trigger Initial Sync**: Click **Trigger Sync**. Wait a few seconds for the status window to confirm success.
4. **Verify Frontend**: Go back to `https://<your-vercel-domain>.vercel.app/` and ensure your streams populated correctly!

---

## Troubleshooting & Tips

* **Cron Automation**: Because we committed `vercel.json` to the repo, Vercel automatically registers the 5-minute background sync cron job upon deploy. 
  *(To verify, check the "Settings -> Cron Jobs" tab inside your Vercel project dashboard).*
* **Database Branching**: If you ever want to do major development locally again, you can either keep using the Neon database, or create a temporary "branch" in the Neon console so your local dev tests don't mess up the live production streaming data.
* **Quota Limits**: Since caching is aggressively handled by Next.js cache tags (`revalidateTag`), the only thing hitting your YouTube Quota is the 5-minute cron job. It fetches efficiently, so you will stay well under the 10,000 daily YouTube API points limit!
