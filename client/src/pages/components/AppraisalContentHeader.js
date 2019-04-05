import React from 'react';


class AppraisalContentHeader extends React.Component
{
    render() {
        console.log(this.props.appraisal.name);

        return (
            <div className="content-heading">
                {this.props.appraisal ?
                <div>{this.props.appraisal.name} - {this.props.title}
                    <ol className="breadcrumb breadcrumb px-0 pb-0">
                        <li className="breadcrumb-item"><a href="/">Home</a></li>
                        <li className="breadcrumb-item"><a href="/appraisals/">Appraisals</a></li>
                        <li className="breadcrumb-item"><a
                            href={"/appraisals/" + this.props.appraisal._id['$oid'] + "/upload"}>{this.props.appraisal.name}</a>
                        </li>
                        <li className="breadcrumb-item active">{this.props.title}</li>
                    </ol>
                </div> : null}
            </div>
        );
    }
}


export default AppraisalContentHeader;
