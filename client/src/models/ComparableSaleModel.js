import IdField from "../orm/IdField";
import GenericField from "../orm/GenericField";
import ListField from "../orm/ListField";
import EquationMdoel from "./EquationModel";
import DateField from "../orm/DateField";
import _ from "underscore";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";

class ComparableSaleModel extends EquationMdoel
{
    constructor()
    {
        super(...arguments);

        this.calculateMissingNumbers();
    }

    static _id = new IdField();

    static owner = new StringField();

    static imageUrl = new StringField();
    static address = new StringField();
    static location = new GenericField();
    static propertyType = new StringField();

    static netOperatingIncome = new FloatField();
    static capitalizationRate = new FloatField();
    static salePrice = new FloatField();
    static sizeSquareFootage = new FloatField();
    static pricePerSquareFoot = new FloatField();
    static occupancyRate = new FloatField();
    static saleDate = new DateField();
    static propertyTags = new ListField(new StringField());
    static purchaser = new StringField();

    static netOperatingIncomePSF = new FloatField();
    static noiPSFMultiple = new FloatField();

    static vendor = new StringField();

    static tenants = new StringField();

    static additionalInfo = new StringField();
    static constructionDate = new DateField();

    static siteArea = new StringField();

    static parking = new StringField();

    static description = new StringField();

    static clearCeilingHeight = new FloatField();
    static shippingDoors = new FloatField();
    static siteCoverage = new FloatField();

    static buildableUnits = new FloatField();

    static zoning = new StringField();
    static developmentProposals = new StringField();
    static sizeOfLandSqft = new FloatField();
    static sizeOfLandAcres = new FloatField();
    static sizeOfBuildableAreaSqft = new FloatField();
    static sizeOfBuildableAreaAcres = new FloatField();
    static pricePerSquareFootLand = new FloatField();
    static pricePerAcreLand = new FloatField();
    static pricePerSquareFootBuildableArea = new FloatField();
    static pricePerAcreBuildableArea = new FloatField();
    static floorSpaceIndex = new FloatField();
    static finishedOfficePercent = new FloatField();

    static numberOfUnits = new FloatField();
    static averageMonthlyRentPerUnit = new FloatField();
    static noiPerUnit = new FloatField();
    static noiPerBedroom = new FloatField();

    static pricePerBedroom = new FloatField("pricePerBedroom");
    static numberOfBachelors = new FloatField("numberOfBachelors", 0);
    static numberOfOneBedrooms = new FloatField("numberOfOneBedrooms", 0);
    static numberOfTwoBedrooms = new FloatField("numberOfTwoBedrooms", 0);
    static numberOfThreePlusBedrooms = new FloatField("numberOfThreePlusBedrooms", 0);
    static totalBedrooms = new FloatField("totalBedrooms");

