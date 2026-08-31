import ChecklistItem from "./ChecklistItem";
import ChecklistGroup from "./ChecklistGroup";
import {checklistFileNames, type ChecklistFile, type ChecklistReference} from '../../domain/checklist';

export interface ChecklistValidationResult {
    hasBuildingInformation: boolean;
    hasAddress: boolean;
    hasPropertyType: boolean;
    hasBuildingSize: boolean;
    hasLotSize: boolean;
    hasZoning: boolean;
    hasRentRoll: boolean;
    hasTenantNames: boolean;
    hasUnitSizes: boolean;
    hasRents: boolean;
    hasEscalations: boolean;
    hasLeaseTerms: boolean;
    hasFinancialInfo: boolean;
    hasExpenses: boolean;
    hasTaxes: boolean;
    hasAdditionalIncome: boolean;
    hasAmortizations: boolean;
}

export interface ChecklistAppraisal {
    validationResult: ChecklistValidationResult;
    dataTypeReferences: Record<string, ChecklistReference[] | undefined>;
}

interface ChecklistProps {
    appraisal: ChecklistAppraisal | null;
    files: readonly ChecklistFile[];
}

function Checklist({appraisal, files}: ChecklistProps) {
        return (
            (appraisal) ?
                <div id={"appraisal-checklist"} className={"appraisal-checklist"}>
                    <ChecklistGroup title={"Building Information"}
                    >
                        <ChecklistItem title={"Address"}
                                       description={"The street address of the building"}
                                       completed={appraisal.validationResult.hasAddress}
                        />
                        <ChecklistItem title={"Property Type"}
                                       description={"The type of property being appraised"}
                                       completed={appraisal.validationResult.hasPropertyType}
                        />
                        <ChecklistItem title={"Building Size"}
                                       description={"The size of the building"}
                                       completed={appraisal.validationResult.hasBuildingSize}
                        />
                        <ChecklistItem title={"Site Area"}
                                       description={"The size of the lot the building is sitting on"}
                                       completed={appraisal.validationResult.hasLotSize}
                        />
                        <ChecklistItem title={"Zoning"}
                                       description={"Has the city zoning information for the building."}
                                       completed={appraisal.validationResult.hasZoning}
                        />
                    </ChecklistGroup>
                    <ChecklistGroup title={"Rent Roll"}
                                   fileNames={checklistFileNames(appraisal.dataTypeReferences, files, ["RENT_ROLL"])}
                    >
                        <ChecklistItem title={"Tenant Name"}
                                       description={"The names of tenants for all occupied units."}
                                       completed={appraisal.validationResult.hasTenantNames}
                        />
                        <ChecklistItem title={"Unit Size"}
                                       description={"The size in square feet for all units"}
                                       completed={appraisal.validationResult.hasUnitSizes}
                        />
                        <ChecklistItem title={"Current Rent"}
                                       description={"Yearly rent for all occupied units"}
                                       completed={appraisal.validationResult.hasRents}
                        />
                        <ChecklistItem title={"Escalations"}
                                       description={"Escalations on rents where appropriate."}
                                       completed={appraisal.validationResult.hasEscalations}
                        />
                        <ChecklistItem title={"Term"}
                                       description={"Has lease start and end dates for all occupied units."}
                                       completed={appraisal.validationResult.hasLeaseTerms}
                        />
                    </ChecklistGroup>
                    <ChecklistGroup title={"Financial Information"}
                                   fileNames={checklistFileNames(appraisal.dataTypeReferences, files, ["INCOME_STATEMENT", "EXPENSE_STATEMENT"])}
                     >

                        <ChecklistItem title={"Expenses"}
                                       description={"The operating expenses for the building"}
                                       completed={appraisal.validationResult.hasExpenses}
                        />
                        <ChecklistItem title={"Realty Taxes"}
                                       description={"The tax bill for this building"}
                                       completed={appraisal.validationResult.hasTaxes}
                        />
                        <ChecklistItem title={"Additional Income"}
                                       description={"Non-rent Income like signage, parking, etc."}
                                       completed={appraisal.validationResult.hasAdditionalIncome}
                        />
                        <ChecklistItem title={"Amortization"}
                                       description={"Any capital expenditures being amortized and recovered."}
                                       completed={appraisal.validationResult.hasAmortizations}
                        />
                    </ChecklistGroup>
                </div>
                : null
        );
}

export default Checklist;
