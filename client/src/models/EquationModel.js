import BaseModel from "../orm/BaseModel";
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

            let didCalculate = true;
            const limit = 10;
            let rounds = 0;

            while(didCalculate && rounds < limit)
            {
                didCalculate = false;
                Object.keys(equations).forEach((fieldName) =>
                {
                    const fieldEquations = equations[fieldName];
                    if ( _.isNull(this[fieldName]) || _.isUndefined(this[fieldName]) || calculatedValue[fieldName] === this[fieldName])
                    {
                        fieldEquations.forEach((equation) =>
                        {
                            if (_.every(equation.inputs, (input) => _.isNumber(this[input])))
                            {
                                const newValue = equation.equation.apply(this, equation.inputs.map((inputField) => Number(this[inputField]) ));
                                if (newValue !== this[fieldName])
                                {
                                    this[fieldName] = newValue
                                    didCalculate = true;
                                    calculatedValue[fieldName] = this[fieldName];
                                }
                            }
                        });
                    }
                });

                rounds += 1;
            }
        }
        catch(err)
        {
            console.log("Error loading BaseModel subclass fields.");
            console.log(err);
        }
    }
}


export default EquationModel;
