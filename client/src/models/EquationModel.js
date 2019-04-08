import IdField from "./IdField";
import GenericField from "./GenericField";
import ModelField from "./ModelField";
import ListField from "./ListField";
import BaseModel from "./BaseModel";
import DateField from "./DateField";
import BaseField from "./BaseField";
import _ from 'underscore';


class EquationModel extends BaseModel
{
    static calculatedValue = Symbol("calculatedValue");

    calculateMissingNumbers()
    {
        try
        {
            const modelClass = this.constructor;

            const equations = modelClass.equations;

            if (!this[EquationModel.calculatedValue])
            {
                this[EquationModel.calculatedValue] = {};
            }

            const calculatedValue = this[EquationModel.calculatedValue];

            Object.keys(equations).forEach((fieldName) =>
            {
                const fieldEquations = equations[fieldName];
                if ( _.isNull(this[fieldName]) || _.isUndefined(this[fieldName]) || calculatedValue[fieldName] === this[fieldName])
                {
                    fieldEquations.forEach((equation) =>
                    {
                        if (_.every(equation.inputs, (input) => _.isNumber(this[input])))
                        {
                            this[fieldName] = equation.equation.apply(this, equation.inputs.map((inputField) => Number(this[inputField]) ));
                            calculatedValue[fieldName] = this[fieldName];
                        }
                    });
                }
            });
        }
        catch(err)
        {
            console.log("Error loading BaseModel subclass fields.");
            console.log(err);
        }
    }
}


export default EquationModel;
