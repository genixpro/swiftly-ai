import React from 'react';
import ChecklistItem from "./ChecklistItem";
import ChecklistGroup from "./ChecklistGroup";

class Checklist extends React.Component {

    getFileNames(dataTypes)
    {
        const fileNames = [];
        dataTypes.forEach((dataType) =>
        {
            if (this.props.appraisal.dataTypeReferences[dataType] && this.props.files)
            {
                this.props.appraisal.dataTypeReferences[dataType].forEach((reference) =>
                {
                    this.props.files.forEach((file) =>
                    {
                        if (file._id === reference.fileId && fileNames.indexOf(file.fileName) === -1)
                        {
                            fileNames.push(file.fileName);
                        }
                    })
                });
            }
        });
        return fileNames;
    }


    render() {
        return (
            (this.props.appraisal) ?
                <div id={"appraisal-checklist"} className={"appraisal-checklist"}>
                    <ChecklistGroup title={"Building Information"}
                                   description={""}
                                   completed={this.props.appraisal.validationResult.hasBuildingInformation}
                    >
                        <ChecklistItem title={"Address"}
                                       description={"The street address of the building"}
                                       completed={this.props.appraisal.validationResult.hasAddress}
                        />
                        <ChecklistItem title={"Property Type"}
                                       description={"The type of property being appraised"}
                                       completed={this.props.appraisal.validationResult.hasPropertyType}
                        />
                        <ChecklistItem title={"Building Size"}
                                       description={"The size of the building"}
                                       completed={this.props.appraisal.validationResult.hasBuildingSize}
                        />
                        <ChecklistItem title={"Site Area"}
                                       description={"The size of the lot the building is sitting on"}
                                       completed={this.props.appraisal.validationResult.hasLotSize}
                        />
                        <ChecklistItem title={"Zoning"}
                                       description={"Has the city zoning information for the building."}
                                       completed={this.props.appraisal.validationResult.hasZoning}
                        />
                    </ChecklistGroup>
                    <ChecklistGroup title={"Rent Roll"}
                                   description={""}
                                   completed={this.props.appraisal.validationResult.hasRentRoll}
                                   fileNames={this.getFileNames(["RENT_ROLL"])}
                    >
                        <ChecklistItem title={"Tenant Name"}
                                       description={"The names of tenants for all occupied units."}
                                       completed={this.props.appraisal.validationResult.hasTenantNames}
                        />
                        <ChecklistItem title={"Unit Size"}
                                       description={"The size in square feet for all units"}
                                       completed={this.props.appraisal.validationResult.hasUnitSizes}
                        />
                        <ChecklistItem title={"Current Rent"}
                                       description={"Yearly rent for all occupied units"}
                                       completed={this.props.appraisal.validationResult.hasRents}
                        />
                        <ChecklistItem title={"Escalations"}
                                       description={"Escalations on rents where appropriate."}
                                       completed={this.props.appraisal.validationResult.hasEscalations}
                        />
                        <ChecklistItem title={"Term"}
                                       description={"Has lease start and end dates for all occupied units."}
                                       completed={this.props.appraisal.validationResult.hasLeaseTerms}
                        />
                    </ChecklistGroup>
                    <ChecklistGroup title={"Financial Information"}
                                   description={""}
                                   completed={this.props.appraisal.validationResult.hasFinancialInfo}
                                   fileNames={this.getFileNames(["INCOME_STATEMENT", "EXPENSE_STATEMENT"])}
                     >

                        <ChecklistItem title={"Expenses"}
                                       description={"The operating expenses for the building"}
                                       completed={this.props.appraisal.validationResult.hasExpenses}
                        />
                        <ChecklistItem title={"Realty Taxes"}
                                       description={"The tax bill for this building"}
                                       completed={this.props.appraisal.validationResult.hasTaxes}
                        />
                        <ChecklistItem title={"Additional Income"}
                                       description={"Non-rent Income like signage, parking, etc."}
                                       completed={this.props.appraisal.validationResult.hasAdditionalIncome}
                        />
                        <ChecklistItem title={"Amortization"}
                                       description={"Any capital expenditures being amortized and recovered."}
                                       completed={this.props.appraisal.validationResult.hasAmortizations}
                        />
                    </ChecklistGroup>
                </div>
                : null
        );
    }
}

export default Checklist;
