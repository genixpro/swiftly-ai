export const appraisalRoutes = [
    '/appraisal/demo-appraisal/upload',
    '/appraisal/demo-appraisal/general',
    '/appraisal/demo-appraisal/tenants',
    '/appraisal/demo-appraisal/tenants/rent_roll',
    '/appraisal/demo-appraisal/tenants/leasing_costs',
    '/appraisal/demo-appraisal/tenants/vacancy_schedule',
    '/appraisal/demo-appraisal/tenants/market_rents',
    '/appraisal/demo-appraisal/tenants/recovery_structures',
    '/appraisal/demo-appraisal/expenses',
    '/appraisal/demo-appraisal/comparable_sales',
    '/appraisal/demo-appraisal/comparable_sales/appraisal_caprate',
    '/appraisal/demo-appraisal/comparable_sales/appraisal_dca',
    '/appraisal/demo-appraisal/comparable_sales/database',
    '/appraisal/demo-appraisal/comparable_leases',
    '/appraisal/demo-appraisal/comparable_leases/appraisal',
    '/appraisal/demo-appraisal/comparable_leases/database',
    '/appraisal/demo-appraisal/stabilized_statement_valuation',
    '/appraisal/demo-appraisal/direct_comparison_valuation',
    '/appraisal/demo-appraisal/capitalization_valuation',
    '/appraisal/demo-appraisal/additional_income',
    '/appraisal/demo-appraisal/amortization',
    '/appraisal/demo-appraisal/discounted_cash_flow',
] as const;

export const visualViewports = {
    desktop: {width: 1440, height: 900},
    mobile: {width: 390, height: 844},
} as const;
