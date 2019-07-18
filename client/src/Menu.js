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
                appraisalType: null
            },
            {
                name: 'General Information',
                path: '/appraisal/:appraisalId/general',
                appraisalType: null
            },
            {
                name: 'Tenants',
                path: '/appraisal/:appraisalId/tenants/rent_roll',
                match: '/appraisal/:appraisalId/tenants',
                appraisalType: 'detailed'
            },
            {
                name: 'Expenses',
                path: '/appraisal/:appraisalId/expenses',
                appraisalType: 'detailed'
            },
            // {
            //     name: 'Additional Income',
            //     path: '/appraisal/:appraisalId/additional_income',
            //     appraisalType: 'detailed'
            // },
            {
                name: 'Amortization Schedule',
                path: '/appraisal/:appraisalId/amortization',
                appraisalType: 'detailed'
            },
            {
                name: 'Comparable Sales',
                path: '/appraisal/:appraisalId/comparable_sales/database',
                match: '/appraisal/:appraisalId/comparable_sales',
                appraisalType: null
            },
            {
                name: 'Comparable Leases',
                path: '/appraisal/:appraisalId/comparable_leases/database',
                match: '/appraisal/:appraisalId/comparable_leases',
                appraisalType: null
            },
            {
                name: 'Stabilized Statement',
                path: '/appraisal/:appraisalId/stabilized_statement_valuation',
                appraisalType: null
            },
            {
                name: 'Capitalization Approach',
                path: '/appraisal/:appraisalId/capitalization_valuation',
                appraisalType: null
            },
            {
                name: 'Direct Comparison',
                path: '/appraisal/:appraisalId/direct_comparison_valuation',
                match: '/appraisal/:appraisalId/direct_comparison_valuation',
                appraisalType: null
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
