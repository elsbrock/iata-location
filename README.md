# `iata-location`

A library for looking up airport ✈️ location data by IATA code.

## Synopsis

Install via npm:

```sh
npm install iata-location
```

Lookup an airport by IATA code:

```typescript
import { lookupAirport } from "iata-location";

const airport = await lookupAirport("JFK");
console.log(airport);
// {
//   latitude_deg: '40.639447',
//   longitude_deg: '-73.779317',
//   iso_country: 'US',
//   iso_region: 'US-NY',
//   municipality: 'New York',
//   iata_code: 'JFK'
// }
```

Lookup a group of airports by prefix:

```typescript
import * as AirportsFromC from "iata-location/data/C";

console.log(AirportsFromC);
// {
//   CAA: {
//     latitude_deg: '14.875',
//     longitude_deg: '-85.776108',
//     iso_country: 'HN',
//     iso_region: 'HN-OL',
//     municipality: 'El Aguacate',
//     iata_code: 'CAA'
//   },
//   CAB: {
//     ...
//   },
//   ...
// }
```

## Overview

The Airport Lookup Library provides an efficient, tree-shakeable solution for airport data lookups using IATA codes. It offers two primary methods for retrieving airport data:
- **Dynamic Runtime Lookup:** Retrieves data on the fly through the `lookupAirport` function.
- **Static Tree-Shakeable Imports:** Uses pre-generated data shards (e.g., for `JFK`, `LAX`, `CDG`) which can be removed from the final bundle via tree-shaking.

Under the hood, this library leverages [davidmegginson/ourairports-data](https://github.com/davidmegginson/ourairports-data), an open-data repository that provides daily downloads from OurAirports. By including it as a Git submodule, our project is able to obtain the latest airport data without manual intervention, ensuring that each data shard is always current and is maintained independently for optimal bundling.

## Features

- **Dynamic Runtime Lookup:** Use the `lookupAirport` function to dynamically query airport data.
- **Static Tree-Shakeable Imports:** Leverage statically imported data shards to benefit from optimized bundle sizes due to tree-shaking.
- **Modular, Up-to-Date Data:** Utilizes Git submodules to integrate with [ourairports-data](https://github.com/davidmegginson/ourairports-data) for daily airport data updates.

## How It Works

The library handles airport lookups in two ways:

1. **Runtime Lookup:**
   The `lookupAirport` function dynamically fetches airport data based on IATA codes, providing flexibility for various queries.

2. **Tree-Shakeable Static Imports:**
   For a set of popular IATA codes, the library imports static data shards. Modern bundlers can then safely remove any shards that are not used, resulting in a leaner final build.

## Data Generation with Git Submodules

Our airport data shards are managed as Git submodules. This method brings several benefits:

- **Modular Data:** Each shard is an independent submodule, which facilitates discrete development and updates.
- **Fresh Data:** The integration with [ourairports-data](https://github.com/davidmegginson/ourairports-data) ensures that the airport data is updated daily from the original source.
- **Optimized Bundling:** Only the static data shards that are explicitly imported end up in the final bundle, reducing the overall bundle size.

## Indexing Usage

Our library includes an internal indexing system that provides flexibility in how you import airport data:

- **Single Airport Import:**
  If you need data for just one specific airport, import it directly using its IATA code. For example:
  ```typescript
  import { JFK } from "iata-location/data/J/F/K";
  ```
  This way, only the data for `JFK` is included (thanks to tree-shaking).

- **Group Imports:**
  To import a group of related airports (for example, when you want all airports starting with a specific letter), you can use a grouped import. For instance:
  ```typescript
  import * as AirportsFromC from "iata-location/data/C";
  ```
  This will load all airport data in the `C` group.

- **Import All Airports:**
  If you require access to the complete airport dataset, you can import them all via an index file:
  ```typescript
  import * as allAirports from "iata-location/data";
  ```
  **Note:** Importing the entire dataset might increase your bundle size. It is recommended to use this method only if necessary, or in an environment where tree-shaking is not a concern.

## Getting Started

### Installation

You can install the package via npm:

```sh
npm install iata-location
```

## Example

Below is an excerpt from the example file demonstrating both runtime and tree-shakeable airport lookups. Note that markdown code blocks in this README are escaped so they display as literal text:

```typescript
import { lookupAirport } from "iata-location";

// Tree-shakeable static lookup for specific IATA codes.
import { CDG } from "iata-location/data/C/D/G";
import { JFK } from "iata-location/data/J/F/K";
import { LAX } from "iata-location/data/L/A/X";

async function runtimeLookupExample() {
  console.log("=== Runtime Lookup ===");
  const iataCodes = ["JFK", "LAX", "CDG", "XYZ"];

  // Execute lookups concurrently.
  const results = await Promise.all(
    iataCodes.map(async (code) => {
      const airport = await lookupAirport(code);
      return { code, airport };
    })
  );

  results.forEach(({ code, airport }) => {
    if (airport) {
      console.log(`Found data for ${code}:`, airport);
    } else {
      console.log(`No data found for ${code}.`);
    }
  });
}

function treeShakeableLookupExample() {
  console.log("=== Tree-Shakeable Lookup ===");
  // Direct static lookup via imported shard modules.
  console.log("JFK:", JFK ? JFK : "Not found");
  console.log("LAX:", LAX ? LAX : "Not found");
  console.log("CDG:", CDG ? CDG : "Not found");
}

async function main() {
  await runtimeLookupExample();
  treeShakeableLookupExample();
}

main().catch(error => {
  console.error("Error during lookup examples:", error);
});
```

## Conclusion

The Airport Lookup Library simplifies access to airport data by merging dynamic queries with static, tree-shakeable imports. The indexing system further enhances flexibility, allowing you to import single airports, groups, or even the complete dataset — all while leveraging the latest open data from [ourairports-data](https://github.com/davidmegginson/ourairports-data).

Happy coding!
