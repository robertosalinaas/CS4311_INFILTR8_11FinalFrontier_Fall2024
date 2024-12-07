export const EXPLOITS = [
    "Unauthenticated port bypass",
    "Default credentials",
    "Missing encryption protocols",
    "Unpatched software exploits",
    "Other",
] as const;

export type ExploitType = typeof EXPLOITS[number];