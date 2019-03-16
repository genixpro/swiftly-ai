
export default [
    {
        "name": "General",
        "fields": [
            {
                "name": "Document Number",
                "placeholder": "Document Number",
                "field": "DOCUMENT_NUMBER"
            },
            {
                "name": "Document Date",
                "placeholder": "Document Date",
                "field": "DOCUMENT_DATE"
            },
            {
                "name": "Document Time",
                "placeholder": "Document Time",
                "field": "DOCUMENT_TIME"
            },
            {
                "name": "Statement Date",
                "placeholder": "Statement Date",
                "field": "STATEMENT_DATE"
            },
            {
                "name": "Building Address",
                "placeholder": "Building Address",
                "field": "BUILDING_ADDRESS"
            },
            {
                "name": "User ID",
                "placeholder": "User ID",
                "field": "USER_ID"
            },
            {
                "name": "Statement Year",
                "placeholder": "Statement Year",
                "field": "STATEMENT_YEAR"
            },
            {
                "name": "Statement Next Year",
                "placeholder": "Statement Next Year",
                "field": "STATEMENT_NEXT_YEAR"
            }
        ]
    },
    {
        "name": "Line Items",
        "multiple": true,
        "field": "items",
        "fields": [
            {
                "name": "Account Number",
                "placeholder": "Account Number",
                "field": "ACC_NUM"
            },
            {
                "name": "Account Name",
                "placeholder": "Account Name",
                "field": "ACC_NAME"
            },
            {
                "name": "Forecast",
                "placeholder": "Forecast",
                "field": "FORECAST"
            },
            {
                "name": "Budget",
                "placeholder": "Budget",
                "field": "BUDGET"
            },
            {
                "name": "Variance",
                "placeholder": "Variance",
                "field": "VARIANCE"
            }
        ],
        "modifiers": [
            {
                "name": "Sum",
                "placeholder": "Sum",
                "field": "SUM"
            },
            {
                "name": "Next Year",
                "placeholder": "Next Year",
                "field": "NEXT_YEAR"
            },
            {
                "name": "Percentage",
                "placeholder": "Percentage",
                "field": "PERCENTAGE"
            },
            {
                "name": "Income",
                "placeholder": "Income",
                "field": "INCOME"
            },
            {
                "name": "Expense",
                "placeholder": "Expense",
                "field": "EXPENSE"
            },
            {
                "name": "Summary",
                "placeholder": "Summary",
                "field": "SUMMARY"
            }
        ]
    },
    {
        "name": "Rent Roll",
        "multiple": true,
        "field": "items",
        "fields": [
            {
                "name": "Unit Number",
                "placeholder": "Unit Number",
                "field": "UNIT_NUM"
            },
            {
                "name": "Tenant Name",
                "placeholder": "Tenant Name",
                "field": "TENANT_NAME"
            },
            {
                "name": "Rentable Area",
                "placeholder": "Rentable Area",
                "field": "RENTABLE_AREA"
            },
            {
                "name": "Lease Term Start",
                "placeholder": "Lease Term Start",
                "field": "TERM_START"
            },
            {
                "name": "Lease Term End",
                "placeholder": "Lease Term End",
                "field": "TERM_END"
            },
            {
                "name": "Monthly Rent",
                "placeholder": "Monthly Rent",
                "field": "MONTHLY_RENT"
            },
            {
                "name": "Yearly Rent",
                "placeholder": "Yearly Rent",
                "field": "YEARLY_RENT"
            }
        ],
        "modifiers": [
        ]
    }
];