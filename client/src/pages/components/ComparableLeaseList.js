import React from 'react';
import ComparableLeaseListItem from './ComparableLeaseListItem';
import {Row, Col, CardHeader, CardTitle} from 'reactstrap';
import Promise from 'bluebird';
import axios from "axios/index";
import ComparableLeasesStatistics from "./ComparableLeasesStatistics";
import ComparableLeaseModel from "../../models/ComparableLeaseModel";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SortDirection from "./SortDirection";
import PropTypes from "prop-types";
import _ from "underscore";


class ComparableLeaseListHeaderColumn extends React.Component
{
    static propTypes = {
        size: PropTypes.number.isRequired,
        texts: PropTypes.arrayOf(PropTypes.string).isRequired,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        sort: PropTypes.object.isRequired,
        sortField: PropTypes.string.isRequired,
        changeSortColumn: PropTypes.func.isRequired
    };

    render()
    {
        const colProps = {};
        let colClass = "";

        if (_.isNumber(this.props.size))
        {
            colProps['xs'] = this.props.size;
        }
        else if(this.props.size === 'middle')
        {
            colClass = "middle-col"
        }

        return <Col className={`header-field-column ${colClass}`} {...colProps} onClick={() => this.props.changeSortColumn(this.props.fields[0])}>

            {
                this.props.fields.map((field, fieldIndex) =>
                {
                    return <span>
                            {this.props.texts[fieldIndex]}
                        {fieldIndex === 0 ? <SortDirection field={this.props.sortField} sort={this.props.sort} /> : null}
                        {fieldIndex !== this.props.fields.length - 1 ? <br /> : null}
                    </span>
                })
            }

        </Col>
    }
}

class ComparableLeaseList extends React.Component
{
    static defaultProps = {
        "noCompMessage": "There are no comparables. Please add a new one or change your search settings.",
        statsPosition: "above"
    };

    state = {
        comparableLeases: [],
        newComparableLease: ComparableLeaseModel.create({
            rentType: "net"
        }),
        isCreatingNewItem: false
    };

    loadedComparables = {};


    componentDidMount()
    {
        this.updateComparables();
    }


    componentDidUpdate()
    {
        this.updateComparables();
    }

    defaultHeaderFields()
    {
        const headerFields = [
            ["leaseDate"],
            ["address"],
            ["sizeOfUnit"],
            ["rentEscalations"],
            ["taxesMaintenanceInsurance", "tenantInducements", "freeRent"],
        ];

        return headerFields;
    }

    defaultStatsFields()
    {
        const statFields = ['sizeOfUnit', 'startingYearlyRent', 'taxesMaintenanceInsurance'];

        return statFields;
    }


    updateComparables()
    {
        if (this.props.comparableLeases)
        {
            if (this.props.comparableLeases !== this.state.comparableLeases)
            {
                // this.setState({comparableLeases: _.filter(this.props.comparableLeases, (sale) => excludeIds.indexOf(sale._id['$oid]']) !== -1 )});
                this.setState({comparableLeases: this.props.comparableLeases});
            }
        }
        else if (this.props.comparableLeaseIds)
        {
            if (this.props.comparableLeaseIds !== this.state.comparableLeaseIds)
            {
                this.setState({comparableLeaseIds: this.props.comparableLeaseIds});

                Promise.map(this.props.comparableLeaseIds, (comparableLeaseId) =>
                {
                    if (this.loadedComparables[comparableLeaseId])
                    {
                        return this.loadedComparables[comparableLeaseId];
                    }
                    else
                    {
                        // alert('loading');
                        return axios.get(`/comparable_leases/` + comparableLeaseId).then((response) =>
                        {
                            this.loadedComparables[comparableLeaseId] = ComparableLeaseModel.create(response.data.comparableLease);
                            return response.data.comparableLease;
                        });
                    }
                }).then((comparableLeases) =>
                {
                    this.setState({comparableLeases: comparableLeases})
                })
            }
        }
    }

    toggleNewItem()
    {
        this.setState({isCreatingNewItem: false});
    }


    addNewComparable(newComparable)
    {
        axios.post(`/comparable_leases`, newComparable).then((response) =>
        {
            newComparable["_id"] = response.data._id;
            newComparable[ComparableLeaseListItem._newLease] = true;

            this.props.onNewComparable(newComparable);
            this.setState({isCreatingNewItem: false, newComparableLease: ComparableLeaseModel.create({})})
        });
    }

    updateComparable(changedComp, index)
    {
        const comparables = this.state.comparableLeases;
        comparables[index] = changedComp;
        if (this.props.onChange)
        {
            this.props.onChange(comparables);
        }
    }


    onRemoveComparableClicked(comparable)
    {
        const comparables = this.state.comparableLeases;

        for (let i = 0; i < this.state.comparableLeases.length; i += 1)
        {
            if (this.state.comparableLeases[i]._id === comparable._id)
            {
                comparables.splice(i, 1);
                break;
            }
        }

        if (this.props.onChange)
        {
            this.props.onChange(comparables);
        }
    }


    toggleCreateNewItem()
    {
        this.setState({isCreatingNewItem: true})
    }


    renderNewItemRow()
    {
        return <div className="card b new-comparable" onClick={() => this.toggleCreateNewItem()}>
            <div className="card-body">
                <span>Create new comparable...</span>
            </div>
        </div>
    }