    static equations = {
        "netOperatingIncome": [
            {
                inputs: ['salePrice', 'capitalizationRate'],
                equation: (salePrice, capitalizationRate) => salePrice * (capitalizationRate/100)
            }
        ],
        "salePrice": [
            {
                inputs: ['netOperatingIncome', 'capitalizationRate'],
                equation: (netOperatingIncome, capitalizationRate) => netOperatingIncome / (capitalizationRate/100)
            },
            {
                inputs: ['sizeSquareFootage', 'pricePerSquareFoot'],
                equation: (sizeSquareFootage, pricePerSquareFoot) => sizeSquareFootage * pricePerSquareFoot
            }
        ],
        "capitalizationRate": [
            {
                inputs: ['salePrice', 'netOperatingIncome'],
                equation: (salePrice, netOperatingIncome) => (salePrice / netOperatingIncome) * 100
            }
        ],
        "sizeSquareFootage": [
            {
                inputs: ['salePrice', 'pricePerSquareFoot'],
                equation: (salePrice, pricePerSquareFoot) => salePrice / pricePerSquareFoot
            }
        ],
        "pricePerSquareFoot": [
            {
                inputs: ['salePrice', 'sizeSquareFootage'],
                equation: (salePrice, sizeSquareFootage) => salePrice / sizeSquareFootage
            }
        ],
        "sizeOfLandSqft": [
            {
                inputs: ['sizeOfLandAcres'],
                equation: (sizeOfLandAcres) => sizeOfLandAcres * 43560.0
            }
        ],
        "sizeOfLandAcres": [
            {
                inputs: ['sizeOfLandSqft'],
                equation: (sizeOfLandSqft) => sizeOfLandSqft / 43560.0
            }
        ],
        "sizeOfBuildableAreaSqft": [
            {
                inputs: ['sizeOfBuildableAreaAcres'],
                equation: (sizeOfBuildableAreaAcres) => sizeOfBuildableAreaAcres * 43560.0
            }
        ],
        "sizeOfBuildableAreaAcres": [
            {
                inputs: ['sizeOfBuildableAreaSqft'],
                equation: (sizeOfBuildableAreaSqft) => sizeOfBuildableAreaSqft / 43560.0
            }
        ],
        "pricePerSquareFootLand": [
            {
                inputs: ['pricePerAcreLand'],
                equation: (pricePerAcreLand) => pricePerAcreLand / 43560.0
            },
            {
                inputs: ['salePrice', 'sizeOfLandSqft'],
                equation: (salePrice, sizeOfLandSqft) => salePrice / sizeOfLandSqft
            }
        ],
        "pricePerAcreLand": [
            {
                inputs: ['pricePerSquareFootLand'],
                equation: (pricePerSquareFootLand) => pricePerSquareFootLand * 43560.0
            },
            {
                inputs: ['salePrice', 'sizeOfLandAcres'],
                equation: (salePrice, sizeOfLandAcres) => salePrice / sizeOfLandAcres
            }
        ],
        "pricePerSquareFootBuildableArea": [
            {
                inputs: ['pricePerAcreBuildableArea'],
                equation: (pricePerAcreBuildableArea) => pricePerAcreBuildableArea / 43560.0
            },
            {
                inputs: ['salePrice', 'sizeOfBuildableAreaSqft'],
                equation: (salePrice, sizeOfBuildableAreaSqft) => salePrice / sizeOfBuildableAreaSqft
            }
        ],
        "pricePerAcreBuildableArea": [
            {
                inputs: ['pricePerSquareFootBuildableArea'],
                equation: (pricePerSquareFootBuildableArea) => pricePerSquareFootBuildableArea * 43560.0
            },
            {
                inputs: ['salePrice', 'sizeOfBuildableAreaAcres'],
                equation: (salePrice, sizeOfBuildableAreaAcres) => salePrice / sizeOfBuildableAreaAcres
            }
        ],
        "floorSpaceIndex": [
            {
                inputs: ['sizeOfBuildableAreaSqft', 'sizeOfLandSqft'],
                equation: (sizeOfBuildableAreaSqft, sizeOfLandSqft) => sizeOfBuildableAreaSqft / sizeOfLandSqft
            }
        ],
        "pricePerBuildableUnit": [
            {
                inputs: ['salePrice', 'buildableUnits'],
                equation: (salePrice, buildableUnits) => salePrice / buildableUnits
            }
        ],
        "netOperatingIncomePSF": [
            {
                inputs: ['netOperatingIncome', 'sizeSquareFootage'],
                equation: (netOperatingIncome, sizeSquareFootage) => netOperatingIncome / sizeSquareFootage
            }
        ],
        "noiPSFMultiple": [
            {
                inputs: ['netOperatingIncomePSF', 'pricePerSquareFoot'],
                equation: (netOperatingIncomePSF, pricePerSquareFoot) => pricePerSquareFoot / netOperatingIncomePSF
            }
        ],
        "noiPerUnit": [
            {
                inputs: ['netOperatingIncome', 'numberOfUnits'],
                equation: (netOperatingIncome, numberOfUnits) => netOperatingIncome / numberOfUnits
            }
        ],
        "totalBedrooms": [
            {
                inputs: ['numberOfBachelors', 'numberOfOneBedrooms', 'numberOfTwoBedrooms', 'numberOfThreePlusBedrooms'],
                equation: (numberOfBachelors, numberOfOneBedrooms, numberOfTwoBedrooms, numberOfThreePlusBedrooms) => numberOfBachelors + numberOfOneBedrooms + numberOfTwoBedrooms + numberOfThreePlusBedrooms
            }
        ],
        "pricePerBedroom": [
            {
                inputs: ['totalBedrooms', 'salePrice'],
                equation: (totalBedrooms, salePrice) => totalBedrooms ? salePrice / totalBedrooms : 0
            }
        ],
        "noiPerBedroom": [
            {
                inputs: ['netOperatingIncome', 'totalBedrooms'],
                equation: (netOperatingIncome, totalBedrooms) => totalBedrooms ? netOperatingIncome / totalBedrooms : 0
            }
        ]
    };

    static sortComparables(comparables, sort)
    {
        if (sort)
        {
            const field = sort.substr(1);
            const direction = sort.substr(0, 1);

            const sorted = _.sortBy(comparables, (comp) => comp[field]);

            if (direction === "-")
            {
                return sorted.reverse();
            }
            else
            {
                return sorted;
            }
        }
        return comparables;
    }

    get computedDescriptionText()
    {
        const comparableSale = this;

        if (comparableSale.description)
        {
            return comparableSale.description;
        }

        let text = '';

        if (comparableSale.saleDate && comparableSale.propertyType && comparableSale.address)
        {
            text += `In reference to the ${comparableSale.saleDate.getFullYear()}/${comparableSale.saleDate.getMonth() + 1}/${comparableSale.saleDate.getDate()} sale of a ${comparableSale.propertyType} building located at ${comparableSale.address}. `;
        }

        if (comparableSale.sizeSquareFootage)
        {
            text += `The building has gross rentable area of ${comparableSale.sizeSquareFootage}. `;
        }


        if(comparableSale.vendor && comparableSale.purchaser && comparableSale.salePrice)
        {
            text += `The property was sold by ${comparableSale.vendor} and was acquired by ${comparableSale.purchaser} for a consideration of $${comparableSale.salePrice}. `;
        }

        if(comparableSale.description)
        {
            text += comparableSale.description;
        }

        if(comparableSale.tenants)
        {
            text += `The property is leased to ${comparableSale.tenants}. `;
        }

        if(comparableSale.capitalizationRate)
        {
            text += `The net income of ${comparableSale.netOperatingIncome} yielded a ${comparableSale.capitalizationRate}% rate of return. `;
        }

        return text;
    }

    set computedDescriptionText(newValue)
    {
        this.description = newValue;
    }
}

export default ComparableSaleModel;
