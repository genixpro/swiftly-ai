import type {LeasingCostStructure} from '../../../domain/leasingCosts';
import type {MarketRent} from '../../../domain/marketRents';

interface UnitStructureSelection {
    leasingCostStructure?: string | null;
    marketRent?: string | null;
}

interface AppraisalStructures {
    leasingCosts?: readonly LeasingCostStructure[] | null;
    marketRents?: readonly MarketRent[] | null;
}

/** Resolves the explicit structure first, retaining the legacy default fallback. */
export function findLeasingCostStructure(
    appraisal: AppraisalStructures,
    unit: UnitStructureSelection,
    defaultName: string,
): LeasingCostStructure | null | undefined {
    const leasingCosts = appraisal.leasingCosts ?? [];
    return leasingCosts.find((item) => item.name === unit.leasingCostStructure)
        || leasingCosts.find((item) => item.name === defaultName);
}

export function findMarketRent(
    appraisal: Pick<AppraisalStructures, 'marketRents'>,
    unit: UnitStructureSelection,
): MarketRent | null {
    return appraisal.marketRents?.find((item) => item.name === unit.marketRent) || null;
}

/** Keeps the historical, leasing-cost-count based label used by the unit editor. */
export function nextLeasingStructureName(appraisal: Pick<AppraisalStructures, 'leasingCosts'>): string {
    const leasingCosts = appraisal.leasingCosts ?? [];
    return `New Leasing Structure ${leasingCosts.length + 1}`;
}
