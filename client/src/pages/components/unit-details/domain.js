export function findLeasingCostStructure(appraisal, unit, defaultName) {
    return appraisal.leasingCosts.find((item) => item.name === unit.leasingCostStructure)
        || appraisal.leasingCosts.find((item) => item.name === defaultName);
}

export function findMarketRent(appraisal, unit) {
    return appraisal.marketRents.find((item) => item.name === unit.marketRent) || null;
}

export function nextLeasingStructureName(appraisal) {
    return `New Leasing Structure ${appraisal.leasingCosts.length + 1}`;
}
