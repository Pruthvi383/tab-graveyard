import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables. Check dashboard/.env.local before seeding.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const userId = "demo-user";

const sessions = [
  {
    topic: "Redis caching deep dive",
    tabs: [
      { title: "Redis EXPIRE command", url: "https://redis.io/docs/latest/commands/expire/" },
      { title: "Upstash Redis docs", url: "https://upstash.com/docs/redis/overall/getstarted" },
      { title: "Cache invalidation strategies", url: "https://www.cloudflare.com/learning/cdn/what-is-cache-invalidation/" },
    ],
  },
  {
    topic: "Next.js 16 App Router patterns",
    tabs: [
      { title: "Next.js App Router docs", url: "https://nextjs.org/docs/app" },
      { title: "React 19 use hook guide", url: "https://react.dev/reference/react/use" },
      { title: "Vercel streaming handbook", url: "https://vercel.com/guides/what-is-react-suspense" },
    ],
  },
  {
    topic: "Gemini prompt experiments",
    tabs: [
      { title: "Google AI Studio", url: "https://aistudio.google.com/" },
      { title: "Gemini API quickstart", url: "https://ai.google.dev/gemini-api/docs/quickstart" },
      { title: "JSON prompting checklist", url: "https://ai.google.dev/gemini-api/docs/structured-output" },
    ],
  },
  {
    topic: "Tailwind v4 and shadcn polish",
    tabs: [
      { title: "Tailwind CSS v4 docs", url: "https://tailwindcss.com/docs/installation/using-postcss" },
      { title: "shadcn/ui docs", url: "https://ui.shadcn.com/docs" },
      { title: "Radix tooltip primitives", url: "https://www.radix-ui.com/primitives/docs/components/tooltip" },
    ],
  },
  {
    topic: "Supabase row-level patterns",
    tabs: [
      { title: "Supabase JavaScript client", url: "https://supabase.com/docs/reference/javascript/introduction" },
      { title: "Postgres JSONB indexing", url: "https://supabase.com/docs/guides/database/json" },
      { title: "Supabase SQL editor", url: "https://supabase.com/dashboard/project/_/sql/new" },
    ],
  },
  {
    topic: "YouTube rabbit hole on system design",
    tabs: [
      { title: "System design interview playlist", url: "https://www.youtube.com/watch?v=UzLMhqg3_Wc" },
      { title: "How Redis works internally", url: "https://www.youtube.com/watch?v=jgpVdJB2sKQ" },
      { title: "Event-driven architecture explainer", url: "https://www.youtube.com/watch?v=STKCRSUsyP0" },
    ],
  },
  {
    topic: "Chrome extension Manifest V3 references",
    tabs: [
      { title: "Chrome Extensions Overview", url: "https://developer.chrome.com/docs/extensions" },
      { title: "Manifest V3 migration", url: "https://developer.chrome.com/docs/extensions/develop/migrate" },
      { title: "chrome.alarms API", url: "https://developer.chrome.com/docs/extensions/reference/api/alarms" },
    ],
  },
  {
    topic: "Designing a better tab cleanup UX",
    tabs: [
      { title: "Figma file: Tab Graveyard concepts", url: "https://www.figma.com/" },
      { title: "Airtable product notes", url: "https://airtable.com/" },
      { title: "Notion sprint board", url: "https://www.notion.so/" },
    ],
  },
  {
    topic: "Reading about AI agent memory",
    tabs: [
      { title: "LangChain memory overview", url: "https://python.langchain.com/docs/modules/memory/" },
      { title: "Vector database primer", url: "https://www.pinecone.io/learn/vector-database/" },
      { title: "RAG patterns in production", url: "https://www.anyscale.com/blog/retrieval-augmented-generation-in-production" },
    ],
  },
  {
    topic: "Weekend shopping research",
    tabs: [
      { title: "Mechanical keyboard comparison", url: "https://www.rtings.com/keyboard" },
      { title: "Desk lamp reviews", url: "https://www.nytimes.com/wirecutter/reviews/best-desk-lamp/" },
      { title: "Standing desk options", url: "https://www.amazon.com/" },
    ],
  },
  {
    topic: "Social catch-up spiral",
    tabs: [
      { title: "Reddit webdev", url: "https://www.reddit.com/r/webdev/" },
      { title: "X home timeline", url: "https://x.com/home" },
      { title: "LinkedIn notifications", url: "https://www.linkedin.com/notifications/" },
    ],
  },
  {
    topic: "Open source issues to triage",
    tabs: [
      { title: "GitHub issues assigned to me", url: "https://github.com/issues" },
      { title: "Vercel edge runtime issue", url: "https://github.com/vercel/next.js/issues" },
      { title: "Supabase examples repo", url: "https://github.com/supabase/supabase/tree/master/examples" },
    ],
  },
  {
    topic: "Docs session on auth flows",
    tabs: [
      { title: "OAuth 2.0 simplified", url: "https://www.oauth.com/" },
      { title: "Supabase auth docs", url: "https://supabase.com/docs/guides/auth" },
      { title: "Next.js middleware auth patterns", url: "https://nextjs.org/docs/app/building-your-application/routing/middleware" },
    ],
  },
  {
    topic: "Random reading list",
    tabs: [
      { title: "The Pragmatic Engineer", url: "https://newsletter.pragmaticengineer.com/" },
      { title: "Stripe engineering blog", url: "https://stripe.com/blog/engineering" },
      { title: "Linear blog", url: "https://linear.app/blog" },
    ],
  },
  {
    topic: "Planning a Redis study night",
    tabs: [
      { title: "Redis data types", url: "https://redis.io/docs/latest/develop/data-types/" },
      { title: "Rate limiting with Redis", url: "https://upstash.com/blog/redis-rate-limiting" },
      { title: "Build a cache in Node.js", url: "https://www.digitalocean.com/community/tutorials/how-to-implement-caching-in-node-js-using-redis" },
    ],
  },
  {
    topic: "Frontend animation inspiration",
    tabs: [
      { title: "Awwwards collection", url: "https://www.awwwards.com/websites/animation/" },
      { title: "Motion design with CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations" },
      { title: "Staggered reveals patterns", url: "https://web.dev/articles/animations-guide" },
    ],
  },
  {
    topic: "Podcasts for the commute",
    tabs: [
      { title: "Syntax.fm latest", url: "https://syntax.fm/" },
      { title: "Changelog podcast", url: "https://changelog.com/podcast" },
      { title: "Spotify daily mix", url: "https://open.spotify.com/" },
    ],
  },
  {
    topic: "Vercel deployment cleanup",
    tabs: [
      { title: "Vercel env vars", url: "https://vercel.com/docs/projects/environment-variables" },
      { title: "Vercel project settings", url: "https://vercel.com/dashboard" },
      { title: "Next.js production checklist", url: "https://nextjs.org/docs/app/building-your-application/deploying/production-checklist" },
    ],
  },
  {
    topic: "Email and calendar backlog",
    tabs: [
      { title: "Gmail inbox", url: "https://mail.google.com/" },
      { title: "Google Calendar week view", url: "https://calendar.google.com/" },
      { title: "Meeting notes in Notion", url: "https://www.notion.so/" },
    ],
  },
  {
    topic: "Late-night rabbit hole on browser memory",
    tabs: [
      { title: "Chrome memory usage guide", url: "https://developer.chrome.com/docs/devtools/memory-problems/" },
      { title: "Why tabs eat RAM", url: "https://www.howtogeek.com/437681/why-do-chrome-tabs-use-so-much-ram/" },
      { title: "Performance panel docs", url: "https://developer.chrome.com/docs/devtools/performance" },
    ],
  },
];

const now = Date.now();

async function main() {
  const rows = sessions.map((session, index) => ({
    user_id: userId,
    topic: session.topic,
    tabs: session.tabs,
    created_at: new Date(now - index * 18 * 60 * 60 * 1000).toISOString(),
    restored_count: Math.floor(index / 4),
  }));

  const { error: sessionsError } = await supabase.from("sessions").insert(rows);

  if (sessionsError) {
    throw new Error(`Failed to seed sessions: ${sessionsError.message}`);
  }

  const events = rows.flatMap((session) =>
    session.tabs.map((tab) => ({
      user_id: userId,
      event_type: "archived",
      tab_title: tab.title,
      tab_url: tab.url,
    })),
  );

  const { error: eventsError } = await supabase.from("tab_events").insert(events);

  if (eventsError) {
    throw new Error(`Failed to seed tab events: ${eventsError.message}`);
  }

  console.log(`Seeded ${rows.length} sessions and ${events.length} tab events for ${userId}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
