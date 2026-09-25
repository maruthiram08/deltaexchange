import * as onepager from "./onepager";
import * as draft from "./draft";

// Every script the walkthrough can play. To add one, create scripts/<name>.js that exports REEL (and optionally PACE),
// then register it here. `extends` makes a script start from another one and override only what it lists.
export const SCRIPTS = {
  onepager: { label: "One-pager text", pace: onepager.PACE, intro: onepager.INTRO, reel: onepager.REEL },
  draft: { label: "Draft", extends: "onepager", pace: draft.PACE, intro: draft.INTRO, reel: draft.REEL },
};

// The script visitors see. Change this to switch the default for everyone.
export const DEFAULT_SCRIPT = "onepager";

// A story is the merge of the base script's story and this script's own fields. `null` removes a story.
const mergeReel = (base, own) => {
  const merged = { ...base };
  for (const [id, story] of Object.entries(own)) {
    if (story === null) delete merged[id];
    else merged[id] = { ...merged[id], ...story };
  }
  return merged;
};

// Returns { id, label, pace, intro, reel } for a script id, falling back to the default when the id is unknown.
export function resolveScript(id, seen = []) {
  const key = SCRIPTS[id] && !seen.includes(id) ? id : DEFAULT_SCRIPT;
  const script = SCRIPTS[key];
  const base = script.extends && !seen.includes(script.extends) ? resolveScript(script.extends, [...seen, key]) : null;
  return {
    id: key,
    label: script.label,
    pace: { ...base?.pace, ...script.pace },
    intro: { ...base?.intro, ...script.intro },
    reel: base ? mergeReel(base.reel, script.reel) : { ...script.reel },
  };
}
