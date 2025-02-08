import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { Airport } from 'types';

// Read the CSV file.
const csvFilePath = path.join(__dirname, '../data/airports.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf8');

// Parse CSV with column names.
const records: any[] = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// Filter out records without an IATA code.
const validAirports = records.filter(record => record.iata_code && record.iata_code.trim() !== "");

// Convert CSV rows into Airport objects.
const airports: Airport[] = validAirports.map(row => {
  return {
    latitude_deg: row.latitude_deg,
    longitude_deg: row.longitude_deg,
    iso_country: row.iso_country,
    iso_region: row.iso_region,
    municipality: row.municipality,
    iata_code: row.iata_code.toUpperCase() // ensure uppercase consistency
  };
});

// Build a tree for the IATA prefixes.
// Each node may have an airport (if its prefix is a complete code) and children.
interface AirportTree {
  airport?: Airport;
  children: { [letter: string]: AirportTree };
}

const rootTree: AirportTree = { children: {} };

for (const airport of airports) {
  let current: AirportTree = rootTree;
  for (const letter of airport.iata_code) {
    if (!current.children[letter]) {
      current.children[letter] = { children: {} };
    }
    current = current.children[letter];
  }
  // Store the airport at the leaf corresponding to its full code.
  current.airport = airport;
}

// Define the output directory for generated shard files.
const outputDataDir = path.join(__dirname, '../src/data');
fs.mkdirSync(outputDataDir, { recursive: true });

/**
 * Recursively generate index.ts files for each node in the tree.
 *
 * @param node - The current tree node.
 * @param dir - The directory in which to write the index.ts file.
 * @param depth - Depth relative to src/data (used to compute relative import paths).
 */
function generateNodeFiles(node: AirportTree, dir: string, depth: number) {
  // For each child letter, ensure its subdirectory exists.
  const childKeys = Object.keys(node.children).sort();
  for (const key of childKeys) {
    const childDir = path.join(dir, key);
    fs.mkdirSync(childDir, { recursive: true });
    // Recursively generate the child files.
    generateNodeFiles(node.children[key], childDir, depth + 1);
  }

  // Compute the relative import path from this file to src/types.
  // Files generated in src/data/... at "depth" require "../" repeated (depth+1) times.
  const relativeImportPath = '../'.repeat(depth + 1) + 'types';

  // Build the file content with named exports instead of a generic aggregator.
  let fileContent = `// Auto-generated index file – do not edit.\n`;

  if (node.airport) {
    // If there's a local airport, import the Airport type and export it using its IATA code.
    fileContent += `import { Airport } from '${relativeImportPath}';\n\n`;
    fileContent += `export const ${node.airport.iata_code}: Airport = ${JSON.stringify(node.airport, null, 2)};\n\n`;
  }

  // For each child, re-export all named exports. This makes all airports accessible by their IATA names.
  for (const key of childKeys) {
    fileContent += `export * from './${key}';\n`;
  }

  // Write the index.ts file into the current directory.
  const filePath = path.join(dir, 'index.ts');
  fs.writeFileSync(filePath, fileContent, 'utf8');
}

// Start generating from the root.
// The root corresponds to src/data (depth 0). This file aggregates the top-level directories.
generateNodeFiles(rootTree, outputDataDir, 0);

console.log('Library generated successfully.');
