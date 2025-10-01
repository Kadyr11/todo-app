// Temporary debug test for project filtering
const testProjects = [
  { id: 1, name: "Active 1", archived: false },
  { id: 2, name: "Archived 1", archived: true },
  { id: 3, name: "Active 2", archived: false }
];

console.log("Test Projects:", testProjects);
console.log("Active:", testProjects.filter(p => !p.archived));
console.log("Archived:", testProjects.filter(p => p.archived));

// Test normalizeProject function
function coerceArchived(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
    return false;
  }
  if (typeof v === 'number') return v === 1;
  return false;
}

function normalizeProject(p) {
  return {
    id: Number(p.id),
    name: String(p.name ?? ''),
    description: p.description ?? null,
    archived: coerceArchived(p.archived),
    archivedAt: p.archivedAt ?? null,
    createdAt: p.createdAt ?? null,
    updatedAt: p.updatedAt ?? null,
  };
}

// Test different archived values
const testCases = [
  { archived: false },
  { archived: true },
  { archived: "false" },
  { archived: "true" },
  { archived: 0 },
  { archived: 1 }
];

console.log("\nNormalization test:");
testCases.forEach(test => {
  const normalized = normalizeProject({ id: 1, name: "test", ...test });
  console.log(`Input: ${JSON.stringify(test.archived)} -> Output: ${normalized.archived} (${typeof normalized.archived})`);
});