
export const meta = {
  name: 'marketing-brainstorm',
  description: 'Research peptide marketing landscape and synthesize actionable marketing plan for Ace Peptides',
  phases: [
    { title: 'Research', detail: 'Parallel research across communities, competitors, content angles, and influencers' },
    { title: 'Synthesize', detail: 'Combine findings into prioritized, actionable marketing plan' },
  ],
};

const BASE = '/Users/charlesow/Desktop/reta-research';

// ── Phase 1: Parallel Research ───────────────────────────────────────────────
phase('Research');

const SCHEMA = {
  type: 'object',
  properties: {
    findings: { type: 'array', items: { type: 'string' } },
    opportunities: { type: 'array', items: { type: 'string' } },
    specifics: { type: 'array', items: { type: 'string' } },
  },
  required: ['findings', 'opportunities', 'specifics'],
};

const [communities, competitors, content, influencers, affiliate] = await parallel([

  // Agent A: Reddit + Forum communities
  () => agent(`
You are researching online communities for a research peptide vendor (Ace Peptides) selling Retatrutide.
Use WebSearch and WebFetch to find SPECIFIC, REAL information.

Research these Reddit communities and forums:
- r/Peptides, r/PeptidesScience, r/Nootropics, r/Biohacking
- r/GLP1, r/Semaglutide, r/tirzepatide, r/WeightLoss
- r/bodybuilding, r/SteroidsWiki, r/longevity
- Any forums like Longecity, Eroids, anabolicminds that discuss research peptides

For each community find:
1. Approximate size (subscribers/members)
2. Whether vendor promotion/discussion is allowed (check rules)
3. What content performs best (educational, research discussion, etc.)
4. Key moderators or respected voices
5. Whether Retatrutide is already being discussed and how

Also search for "Retatrutide reddit" and "Retatrutide research source" to understand current conversation.

Return findings, opportunities (specific communities where Ace Peptides could engage), and specifics (exact subreddit rules, post types that work, etc.)
`, { label: 'reddit-communities', phase: 'Research', schema: SCHEMA }),

  // Agent B: Competitor analysis
  () => agent(`
You are researching how other research peptide vendors market themselves online.
Use WebSearch to find SPECIFIC examples.

Search for:
- "buy retatrutide research" to find competitors
- "research peptides" vendors and their marketing approaches
- How vendors like Limitless Life Nootropics, Peptide Sciences, Amino Asylum, Swiss Chems market online
- What their social media presence looks like
- How they use disclaimers while still driving traffic
- Their affiliate/referral programs
- What content they produce (blogs, educational articles, etc.)
- How they handle crypto payments in their marketing

Also look for:
- What vendors have been banned from platforms and why (to avoid pitfalls)
- What marketing angles work within "research use only" framing
- Pricing transparency vs. opacity in competitor marketing

Return findings (what competitors do), opportunities (gaps Ace Peptides can exploit), and specifics (exact tactics, copy angles, platform approaches).
`, { label: 'competitor-analysis', phase: 'Research', schema: SCHEMA }),

  // Agent C: Content strategy + angles
  () => agent(`
You are researching what content works for research peptides / biohacking marketing.
Use WebSearch and WebFetch to find real examples.

Research:
1. YouTube: Search "Retatrutide" and "research peptides" - what channels cover this? How many views?
2. TikTok/Instagram: What biohacking creators discuss GLP-1 research? Search "Retatrutide tiktok" and "research peptides social media"
3. Twitter/X: Search "Retatrutide" - who are the key voices? What gets engagement?
4. What content angles work within research-only framing:
   - Educational content about GLP-1/GIP/glucagon mechanisms
   - Research paper summaries/breakdowns
   - Reconstitution guides and calculator tools
   - Peptide storage and handling guides
   - Dosing research (from published studies)
5. What content gets the most shares/engagement in biohacking communities
6. Blog/SEO: What keywords have search volume around Retatrutide?

Return findings (what content works), opportunities (specific content ideas for Ace Peptides), and specifics (exact creators, view counts, engagement rates, keyword opportunities).
`, { label: 'content-strategy', phase: 'Research', schema: SCHEMA }),

  // Agent D: Influencer + KOL landscape
  () => agent(`
You are identifying potential influencer and key opinion leader (KOL) partnerships for a research peptide vendor.
Use WebSearch to find REAL, SPECIFIC people.

Find:
1. Biohacking influencers who discuss research compounds (Twitter/X, YouTube, podcast)
   - Search: "biohacking podcast retatrutide", "research peptides influencer", "GLP-1 biohacking youtube"
2. Doctors/researchers who discuss GLP-1 research publicly (and wouldn't mind vendor association)
3. Fitness/bodybuilding influencers who discuss research chemicals
4. Nootropics/longevity communities and their respected voices
5. Discord/Telegram communities with influencers discussing research peptides

For each person/channel found:
- Approximate audience size
- Platform
- Whether they already discuss research vendors
- Potential for affiliate partnership

Also research:
- What affiliate commission rates are standard in this space?
- How do other vendors structure influencer deals?

Return findings (who exists), opportunities (who to reach out to and how), and specifics (names, handles, audience sizes, contact approaches).
`, { label: 'influencer-landscape', phase: 'Research', schema: SCHEMA }),

  // Agent E: Crypto + privacy-focused marketing channels
  () => agent(`
You are researching marketing channels that specifically cater to crypto-paying customers for research products.

Use WebSearch to find:
1. Telegram groups and channels focused on:
   - Research peptides/chemicals
   - Biohacking with crypto payments
   - GLP-1/peptide research discussion
   Search: "retatrutide telegram", "research peptides telegram group", "peptide source review telegram"

2. Discord servers for:
   - Biohacking communities
   - Research chemical discussion
   - Nootropics communities
   Search: "biohacking discord", "research peptides discord", "nootropics discord server"

3. Privacy-focused forums and imageboards where research vendors advertise

4. Crypto/Web3 communities that intersect with biohacking:
   - Who is buying peptides with crypto and where do they hang out?
   
5. Newsletter opportunities:
   - Biohacking newsletters, longevity newsletters that accept sponsors
   - Search "biohacking newsletter sponsor"

6. Podcast sponsorship opportunities in the biohacking/longevity space

Return findings (what channels exist), opportunities (where Ace Peptides should have presence), and specifics (channel names, sizes, how to join/participate, sponsorship rates if available).
`, { label: 'crypto-channels', phase: 'Research', schema: SCHEMA }),

]);

