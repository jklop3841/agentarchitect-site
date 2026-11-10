// Region configuration. One codebase, configured per deployment.
//
//   global  the public international site (the only region deployed today)
//   cn      reserved for a future mainland-China deployment; nothing is deployed and no
//           China-specific service is wired up yet
//
// Differences between regions belong here as data, not as forked code. Private
// infrastructure is never referenced from this file.

export type Region = "global" | "cn";
export type Locale = "en" | "zh";

export function currentRegion(): Region {
  return process.env.NEXT_PUBLIC_SITE_REGION === "cn" ? "cn" : "global";
}

export type RegionProfile = {
  region: Region;
  defaultLocale: Locale;
  // ICP filing number to show in the footer of a mainland deployment (public information).
  icpNumber: string | null;
  // External services that must not be called from this region's deployment.
  disallowedExternalServices: string[];
};

export function regionProfile(region: Region = currentRegion()): RegionProfile {
  if (region === "cn") {
    return {
      region,
      defaultLocale: "zh",
      icpNumber: process.env.NEXT_PUBLIC_ICP_NUMBER?.trim() || null,
      disallowedExternalServices: ["overseas-model-apis"],
    };
  }
  return { region, defaultLocale: "en", icpNumber: null, disallowedExternalServices: [] };
}

export function resolveLocale(requested: string | string[] | undefined, region: Region = currentRegion()): Locale {
  const value = Array.isArray(requested) ? requested[0] : requested;
  if (value === "zh" || value === "en") return value;
  return regionProfile(region).defaultLocale;
}
