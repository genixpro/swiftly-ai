import BaseModel from "../orm/BaseModel";
import StringField from "../orm/StringField";
import FloatField from "../orm/FloatField";
import ListField from "../orm/ListField";
import DictField from "../orm/DictField";
import ModelField from "../orm/ModelField";
import BoolField from "../orm/BoolField";


class ComparableAdjustmentModel extends BaseModel
{
    static adjustmentName = new StringField("name");

    static adjustmentType = new StringField();

    static adjustmentPercentages = new DictField(new FloatField());

    static adjustmentAmounts = new DictField(new FloatField());

    static adjustmentTexts = new DictField(new StringField());
}

class ComparableAdjustmentChartModel extends BaseModel
{
    static adjustments = new ListField(new ModelField(ComparableAdjustmentModel));

    static showAdjustmentChart = new BoolField();
}

export default ComparableAdjustmentChartModel;

export {ComparableAdjustmentModel, ComparableAdjustmentChartModel}