// ── Phase 2: Synthesize ──────────────────────────────────────────────────────
phase('Synthesize');

const plan = await agent(`
You are synthesizing market research into a concrete, actionable marketing plan for Ace Peptides.

ABOUT ACE PEPTIDES:
- Sells Retatrutide (GLP-1/GIP/glucagon triple agonist) research peptide
- 3 SKUs: 5mg ($50), 10mg ($85), 15mg ($100, low stock)
- Crypto-only payment: USDC and ETH
- Website: ace-peptides.com with a reconstitution calculator built in
- Affiliate code system: can generate custom codes for any discount %
- Legal framing: "for laboratory research use only"

RESEARCH FINDINGS:
${JSON.stringify({ communities, competitors, content, influencers, affiliate }, null, 2)}

Create a COMPREHENSIVE, SPECIFIC marketing plan with:

## 1. Quick Wins (Do This Week)
Specific actions with exact subreddits, Telegram groups, or platforms to use.
Include what to say/post (staying within research-only framing).

## 2. Content Strategy
What to post, where, and how often. Specific content ideas that work within research framing.
Include the reconstitution calculator as a traffic asset.

## 3. Community Presence
Which communities to join and how to provide value before promoting.
Exactly how to handle the "for research use only" positioning.

## 4. Affiliate & KOL Program
Who to reach out to first. What commission/terms to offer.
How to structure codes (% discount vs. flat fee to affiliate).

## 5. Organic SEO
Top keywords to target. Blog post ideas that drive search traffic.
What to write that's educational and legally safe.

## 6. Platform-Specific Playbooks
One paragraph each for: Reddit, Twitter/X, Telegram/Discord, YouTube, TikTok.

## 7. What to Avoid
Specific pitfalls that have gotten other vendors banned or in legal trouble.

## 8. 30-Day Action Plan
Week-by-week specific tasks, prioritized by likely ROI.

Be SPECIFIC. Name real subreddits, real content angles, real influencers. Generic advice is useless.
Write this as if you're a growth marketer who deeply understands this niche.
`, { label: 'synthesis', phase: 'Synthesize' });

// Write the plan to a file in the project
await agent(`
Write the following marketing plan to ${BASE}/docs/marketing-plan.md

Create the directory if needed: mkdir -p ${BASE}/docs

Then write this content to the file:

# Ace Peptides — Marketing Plan

*Generated: June 2026*

${plan}

---
*This document is for internal strategy use only.*

Then verify the file was written by reading it back.
Report done when complete.
`, { label: 'write-doc', phase: 'Synthesize' });

log('Marketing plan written to docs/marketing-plan.md');
return plan;
