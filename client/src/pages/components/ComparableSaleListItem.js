import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";
import _ from 'underscore';
import axios from "axios/index";

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

    saveComparable(updatedComparable)
    {
        axios.post(`/comparable_sales/` + this.state.comparableSale._id['$oid'], updatedComparable).then((response) => {
            // console.log(response.data.comparableSales);
            // this.setState({comparableSales: response.data.comparableSales})
        });
    }

    createNewComparable(newComparable)
    {
        axios.post(`/comparable_sales`, newComparable).then((response) =>
        {
            const comparable = this.state.comparableSale;
            comparable["_id"] = {"$oid": response.data._id};
            this.props.onChange(comparable);
        });
    }


    changeComparableFile(field, newValue)
    {
        const comparable = this.state.comparableSale;

        comparable[field] = newValue;

        if (this.state.comparableSale._id)
        {
            this.saveComparable(comparable);
            this.props.onChange(comparable);
        }
        else
        {
            this.createNewComparable(comparable);
        }
    }


    deleteComparable()
    {
        this.props.onDeleteComparable(this.state.comparableSale);

        axios.delete(`/comparable_sales/` + this.state.comparableSale._id['$oid']).then((response) => {
            // console.log(response.data.comparableSales);
            // this.setState({comparableSales: response.data.comparableSales})
        });
    }


    render()
    {
        const comparableSale = this.state.comparableSale;
        return (
            <div className="card b">
                <div className="card-body comparable-sale-list-item">
                    {
                        this.props.onAddComparableClicked ?
                            <div className={`comparable-button-column left`}>
                                <Button color={"primary"} onClick={(evt) => this.props.onAddComparableClicked(comparableSale)} className={"move-comparable-button"}>
                                    <i className={"fa fa-angle-double-left"} />
                                </Button>
                                <Button color={"danger"} onClick={(evt) => this.deleteComparable()} className={"delete-comparable-button"}>
                                    <i className={"fa fa-times"} />
                                </Button>
                            </div> : null
                    }
                    <div className={`building-image`}>
                        <a href="">
                            <img className="img-fluid img-thumbnail" src="/img/no_building_image.png" alt="Demo"/>
                        </a>
                        <div className={"upload-image-overlay"} />
                        <div className={"upload-image-icon"}>
                            <i className={"fa fa-upload"} />
                        </div>
                    </div>
                    <div className={`comparable-sale-content`}>
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
                    {
                        this.props.onRemoveComparableClicked ?
                            <div className={`comparable-button-column right`}>
                                <Button color={"primary"} onClick={(evt) => this.props.onRemoveComparableClicked(comparableSale)} className={"move-comparable-button"}>
                                    <i className={"fa fa-angle-double-right"} />
                                </Button>
                            </div> : null
                    }
                </div>
            </div>

        );
    }
}


export default ComparableSaleListItem;