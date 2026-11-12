export async function run() {
  const { createSaveReader } = await import('/reader/dist/index.js');
  const reader = await createSaveReader({ baseUrl: '/reader/assets/' });
  const names = ['red', 'yellow', 'gold', 'crystal'].map((n) => `public/${n}`);
  names.push(...['RD', 'BU', 'YW', 'GD', 'SI'].flatMap((n) => [`synthetic/${n}`, `synthetic/${n}-empty`]));
  names.push('in-game/red-zero');
  const results = [];
  const hash = async (bytes) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).join(',');
  try {
    for (const name of names) {
      const response = await fetch(`/fixtures/${name}.sav`);
      if (!response.ok) throw new Error(`Missing fixture: ${name}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const before = await hash(bytes);
      let inspected = await reader.inspect(bytes, { fileName: `${name}.sav` });
      const neededChoice = inspected.code === 'format-choice-required';
      if (neededChoice) inspected = await reader.inspect(bytes, { formatId: 'pkhex' });
      results.push({ name, inspected, neededChoice, unchanged: before === await hash(bytes) });
    }
    const invalid = await reader.inspect(new Uint8Array([1, 2, 3]));
    const response = await fetch('/report', { method: 'POST', body: JSON.stringify({ results, invalid }) });
    if (!response.ok) throw new Error('Could not save local test report');
    return results.map(({ name, inspected, unchanged }) => ({ name, status: inspected.status,
      versions: inspected.game?.versions, caught: inspected.pokedex?.caughtSpecies.length,
      seen: inspected.pokedex?.seenSpecies.length, unchanged }));
  } finally {
    reader.dispose();
  }
}
