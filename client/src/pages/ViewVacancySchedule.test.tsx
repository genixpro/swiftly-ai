import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ViewVacancySchedule from './ViewVacancySchedule';

describe('vacancy-schedule route', () => {
    it('retains the unit grid and contiguous occupied/vacant ranges', () => {
        const currentYear = new Date().getFullYear();
        render(<ViewVacancySchedule appraisal={{units: [{
            unitNumber: '101',
            tenancies: [{startDate: `${currentYear}-01-01`, endDate: `${currentYear + 1}-12-31`}],
        }]}} />);

        expect(screen.getByText('Unit')).toBeVisible();
        expect(screen.getByText('101')).toBeVisible();
        expect(screen.getByText(`Occupied ${currentYear} - ${currentYear + 1}`)).toBeVisible();
        expect(screen.getByText(`Vacant ${currentYear + 2} - ${currentYear + 9}`)).toBeVisible();
    });
});
