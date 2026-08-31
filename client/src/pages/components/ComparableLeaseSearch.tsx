import React from 'react';
import {Row, Col, Card, CardBody} from 'reactstrap';
import FieldDisplayEdit from "./FieldDisplayEdit";

type SearchFields = Record<string, unknown>;

interface ComparableLeaseSearchProps {
    defaultSearch: SearchFields;
    onChange?(search: SearchFields): void;
}

function ComparableLeaseSearch(props: ComparableLeaseSearchProps)
{
    const [search, setSearch] = React.useState<SearchFields>({});
    const [, setRenderVersion] = React.useState(0);

    // This remains mount-only like componentDidMount: parent updates have
    // never reset a search in progress.
    React.useEffect(() => {
        setSearch(props.defaultSearch);
    // The dependency list intentionally mirrors componentDidMount.
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function changeSearchField(field: string, value: unknown)
    {
        if (value === null || value === "")
        {
            if (search[field] !== undefined)
            {
                delete search[field];
            }
        }
        else
        {
            search[field] = value;
        }
        // The class version mutated this same object and still rendered. Keep
        // that object identity for consumers while explicitly requesting the
        // equivalent rerender from hooks.
        setRenderVersion((version) => version + 1);

        if (props.onChange)
        {
            props.onChange(search);
        }
    }

    return (
            <Row>
                <Col xs={12}>
                    <Card className="card-default">
                        <CardBody>
                            <Row>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Lease Date Start:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"date"}
                                                    value={search.leaseDateFrom}
                                                    onChange={(newValue) => changeSearchField("leaseDateFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Lease Date End:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"date"}
                                                    value={search.leaseDateTo}
                                                    onChange={(newValue) => changeSearchField("leaseDateTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Property Type:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"propertyType"}
                                                    value={search.propertyType}
                                                    onChange={(newValue) => changeSearchField("propertyType", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Tenancy Is:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"tenancyType"}
                                                    value={search.tenancyType}
                                                    onChange={(newValue) => changeSearchField("tenancyType", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Sub Type:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"tags"}
                                                    propertyType={search.propertyType as string | null | undefined}
                                                    value={search.propertyTags}
                                                    onChange={(newValue) => changeSearchField("propertyTags", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                    </table>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Size of Unit Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"area"}
                                                    value={search.sizeOfUnitFrom}
                                                    onChange={(newValue) => changeSearchField("sizeOfUnitFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Size of Unit High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"area"}
                                                    value={search.sizeOfUnitTo}
                                                    onChange={(newValue) => changeSearchField("sizeOfUnitTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Net / Gross:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"rentType"}
                                                    value={search.rentType}
                                                    onChange={(newValue) => changeSearchField("rentType", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Tenant Name:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"tenantName"}
                                                    value={search.tenantName}
                                                    onChange={(newValue) => changeSearchField("tenantName", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                    </table>
                                </Col>
                                <Col xs={12} sm={6} md={4}>
                                    <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            <strong>Yearly Rent Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={search.yearlyRentFrom}
                                                    onChange={(newValue) => changeSearchField("yearlyRentFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Yearly Rent High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={search.yearlyRentTo}
                                                    onChange={(newValue) => changeSearchField("yearlyRentTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>TMI Low:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={search.taxesMaintenanceInsuranceFrom}
                                                    onChange={(newValue) => changeSearchField("taxesMaintenanceInsuranceFrom", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}
                                                />
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>TMI High:</strong>
                                        </td>
                                        <td>
                                            {
                                                <FieldDisplayEdit
                                                    isSearch={true}
                                                    type={"currency"}
                                                    value={search.taxesMaintenanceInsuranceTo}
                                                    onChange={(newValue) => changeSearchField("taxesMaintenanceInsuranceTo", newValue)}
                                                    hideInput={false}
                                                    hideIcon={true}

                                                />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                    </table>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
    );
}


export default ComparableLeaseSearch;
