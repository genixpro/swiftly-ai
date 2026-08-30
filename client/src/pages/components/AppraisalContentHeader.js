import React from 'react';
import { Link } from 'react-router-dom';


class AppraisalContentHeader extends React.Component
{
    render() {
        return (
            <div className="content-heading">
                {this.props.appraisal ?
                <div>{this.props.appraisal.name} - {this.props.appraisal.address} - {this.props.title}
                    <ol className="breadcrumb breadcrumb px-0 pb-0">
                        <li className="breadcrumb-item"><Link to="/appraisals/">Home</Link></li>
                        <li className="breadcrumb-item"><Link to="/appraisals/">Appraisals</Link></li>
                        <li className="breadcrumb-item"><Link
                            to={"/appraisal/" + this.props.appraisal._id + "/upload"}>{this.props.appraisal.name}</Link>
                        </li>
                        <li className="breadcrumb-item active">{this.props.title}</li>
                    </ol>
                </div> : null}
            </div>
        );
    }
}


export default AppraisalContentHeader;
