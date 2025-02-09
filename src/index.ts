import type { Airport } from './types';

// Cache the dynamically imported modules keyed by their full generated paths.
const moduleCache: { [modulePath: string]: Promise<{ [iata: string]: Airport }> } = {};

/**
 * Dynamically loads and returns the airport data for a given IATA code.
 *
 * Uses dynamic import to only load the file corresponding to the IATA code.
 * The file is located at a path constructed by joining each character of the IATA.
 * For example, for 'JFK', the file is at './data/J/F/K'.
 *
 * @param iata - The IATA code.
 * @returns A promise that resolves to the Airport object if found; otherwise, undefined.
 */
export async function lookupAirport(iata: string): Promise<Airport | undefined> {
  if (!iata) return undefined;

  // Ensure the IATA code is in uppercase
  const upperIata = iata.toUpperCase();

  // Construct the module path by splitting the IATA code into its characters.
  // For example, "JFK" becomes "./data/J/F/K"
  const modulePath = `./data/${upperIata.split('').join('/')}`;

  try {
    if (!moduleCache[modulePath]) {
      moduleCache[modulePath] = import(modulePath);
    }
    const airportModule = await moduleCache[modulePath];
    // The module exports the airport by its IATA code – retrieve it directly.
    return airportModule[upperIata];
  } catch (error) {
    // Silently return undefined if the module or export isn't found.
    return undefined;
  }
}

export { Airport };
