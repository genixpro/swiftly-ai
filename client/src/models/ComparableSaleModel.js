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
    static _id = new IdField();

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

    static vendor = new StringField();

    static tenants = new StringField();

    static additionalInfo = new StringField();
    static constructionDate = new DateField();

    static siteArea = new FloatField();

    static parking = new StringField();

    static description = new StringField();

    static clearCeilingHeight = new FloatField();
    static shippingDoors = new FloatField();
    static siteCoverage = new FloatField();


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
