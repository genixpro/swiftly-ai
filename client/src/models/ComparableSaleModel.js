import IdField from "./IdField";
import GenericField from "./GenericField";
import ListField from "./ListField";
import EquationMdoel from "./EquationModel";
import DateField from "./DateField";
import _ from "underscore";

class ComparableSaleModel extends EquationMdoel
{
    static _id = new IdField();

    static imageUrl = new GenericField();
    static comparableName = new GenericField("name");
    static address = new GenericField();
    static location = new GenericField();
    static propertyType = new GenericField();

    static netOperatingIncome = new GenericField();
    static capitalizationRate = new GenericField();
    static salePrice = new GenericField();
    static sizeSquareFootage = new GenericField();
    static pricePerSquareFoot = new GenericField();
    static occupancyRate = new GenericField();
    static saleDate = new DateField();
    static propertyTags = new ListField(new GenericField());
    static purchaser = new GenericField();

    static vendor = new GenericField();

    static tenants = new GenericField();

    static additionalInfo = new GenericField();
    static constructionDate = new DateField();

    static siteArea = new GenericField();

    static parking = new GenericField();

    static description = new GenericField();

    static clearCeilingHeight = new GenericField();
    static shippingDoors = new GenericField();
    static siteCoverage = new GenericField();


    static zoning = new GenericField();
    static developmentProposals = new GenericField();
    static sizeOfLandSqft = new GenericField();
    static sizeOfLandAcres = new GenericField();
    static sizeOfBuildableAreaSqft = new GenericField();
    static sizeOfBuildableAreaAcres = new GenericField();
    static pricePerSquareFootLand = new GenericField();
    static pricePerAcreLand = new GenericField();
    static pricePerSquareFootBuildableArea = new GenericField();
    static pricePerAcreBuildableArea = new GenericField();
    static floorSpaceIndex = new GenericField();
    static finishedOfficePercent = new GenericField();

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
}

export default ComparableSaleModel;
