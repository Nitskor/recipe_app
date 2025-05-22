export const cleanAIJson = (raw) => {
  return raw
    .trim()

    // Remove trailing commas before closing brackets/braces
    .replace(/,\s*(?=[}\]])/g, '')

    // Fix missing commas between "unit" and "notes" keys
    .replace(/("unit"\s*:\s*"[^"]*")\s*("notes"\s*:)/g, '$1, $2')

    // Convert rogue string ingredients followed by quantity, unit, notes to proper object
    // e.g.  "ginger", "quantity": 1, ...  ->  {"name": "ginger", "quantity": 1, ...}
    .replace(/"([^"]+)"\s*,\s*"quantity"\s*:/g, (match, name) => {
      return `{"name": "${name}", "quantity":`;
    });
};
