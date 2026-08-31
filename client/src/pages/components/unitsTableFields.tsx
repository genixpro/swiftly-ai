import React from 'react';

import CurrencyFormat from './CurrencyFormat';
import IntegerFormat from './IntegerFormat';
import {tenancyYearlyRentPSF} from '../../domain/tenancies';
import {currentTenancy, isVacant, unitMarketRentAmount} from '../../domain/appraisal';
import type {UnitDTO} from '../../api/types';

/**
 * Presentation-only column definitions kept separate from the table's
 * selection and drag-and-drop behavior. Values and markup intentionally
 * match the legacy inline definitions.
 */
interface UnitField {
    title: string;
    className: string;
    render: (unit: UnitDTO) => React.ReactNode;
}

export function unitFieldConfiguration(marketRents?: ReadonlyArray<{name?: string | null; amountPSF?: number | null}> | null): Record<string, UnitField> {
    return {
        unitNumber: {
            title: 'Unit Number',
            className: 'unit-number-column',
            render: (unit) => <span>{unit.unitNumber}</span>,
        },
        tenantName: {
            title: 'Tenant Name',
            className: 'tenant-name-column',
            render: (unit) => <span>{isVacant(unit) ? 'Vacant' : currentTenancy(unit)?.name}</span>,
        },
        squareFootage: {
            title: 'Size (sf)',
            className: 'square-footage-column',
            render: (unit) => <IntegerFormat value={unit.squareFootage} />,
        },
        yearlyRentPSF: {
            title: 'Rent (psf)',
            className: 'rent-column',
            render: (unit) => <CurrencyFormat value={tenancyYearlyRentPSF(currentTenancy(unit)!, unit.squareFootage!)} />,
        },
        yearlyRent: {
            title: 'Annual Rent',
            className: 'rent-column',
            render: (unit) => <CurrencyFormat value={currentTenancy(unit)?.yearlyRent} cents={false} />,
        },
        stabilizedRentPSF: {
            title: 'Rent (psf)',
            className: 'rent-column',
            render: (unit) => <CurrencyFormat value={unit.shouldUseMarketRent && unit.marketRent ? unitMarketRentAmount(unit, marketRents) : tenancyYearlyRentPSF(currentTenancy(unit)!, unit.squareFootage!)} />,
        },
        stabilizedRent: {
            title: 'Annual Rent',
            className: 'rent-column',
            render: (unit) => <CurrencyFormat value={unit.shouldUseMarketRent && unit.marketRent ? unitMarketRentAmount(unit, marketRents)! * unit.squareFootage! : currentTenancy(unit)?.yearlyRent} cents={false} />,
        },
    };
}

/** Retains the existing field order for both stabilized-stat display modes. */
export function defaultUnitFields(showStabilizedStats: boolean): string[] {
    if (!showStabilizedStats) {
        return ['unitNumber', 'tenantName', 'squareFootage', 'stabilizedRentPSF', 'stabilizedRent'];
    }
    return ['unitNumber', 'tenantName', 'squareFootage', 'stabilizedRentPSF', 'stabilizedRent'];
}
