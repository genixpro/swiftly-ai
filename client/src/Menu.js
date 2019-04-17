const Menu = [
    {
        heading: 'Main Navigation',
    },
    {
        name: 'Start an Appraisal',
        path: '/appraisal/new',
        icon : 'icon-plus',
    },
    {
        name: 'View Appraisals',
        path: '/appraisals',
        icon : 'icon-menu',
    },
    {
        name: 'Appraisal',
        icon: 'icon-docs',
        match: '/appraisal/:appraisalId/',
        openByDefault: true,
        submenu: [
            {
                name: 'Upload Files',
                path: '/appraisal/:appraisalId/upload',
            },
            {
                name: 'General Information',
                path: '/appraisal/:appraisalId/general',
            },
            {
                name: 'Tenants',
                path: '/appraisal/:appraisalId/tenants/rent_roll',
                match: '/appraisal/:appraisalId/tenants',
            },
            {
                name: 'Expenses',
                path: '/appraisal/:appraisalId/expenses',
            },
            {
                name: 'Additional Income',
                path: '/appraisal/:appraisalId/additional_income',
            },
            {
                name: 'Amortization Schedule',
                path: '/appraisal/:appraisalId/amortization',
            },
            {
                name: 'Comparable Sales',
                path: '/appraisal/:appraisalId/comparable_sales/database',
                match: '/appraisal/:appraisalId/comparable_sales',
            },
            {
                name: 'Comparable Leases',
                path: '/appraisal/:appraisalId/comparable_leases/database',
                match: '/appraisal/:appraisalId/comparable_leases',
            },
            {
                name: 'Stabilized Statement',
                path: '/appraisal/:appraisalId/stabilized_statement_valuation',
            },
            {
                name: 'Capitalization Valuation',
                path: '/appraisal/:appraisalId/capitalization_valuation',
            },
            {
                name: 'Direct Comparison',
                path: '/appraisal/:appraisalId/direct_comparison_valuation',
                match: '/appraisal/:appraisalId/direct_comparison_valuation',
            },
            // {
            //     name: 'Discounted Cash Flow',
            //     path: '/appraisal/:appraisalId/discounted_cash_flow',
            // }
        ]
    },
    {
        name: 'Log Out',
        path: '/logout',
        icon : 'fa fa-door-open',
    },
];

export default Menu;
