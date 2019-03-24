import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';

class ComparableSaleListItem extends React.Component
{
    state = {
        comparableSale: {}
    };

    componentDidMount()
    {
        this.setState({
            comparableSale: _.clone(this.props.comparableSale)
        })
    }



    changeComparableFile(field, newValue)
    {
        const comparable = this.state.comparableSale;

        comparable[field] = newValue;

        this.props.onChange(comparable);
    }



    render()
    {
        const comparableSale = this.props.comparableSale;

        return (
            <div className="card b">
                <div className="card-body comparable-sale-list-item">
                    <div className="row">
                        <div className="col-xl-4 text-center mb-3 building-image">
                            <a href="">
                                <img className="img-fluid img-thumbnail" src="/img/no_building_image.png" alt="Demo"/>
                            </a>
                            <div className={"upload-image-overlay"} />
                            <div className={"upload-image-icon"}>
                                <i className={"fa fa-upload"} />
                            </div>
                        </div>
                        <div className="col-xl-8">
                            <FieldDisplayEdit
                                type={"text"}
                                placeholder={"Name..."}
                                className={"comparable-name"}
                                value={comparableSale.name}
                                onChange={(newValue) => this.changeComparableFile('name', newValue)}
                            />
                            <div className={"comparable-fields-area"}>
                                <span className={"comparable-field-label"}>NOI: </span>

                                <FieldDisplayEdit
                                    type={"currency"}
                                    placeholder={"Net Operating Income"}
                                    value={comparableSale.netOperatingIncome}
                                    onChange={(newValue) => this.changeComparableFile('netOperatingIncome', newValue)}
                                />
                                <span className={"comparable-field-label"}>Cap Rate:</span>

                                <FieldDisplayEdit
                                    type={"number"}
                                    placeholder={"Capitalization Rate"}
                                    value={comparableSale.capitalizationRate}
                                    onChange={(newValue) => this.changeComparableFile('capitalizationRate', newValue)}
                                />
                                <span className={"comparable-field-label"}>Description:</span>

                                <FieldDisplayEdit
                                    type={"textbox"}
                                    placeholder={"Description..."}
                                    value={comparableSale.description}
                                    onChange={(newValue) => this.changeComparableFile('description', newValue)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}


export default ComparableSaleListItem;