    changeSortColumn(field)
    {
        let newSort = "";
        if (("+" + field) === this.props.sort)
        {
            newSort = "-" + field;
        }
        else if (("-" + field) === this.props.sort)
        {
            newSort = "+" + field;
        }
        else
        {
            newSort = "-" + field;
        }

        if (this.props.onSortChanged)
        {
            this.props.onSortChanged(newSort);
        }

        this.setState({sort: newSort});
    }

    render()
    {
        let excludeIds = this.props.excludeIds;
        if (!excludeIds)
        {
            excludeIds = [];
        }

        let firstSpacing = '';
        if (this.props.onRemoveComparableClicked)
        {
            firstSpacing = 'first-spacing';
        }

        const headerConfigurations = {
            leaseDate: {
                title: "Date",
                size: 2
            },
            address: {
                title: "Address",
                size: 4
            },
            sizeOfUnit: {
                title: "Size (sqft)",
                size: 2
            },
            rentEscalations: {
                title: "Rent ($)",
                sortField: "rentEscalations[0].yearlyRent",
                size: 2
            },
            taxesMaintenanceInsurance: {
                title: "TMI ($)",
                size: 2
            },
            tenantInducements: {
                title: "Inducements",
                size: 2
            },
            freeRent: {
                title: "freeRent",
                size: 2
            }
        };

        const headerFields = this.props.headers || this.defaultHeaderFields();

        headerFields.forEach((headerFieldList) =>
        {
            headerFieldList.forEach((field) =>
            {
                if (!headerConfigurations[field])
                {
                    const message = `Error! No header configuration for ${field}`;
                    console.error(message);

                    if (process.env.VALUATE_ENVIRONMENT.REACT_APP_DEBUG)
                    {
                        alert(message);
                    }
                }
            })
        });

        const statsFields = this.props.stats || this.defaultStatsFields();

        return (
            <div>
                {
                    this.props.statsPosition === "above" ?
                        <ComparableLeasesStatistics comparableLeases={this.state.comparableLeases} title={this.props.statsTitle} stats={statsFields} />
                        : null
                }
                {
                    <div className={`card b comparable-lease-list-header`}>
                        <CardHeader className={`comparable-lease-list-item-header ${firstSpacing}`}>
                            <CardTitle>
                                <Row>
                                    {
                                        headerFields.map((headerFieldList) =>
                                        {
                                            return <ComparableLeaseListHeaderColumn
                                                size={headerConfigurations[headerFieldList[0]].size}
                                                texts={headerFieldList.map((field) => headerConfigurations[field].title)}
                                                fields={headerFieldList}
                                                sortField={headerConfigurations[headerFieldList[0]].sortField || headerFieldList[0]}
                                                sort={this.props.sort}
                                                comparableLease={this.props.comparableLease}
                                                changeSortColumn={this.changeSortColumn.bind(this)}
                                            />
                                        })
                                    }
                                </Row>
                            </CardTitle>
                        </CardHeader>
                    </div>
                }
                {
                    this.props.allowNew ?
                        <div>
                            {this.renderNewItemRow()}
                            <Modal isOpen={this.state.isCreatingNewItem} toggle={this.toggleNewItem.bind(this)} className={"new-comp-dialog"}>
                                        <ModalHeader toggle={this.toggleNewItem.bind(this)}>New Comparable Lease</ModalHeader>
                                        <ModalBody>
                                            <ComparableLeaseListItem comparableLease={this.state.newComparableLease}
                                                                     openByDefault={true}
                                                onChange={(comp) => this.setState({newComparableLease: comp})}/>
                                        </ModalBody>
                                        <ModalFooter>
                                        <Button color="primary" onClick={() => this.addNewComparable(this.state.newComparableLease)}>Save</Button>{' '}
                                        <Button color="primary" onClick={() => this.toggleNewItem.bind(this)}>Cancel</Button>{' '}
                                </ModalFooter>
                            </Modal>
                        </div> : null
                }
                {
                    this.state.comparableLeases.map((comparableLease, index) =>
                    {
                        if (excludeIds.indexOf(comparableLease._id) === -1)
                        {
                            return <ComparableLeaseListItem
                                headers={headerFields}
                                key={comparableLease._id}
                                comparableLease={comparableLease}
                                history={this.props.history}
                                onChange={(comp) => this.updateComparable(comp, index)}
                                appraisalComparables={this.props.appraisalComparables}
                                onAddComparableClicked={this.props.onAddComparableClicked}
                                onRemoveComparableClicked={this.props.onRemoveComparableClicked}
                                onDeleteComparable={(comp) => this.onRemoveComparableClicked(comp)}
                                appraisalId={this.props.appraisalId}
                                last={index===this.state.comparableLeases.length-1}
                            />;
                        }
                        else
                        {
                            return null;
                        }
                    })
                }
                <div>
                    {
                        this.state.comparableLeases.length === 0 ? <div className="card b no-comparables-found">
                            <div className="card-body">
                                <span>{this.props.noCompMessage}</span>
                            </div>
                        </div> : null
                    }
                </div>
                {
                    this.props.statsPosition === "below" ? <div><br/>
                        <ComparableLeasesStatistics comparableLeases={this.state.comparableLeases} title={this.props.statsTitle} stats={statsFields} />
                    </div> : null
                }
            </div>
        );
    }
}


export default ComparableLeaseList;
