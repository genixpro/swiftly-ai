import {createContext, useContext} from 'react';

export interface AppraisalNavigationState {
    appraisalType: string | null;
    hasActiveAppraisal: boolean;
    changeAppraisalType(type: unknown): void;
    clearAppraisal(): void;
}

const AppraisalNavigationContext = createContext<AppraisalNavigationState | null>(null);

export const AppraisalNavigationProvider = AppraisalNavigationContext.Provider;

export function useAppraisalNavigation(): AppraisalNavigationState {
    const value = useContext(AppraisalNavigationContext);
    if (!value) throw new Error('useAppraisalNavigation must be used inside the application layout.');
    return value;
}
