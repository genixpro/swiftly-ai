export interface MenuLabel {
    color: string;
    value: string;
}

export interface MenuItem {
    heading?: string;
    name?: string;
    path?: string;
    match?: string;
    icon?: string;
    translate?: string;
    label?: MenuLabel;
    appraisalType?: string | null;
    openByDefault?: boolean;
    submenu?: MenuItem[];
}

const Menu: MenuItem[] = [
    {heading: 'Main Navigation'},
    {name: 'Start an Appraisal', path: '/appraisal/new', icon: 'fas fa-plus'},
    {name: 'View Appraisals', path: '/appraisals', icon: 'fas fa-list'},
    {
        name: 'Appraisal',
        icon: 'fas fa-copy',
        match: '/appraisal/:appraisalId/',
        openByDefault: true,
        submenu: [
            {name: 'Upload Files', path: '/appraisal/:appraisalId/upload', appraisalType: null},
            {name: 'General Information', path: '/appraisal/:appraisalId/general', appraisalType: null},
            {
                name: 'Tenants',
                path: '/appraisal/:appraisalId/tenants/rent_roll',
                match: '/appraisal/:appraisalId/tenants',
                appraisalType: 'detailed',
            },
            {name: 'Expenses', path: '/appraisal/:appraisalId/expenses', appraisalType: 'detailed'},
            {name: 'Additional Income', path: '/appraisal/:appraisalId/additional_income', appraisalType: 'detailed'},
            {name: 'Amortization Schedule', path: '/appraisal/:appraisalId/amortization', appraisalType: 'detailed'},
            {
                name: 'Comparable Sales',
                path: '/appraisal/:appraisalId/comparable_sales/database',
                match: '/appraisal/:appraisalId/comparable_sales',
                appraisalType: null,
            },
            {
                name: 'Comparable Leases',
                path: '/appraisal/:appraisalId/comparable_leases/database',
                match: '/appraisal/:appraisalId/comparable_leases',
                appraisalType: null,
            },
            {name: 'Stabilized Statement', path: '/appraisal/:appraisalId/stabilized_statement_valuation', appraisalType: null},
            {name: 'Capitalization Approach', path: '/appraisal/:appraisalId/capitalization_valuation', appraisalType: null},
            {
                name: 'Direct Comparison',
                path: '/appraisal/:appraisalId/direct_comparison_valuation',
                match: '/appraisal/:appraisalId/direct_comparison_valuation',
                appraisalType: null,
            },
        ],
    },
];

export default Menu;
