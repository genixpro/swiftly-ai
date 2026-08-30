import React from 'react';
import { Link } from 'react-router-dom';


class AppraisalContentHeader extends React.Component
{
    componentDidMount() {
        this.updatePageContext(true);
    }

    componentDidUpdate(previousProps) {
        if (previousProps.title !== this.props.title || previousProps.appraisal !== this.props.appraisal) {
            this.updatePageContext(previousProps.title !== this.props.title);
        }
    }

    updatePageContext(shouldFocus) {
        if (!this.props.appraisal) return;
        document.title = `${this.props.title} – ${this.props.appraisal.name} – Swiftly`;
        if (shouldFocus && this.heading) this.heading.focus();
    }

    render() {
        return (
            <div className="content-heading">
                {this.props.appraisal ?
                <div>
                    <h1 className="page-title" tabIndex="-1" ref={(heading) => this.heading = heading}>
                        {this.props.appraisal.name} - {this.props.appraisal.address} - {this.props.title}
                    </h1>
                    <ol className="breadcrumb breadcrumb px-0 pb-0" aria-label="Breadcrumb">
                        <li className="breadcrumb-item"><Link to="/appraisals/">Home</Link></li>
                        <li className="breadcrumb-item"><Link to="/appraisals/">Appraisals</Link></li>
                        <li className="breadcrumb-item"><Link
                            to={"/appraisal/" + this.props.appraisal._id + "/upload"}>{this.props.appraisal.name}</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">{this.props.title}</li>
                    </ol>
                </div> : null}
            </div>
        );
    }
}


export default AppraisalContentHeader;
