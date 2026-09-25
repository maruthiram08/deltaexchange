import { IDEAS } from "./ideas";

// Numbers about how this prototype was built, for the landing page. Cut or reword a line to change what shows.
//
// The counts of improvements, live demos and demo steps come from the app itself, so they stay true when the script
// changes. The rest is a snapshot taken on 25 Sep 2026: lines, files and screens from the repo, the last commit from
// git, and the hours, days and screenshots from the build session logs. Hours are active time (gaps over 20 minutes
// left out) and include the docs and email work, so every figure built on them is an estimate.
const withDemo = IDEAS.filter((idea) => idea.story?.demo);
const IMPROVEMENTS = IDEAS.length;
const DEMOS = withDemo.length;
const STEPS = withDemo.reduce((sum, idea) => sum + idea.story.demo.steps.length, 0);
const HOURS = 18;
const DAYS = 2.5;
const LINES = 12000;
const FILES = 76;
const SCREENS = 14;
const SHOTS = 71;

const one = (n) => n.toFixed(1);

// One number at a time shown on the side tab each time it peeks out, in this order.
export const PEEK_STATS = [
  { value: `~${HOURS} hrs`, label: "of active build time" },
  { value: String(IMPROVEMENTS), label: "improvements reviewed" },
  { value: String(DEMOS), label: "with a live prototype" },
  { value: `${LINES.toLocaleString("en-US")}+`, label: "lines of code" },
  { value: `${one(DEMOS / HOURS)} per hr`, label: "tryable improvements" },
];

// The build measured like a product, for fun. Each metric says how it was worked out.
export const BUILD_METRICS = {
  northStar: {
    value: `${one(DEMOS / HOURS)} per hr`,
    label: "tryable improvements per active hour",
    how: `${DEMOS} improvements with a live prototype, divided by about ${HOURS} active hours.`,
  },
  groups: [
    {
      title: "Product metrics",
      note: "How good is what shipped",
      items: [
        { value: `${Math.round((DEMOS / IMPROVEMENTS) * 100)}%`, label: "demo coverage", how: `${DEMOS} live demos out of ${IMPROVEMENTS} improvements.` },
        { value: `~${Math.round(STEPS / DEMOS)}`, label: "steps per demo", how: `${STEPS} scripted steps across ${DEMOS} demos.` },
        { value: String(SCREENS), label: "screens in play", how: "Prototype screens the demos run across." },
        { value: `~${one(SHOTS / IMPROVEMENTS)}`, label: "feedback rounds per improvement", how: `${SHOTS} screenshots shared out of ${IMPROVEMENTS} improvements. Rough: each screenshot counts as one round.` },
        { value: `~${Math.round(LINES / FILES)}`, label: "lines per file", how: `About ${LINES.toLocaleString("en-US")} lines across ${FILES} source files, CSS included.` },
      ],
    },
    {
      title: "Business metrics",
      note: "What it cost and how fast",
      items: [
        { value: `~${DAYS} days`, label: "time to market", how: "From the first work to the deployed site." },
        { value: `~${one(IMPROVEMENTS / HOURS)}`, label: "improvements per hour", how: `${IMPROVEMENTS} improvements over about ${HOURS} active hours.` },
        { value: `~${Math.round((HOURS * 60) / IMPROVEMENTS)} min`, label: "cost per improvement", how: `About ${HOURS} hours, docs and email included, divided by ${IMPROVEMENTS}.` },
        { value: `~${one(HOURS / DAYS)} hrs`, label: "active hours per day", how: `About ${HOURS} active hours across ${DAYS} days.` },
        { value: `~${Math.round(LINES / HOURS / 10) * 10}`, label: "lines an hour", how: `About ${LINES.toLocaleString("en-US")} lines over about ${HOURS} hours. Mostly CSS and layout.` },
      ],
    },
  ],
  guardrail: { value: "4:09 AM", label: "the last commit", how: "The one cost the other numbers do not show." },
};
