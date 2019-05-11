
export default [
    {
        "name": "Groups",
        "groups": [
            {
                "name": "Rent Roll",
                "placeholder": "Rent Roll",
                "value": "RENT_ROLL",
                "groupSet": "DATA_TYPE"
            },
            {
                "name": "Income Statement",
                "placeholder": "Income Statement",
                "value": "INCOME_STATEMENT",
                "groupSet": "DATA_TYPE"
            },
            {
                "name": "Expense Statement",
                "placeholder": "Expense Statement",
                "value": "EXPENSE_STATEMENT",
                "groupSet": "DATA_TYPE"
            },
            {
                "name": "Comparable Sale",
                "placeholder": "Comparable Sale",
                "value": "COMPARABLE_SALE",
                "groupSet": "DATA_TYPE"
            },
            {
                "name": "Comparable Lease",
                "placeholder": "Comparable Lease",
                "value": "COMPARABLE_LEASE",
                "groupSet": "DATA_TYPE"
            }
        ]
    },
    {
        "name": "General",
        "fields": [
            {
                "name": "Document Number",
                "placeholder": "Document Number",
                "value": "DOCUMENT_NUMBER"
            },
            {
                "name": "Document Date",
                "placeholder": "Document Date",
                "value": "DOCUMENT_DATE"
            },
            {
                "name": "Document Time",
                "placeholder": "Document Time",
                "value": "DOCUMENT_TIME"
            },
            {
                "name": "Statement Date",
                "placeholder": "Statement Date",
                "value": "STATEMENT_DATE"
            },
            {
                "name": "Building Address",
                "placeholder": "Building Address",
                "value": "BUILDING_ADDRESS"
            },
            {
                "name": "User ID",
                "placeholder": "User ID",
                "value": "USER_ID"
            },
            {
                "name": "Statement Year",
                "placeholder": "Statement Year",
                "value": "STATEMENT_YEAR"
            },
            {
                "name": "Statement Next Year",
                "placeholder": "Statement Next Year",
                "value": "STATEMENT_NEXT_YEAR"
            },
            {
                "name": "Statement Previous Year",
                "placeholder": "Statement Previous Year",
                "value": "STATEMENT_PREVIOUS_YEAR"
            }
        ]
    },
    {
        "name": "Line Items",
        "multiple": true,
        "value": "items",
        "groups": [
            {
                "name": "Multi Line Item",
                "placeholder": "Multi Line Item",
                "value": "MULTI_LINE_ITEM",
                "groupSet": "ITEMS"
            }
        ],
        "fields": [
            {
                "name": "Account Number",
                "placeholder": "Account Number",
                "value": "ACC_NUM"
            },
            {
                "name": "Account Name",
                "placeholder": "Account Name",
                "value": "ACC_NAME"
            },
            {
                "name": "Forecast",
                "placeholder": "Forecast",
                "value": "FORECAST"
            },
            {
                "name": "Budget",
                "placeholder": "Budget",
                "value": "BUDGET"
            },
            {
                "name": "Variance",
                "placeholder": "Variance",
                "value": "VARIANCE"
            }
        ],
        "modifiers": [
            {
                "name": "Sum",
                "placeholder": "Sum",
                "value": "SUM"
            },
            {
                "name": "Next Year",
                "placeholder": "Next Year",
                "value": "NEXT_YEAR"
            },
            {
                "name": "Previous Year",
                "placeholder": "Previous Year",
                "value": "PREVIOUS_YEAR"
            },
            {
                "name": "Percentage",
                "placeholder": "Percentage",
                "value": "PERCENTAGE"
            },
            {
                "name": "Summary",
                "placeholder": "Summary",
                "value": "SUMMARY"
            },
        ]
    },
    {
        "name": "Income Types",
        "multiple": true,
        "value": "items",
        "fields": [
        ],
        "modifiers": [
            {
                "name": "Income",
                "placeholder": "Income",
                "value": "INCOME"
            },
            {
                "name": "Rent",
                "placeholder": "Rent",
                "value": "RENT"
            },
            {
                "name": "Additional Income",
                "placeholder": "Additional Income",
                "value": "ADDITIONAL_INCOME"
            },
            {
                "name": "Expense Recovery",
                "placeholder": "Expense Recovery",
                "value": "EXPENSE_RECOVERY"
            }
        ]
    },
    {
        "name": "Expense Types",
        "multiple": true,
        "value": "items",
        "fields": [
        ],
        "modifiers": [
            {
                "name": "Expense",
                "placeholder": "Expense",
                "value": "EXPENSE"
            },
            {
                "name": "Expense Recovery",
                "placeholder": "Expense Recovery",
                "value": "EXPENSE_RECOVERY"
            },
            {
                "name": "Operating Expense",
                "placeholder": "Operating Expense",
                "value": "OPERATING_EXPENSE"
            },
            {
                "name": "Non Recoverable Expense",
                "placeholder": "Non Recoverable Expense",
                "value": "NON_RECOVERABLE_EXPENSE"
            },
            {
                "name": "Taxes",
                "placeholder": "Taxes",
                "value": "TAXES"
            },
            {
                "name": "Management Expense",
                "placeholder": "Management Expense",
                "value": "MANAGEMENT_EXPENSE"
            },
            {
                "name": "Structural Allowance",
                "placeholder": "Structural Allowance",
                "value": "STRUCTURAL_ALLOWANCE"
            }
        ]
    },
    {
        "name": "Rent Roll",
        "multiple": true,
        "value": "items",
        "fields": [
            {
                "name": "Unit Number",
                "placeholder": "Unit Number",
                "value": "UNIT_NUM"
            },
            {
                "name": "Tenant Name",
                "placeholder": "Tenant Name",
                "value": "TENANT_NAME"
            },
            {
                "name": "Rentable Area",
                "placeholder": "Rentable Area",
                "value": "RENTABLE_AREA"
            },
            {
                "name": "Lease Term Start",
                "placeholder": "Lease Term Start",
                "value": "TERM_START"
            },
            {
                "name": "Lease Term End",
                "placeholder": "Lease Term End",
                "value": "TERM_END"
            },
            {
                "name": "Monthly Rent",
                "placeholder": "Monthly Rent",
                "value": "MONTHLY_RENT"
            },
            {
                "name": "Yearly Rent",
                "placeholder": "Yearly Rent",
                "value": "YEARLY_RENT"
            }
        ],
        "modifiers": [
        ]
    },
    {
        "name": "Comparable Sale Basic Information",
        "fields": [
            {
                "name": "Building Name",
                "placeholder": "Name",
                "value": "building_name"
            },
            {
                "name": "Building Address",
                "placeholder": "Address",
                "value": "building_address"
            }
        ]
    },
    {
        "name": "Comparable Sale Financial Information",
        "fields": [
            {
                "name": "Price Per Square Foot",
                "placeholder": "Price Per Square Foot",
                "value": "price_per_square_foot"
            },
            {
                "name": "Capitalization Rate",
                "placeholder": "Capitalization Rate",
                "value": "capitalization_rate"
            }
        ]
    },
    {
        "name": "Lease Counterparty Information",
        "fields": [
            {
                "name": "Counterparty Name",
                "placeholder": "Counterparty",
                "value": "counterparty_name"
            },
            {
                "name": "Counterparty Address",
                "placeholder": "Address",
                "value": "counterparty_address"
            }
        ]
    },
    {
        "name": "Lease Tenancy Information",
        "fields": [
            {
                "name": "Tenancy Address",
                "placeholder": "Tenancy Address",
                "value": "tenancy_address"
            },
            {
                "name": "Tenancy Size",
                "placeholder": "Tenancy Size",
                "value": "size_square_feet"
            },
            {
                "name": "Tenancy Term",
                "placeholder": "Tenancy Term",
                "value": "term"
            },
            {
                "name": "Rent",
                "placeholder": "Rent (PSF $)",
                "value": "rent_per_square_foot"
            },
            {
                "name": "Additional Rent Terms",
                "placeholder": "Additional Rent Terms",
                "value": "additional_rent_terms"
            },
            {
                "name": "Free Rent",
                "placeholder": "Free Rent",
                "value": "free_rent"
            }
        ]
    }
];