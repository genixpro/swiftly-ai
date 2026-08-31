import {Col, Progress, Row, Table} from 'reactstrap';
import '@components/Common/datetime-compat.css';
import {sequentialOccupancyYears, vacancyScheduleYears, type VacancyScheduleUnit} from '../domain/vacancySchedule';

interface VacancyScheduleRow extends VacancyScheduleUnit {
    unitNumber?: string;
}

interface ViewVacancyScheduleProps {
    appraisal?: {
        units: VacancyScheduleRow[];
    };
}

export default function ViewVacancySchedule({appraisal}: ViewVacancyScheduleProps) {
    if (!appraisal) return null;
    const years = vacancyScheduleYears();
    return <div id="view-vacancy-schedule" className="view-vacancy-schedule">
        <Row><Col xs={12}>
            <Table className="vacancy-schedule-table">
                <thead><tr>
                    <td>Unit</td>
                    {years.map((year) => <td key={year}>{year}</td>)}
                </tr></thead>
                <tbody>{appraisal.units.map((unit) => <tr key={unit.unitNumber}>
                    <td>{unit.unitNumber}</td>
                    {sequentialOccupancyYears(unit, years).map((occupation) => <td
                        className="occupancy-cell"
                        key={occupation.start}
                        colSpan={occupation.period}
                    >
                        {occupation.occupied
                            ? <Progress value="100">Occupied {occupation.start} - {occupation.end}</Progress>
                            : <span>Vacant {occupation.start} - {occupation.end}</span>}
                    </td>)}
                </tr>)}</tbody>
            </Table>
        </Col></Row>
    </div>;
}
