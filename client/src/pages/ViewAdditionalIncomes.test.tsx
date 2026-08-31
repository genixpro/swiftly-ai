import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ViewAdditionalIncomes from './ViewAdditionalIncomes';

vi.mock('./components/AppraisalContentHeader', () => ({default: ({title}: {title: string}) => <h1>{title}</h1>}));
vi.mock('./components/IncomeStatementEditor', () => ({
    default: ({field, groups}: {field: string; groups: Record<string, string>}) => <output>{`${field}:${groups.additional_income}`}</output>,
}));

describe('additional-income route', () => {
    it('retains the title, heading, and additional-income editor configuration', () => {
        render(<ViewAdditionalIncomes appraisal={{_id: 'a'}} saveAppraisal={vi.fn()}/>);
        expect(screen.getByRole('heading', {name: 'Additional Income', level: 1})).toBeVisible();
        expect(screen.getByText('incomeStatement:Additional Income')).toBeVisible();
    });
});
