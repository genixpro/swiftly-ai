import {Card, CardBody, Col, Row} from 'reactstrap';
import type {EditableAppraisal} from '../app/AppraisalWorkspace';
import AppraisalContentHeader from './components/AppraisalContentHeader';
import IncomeStatementEditor from './components/IncomeStatementEditor';

export default function ViewAdditionalIncomes({appraisal, saveAppraisal}: {
    appraisal: EditableAppraisal;
    saveAppraisal(appraisal: EditableAppraisal): void;
}) {
    return <div className="view-additional-incomes">
        <AppraisalContentHeader appraisal={appraisal} title="Additional Income" />
        <Row><Col xs={12}><Card className="card-default"><CardBody>
            <div id="view-additional-incomes-body" className="view-additional-incomes-body">
                <Row><Col xs={10}><h3>Additional Income</h3></Col></Row>
                <IncomeStatementEditor appraisal={appraisal} field="incomeStatement" groups={{additional_income: 'Additional Income'}} saveAppraisal={saveAppraisal} />
            </div>
        </CardBody></Card></Col></Row>
    </div>;
}
