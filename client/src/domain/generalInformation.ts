const squareFeetPerAcre = 43_560;

/** Retains the display calculation used by the existing General Information table. */
export function lotSizeSquareFeet(sizeOfLand: unknown): number {
    return Number(sizeOfLand) * squareFeetPerAcre;
}

/** Keeps the legacy one-decimal Floor Space Index representation. */
export function floorSpaceIndex(buildableArea: unknown, sizeOfLand: unknown): string {
    return (Number(buildableArea) / (Number(sizeOfLand) * squareFeetPerAcre)).toFixed(1);
}

/** The prior screen intentionally shows the editor unless zoning is explicitly blank or null. */
export function hasZoneDescription(zoning: unknown): boolean {
    return zoning !== '' && zoning !== null;
}
