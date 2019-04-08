import IdField from "./IdField";
import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import EquationMdoel from "./EquationModel";
import DateField from "./DateField";

class ComparableSaleModel extends EquationMdoel
{
    static _id = new IdField();
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
        ]
    };
}

export default ComparableSaleModel;
