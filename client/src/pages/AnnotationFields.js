
export default [
    {
        "name": "Groups",
        "groups": [
            {
                "name": "Rent Roll",
                "placeholder": "Rent Roll",
                "value": "RENT_ROLL",
                "groupSet": "DATA_TYPE",
                "views": ['dataGroups']
            },
            {
                "name": "Income Statement",
                "placeholder": "Income Statement",
                "value": "INCOME_STATEMENT",
                "groupSet": "DATA_TYPE",
                "views": ['dataGroups']
            },
            {
                "name": "Expense Statement",
                "placeholder": "Expense Statement",
                "value": "EXPENSE_STATEMENT",
                "groupSet": "DATA_TYPE",
                "views": ['dataGroups']
            },
            {
                "name": "Miscellaneous Financial",
                "placeholder": "Miscellaneous Financial",
                "value": "MISCELLANEOUS_FINANCIAL",
                "groupSet": "DATA_TYPE",
                "views": ['dataGroups']
            },
            {
                "name": "Comparable Sale",
                "placeholder": "Comparable Sale",
                "value": "COMPARABLE_SALE",
                "groupSet": "DATA_TYPE",
                "views": ['dataGroups']
            },
            {
                "name": "Comparable Lease",
                "placeholder": "Comparable Lease",
                "value": "COMPARABLE_LEASE",
                "groupSet": "DATA_TYPE",
                "views": ['dataGroups']
            }
        ]
    },
    {
        "name": "General",
        "fields": [
            {
                "name": "Document Number",
                "placeholder": "Document Number",
                "value": "DOCUMENT_NUMBER",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "Document Date",
                "placeholder": "Document Date",
                "value": "DOCUMENT_DATE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "Document Time",
                "placeholder": "Document Time",
                "value": "DOCUMENT_TIME",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "Statement Date",
                "placeholder": "Statement Date",
                "value": "STATEMENT_DATE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "Building Address",
                "placeholder": "Building Address",
                "value": "BUILDING_ADDRESS",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "User ID",
                "placeholder": "User ID",
                "value": "USER_ID",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "Statement Year",
                "placeholder": "Statement Year",
                "value": "STATEMENT_YEAR",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "Statement Next Year",
                "placeholder": "Statement Next Year",
                "value": "STATEMENT_NEXT_YEAR",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            },
            {
                "name": "Statement Previous Year",
                "placeholder": "Statement Previous Year",
                "value": "STATEMENT_PREVIOUS_YEAR",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "block"
            }
        ]
    },
    {
        "name": "Line Items",
        "groups": [
            {
                "name": "Line Item Group With Sum",
                "placeholder": "Line Item Group With Sum",
                "value": "LINE_ITEM_GROUP_WITH_SUM",
                "groupSet": "ITEMS",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT", "RENT_ROLL"],
                "textType": "table"
            }
        ],
        "fields": [
            {
                "name": "Account Number",
                "placeholder": "Account Number",
                "value": "ACC_NUM",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Account Name",
                "placeholder": "Account Name",
                "value": "ACC_NAME",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Forecast",
                "placeholder": "Forecast",
                "value": "FORECAST",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Actuals",
                "placeholder": "Actuals",
                "value": "ACTUALS",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Year To Date",
                "placeholder": "Year To Date",
                "value": "YEAR_TO_DATE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Variance",
                "placeholder": "Variance",
                "value": "VARIANCE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            }
        ],
        "modifiers": [
            {
                "name": "Sum",
                "placeholder": "Sum",
                "value": "SUM",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "requiredGroups": ["LINE_ITEM_GROUP_WITH_SUM"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Percentage",
                "placeholder": "Percentage",
                "value": "PERCENTAGE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Per Square Foot",
                "placeholder": "Per Square Foot",
                "value": "PSF",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Grand Total / Final Sum",
                "placeholder": "Grand Total / Final Sum",
                "value": "SUMMARY",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            }
        ]
    },
    {
        "name": "Line Items Year",
        "groups": [

        ],
        "fields": [

        ],
        "modifiers": [
            {
                "name": "Next Year",
                "placeholder": "Next Year",
                "value": "NEXT_YEAR",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Next Year + 2",
                "placeholder": "Next Year + 2",
                "value": "NEXT_YEAR_2",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Previous Year",
                "placeholder": "Previous Year",
                "value": "PREVIOUS_YEAR",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Previous Year + 2",
                "placeholder": "Previous Year + 2",
                "value": "PREVIOUS_YEAR_2",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Previous Year + 3",
                "placeholder": "Previous Year + 3",
                "value": "PREVIOUS_YEAR_3",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            },
            {
                "name": "Previous Year + 4",
                "placeholder": "Previous Year + 4",
                "value": "PREVIOUS_YEAR_4",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table"
            }
        ]
    },
    {
        "name": "Income Types",
        "fields": [
        ],
        "modifiers": [
            {
                "name": "Income",
                "placeholder": "Income",
                "value": "INCOME",
                "anyOfGroups": ["INCOME_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Rent",
                "placeholder": "Rent",
                "value": "RENT",
                "anyOfGroups": ["INCOME_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Additional Income",
                "placeholder": "Additional Income",
                "value": "ADDITIONAL_INCOME",
                "anyOfGroups": ["INCOME_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Expense Recovery",
                "placeholder": "Expense Recovery",
                "value": "EXPENSE_RECOVERY",
                "anyOfGroups": ["INCOME_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            }
        ]
    },
    {
        "name": "Expense Types",
        "fields": [
        ],
        "modifiers": [
            {
                "name": "Expense",
                "placeholder": "Expense",
                "value": "EXPENSE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Operating Expense",
                "placeholder": "Operating Expense",
                "value": "OPERATING_EXPENSE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Non Recoverable Expense",
                "placeholder": "Non Recoverable Expense",
                "value": "NON_RECOVERABLE_EXPENSE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Taxes",
                "placeholder": "Taxes",
                "value": "TAXES",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Management Expense",
                "placeholder": "Management Expense",
                "value": "MANAGEMENT_EXPENSE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            },
            {
                "name": "Structural Allowance",
                "placeholder": "Structural Allowance",
                "value": "STRUCTURAL_ALLOWANCE",
                "anyOfGroups": ["INCOME_STATEMENT", "EXPENSE_STATEMENT"],
                "textType": "table",
                "applyAcrossLine": true
            }
        ]
    },
    {
        "name": "Rent Roll (Tenant Information)",
        "groups": [
            {
                "name": "Multi Line Tenant Information",
                "placeholder": "Multi Line Tenant Information",
                "value": "MULTI_LINE_TENANT",
                "groupSet": "ITEMS",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            }
        ],
        "fields": [
            {
                "name": "Unit Number",
                "placeholder": "Unit Number",
                "value": "UNIT_NUM",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Floor Number",
                "placeholder": "Floor Number",
                "value": "FLOOR_NUM",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Tenant Name",
                "placeholder": "Tenant Name",
                "value": "TENANT_NAME",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Rentable Area",
                "placeholder": "Rentable Area",
                "value": "RENTABLE_AREA",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Lease Term Start",
                "placeholder": "Lease Term Start",
                "value": "TERM_START",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Lease Term End",
                "placeholder": "Lease Term End",
                "value": "TERM_END",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            }
        ],
        "modifiers": [
        ]
    },
    {
        "name": "Rent Roll (Rent)",
        "groups": [
            {
                "name": "Multi Line Tenant Information",
                "placeholder": "Multi Line Tenant Information",
                "value": "MULTI_LINE_TENANT",
                "groupSet": "ITEMS",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            }
        ],
        "fields": [
            {
                "name": "Monthly Rent (Gross)",
                "placeholder": "Monthly Rent (Gross)",
                "value": "MONTHLY_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Yearly Rent (Gross)",
                "placeholder": "Yearly Rent (Gross)",
                "value": "YEARLY_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Monthly Rent (Net)",
                "placeholder": "Monthly Rent (Net)",
                "value": "MONTHLY_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Yearly Rent (Net)",
                "placeholder": "Yearly Rent (Net)",
                "value": "YEARLY_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Rent is Net",
                "placeholder": "Rent is Net",
                "value": "NET_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Rent is Gross",
                "placeholder": "Rent is Gross",
                "value": "GROSS_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Free Rent is Net",
                "placeholder": "Free Rent is Net",
                "value": "NET_FREE_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Free Rent is Gross",
                "placeholder": "Free Rent is Gross",
                "value": "GROSS_FREE_RENT",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Free Rent Months",
                "placeholder": "Free Rent Months",
                "value": "FREE_RENT_MONTHS",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            },
            {
                "name": "Free Rent Area",
                "placeholder": "Free Rent Area",
                "value": "FREE_RENT_AREA",
                "anyOfGroups": ["RENT_ROLL"],
                "textType": "table"
            }
        ],
        "modifiers": [
        ]
    },
    {
        "name": "Comp Basic Information",
        "fields": [
            {
                "name": "Building Name",
                "placeholder": "Name",
                "value": "BUILDING_NAME",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Building Address",
                "placeholder": "Address",
                "value": "BUILDING_ADDRESS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Property Type",
                "placeholder": "Property Type",
                "value": "PROPERTY_TYPE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Tenants",
                "placeholder": "Tenants",
                "value": "TENANTS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Additional Info",
                "placeholder": "Additional Info",
                "value": "ADDITIONAL_INFO",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Parking",
                "placeholder": "Parking",
                "value": "PARKING",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Zoning",
                "placeholder": "Zoning",
                "value": "ZONING",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
        ]
    },
    {
        "name": "Comp Building Information",
        "fields": [
            {
                "name": "Building Size (sqft)",
                "placeholder": "Building Size (sqft)",
                "value": "BUILDING_SIZE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Construction Date",
                "placeholder": "Construction Date",
                "value": "CONSTRUCTION_DATE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Floors",
                "placeholder": "Floors",
                "value": "FLOORS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Number of Units",
                "placeholder": "Number of Units",
                "value": "NUMBER_OF_UNITS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
        ]
    },
    {
        "name": "Comp Purchase Information",
        "fields": [
            {
                "name": "Purchaser",
                "placeholder": "Purchaser",
                "value": "PURCHASER",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Vendor",
                "placeholder": "Vendor",
                "value": "VENDOR",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Sale Date",
                "placeholder": "Sale Date",
                "value": "SALE_DATE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
        ]
    },
    {
        "name": "Comp Financial Information",
        "fields": [
            {
                "name": "Net Operating Income",
                "placeholder": "Net Operating Income",
                "value": "NET_OPERATING_INCOME",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Price Per Square Foot",
                "placeholder": "Price Per Square Foot",
                "value": "PRICE_PER_SQUARE_FOOT",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Capitalization Rate",
                "placeholder": "Capitalization Rate",
                "value": "CAPITALIZATION_RATE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Occupancy Rate",
                "placeholder": "Occupancy Rate",
                "value": "OCCUPANCY_RATE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Vacancy Rate",
                "placeholder": "Vacancy Rate",
                "value": "VACANCY_RATE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Price Per Square Foot (Land)",
                "placeholder": "Price Per Square Foot (Land)",
                "value": "PRICE_PER_SQUARE_FOOT_LAND",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Price Per Acre (Land)",
                "placeholder": "Price Per Acre (Land)",
                "value": "PRICE_PER_ACRE_LAND",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Price Per Square Foot Buildable Area",
                "placeholder": "Price Per Square Foot Buildable Area",
                "value": "PRICE_PER_SQUARE_FOOT_BUILDABLE_AREA",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Price Per Buildable Unit",
                "placeholder": "Price Per Buildable Unit",
                "value": "PRICE_PER_BUILDABLE_UNIT",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Floor Space Index",
                "placeholder": "Floor Space Index",
                "value": "FLOOR_SPACE_INDEX",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Net Operating Income (PSF)",
                "placeholder": "Net Operating Income (PSF)",
                "value": "NET_OPERATING_INCOME_PSF",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Average Monthly Rent Per Unit",
                "placeholder": "Average Monthly Rent Per Unit",
                "value": "AVERAGE_MONTHLY_RENT_PER_UNIT",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Price Per Unit",
                "placeholder": "Price Per Unit",
                "value": "PRICE_PER_UNIT",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            }
        ]
    },
    {
        "name": "Comp Land Information",
        "fields": [
            {
                "name": "Site Area",
                "placeholder": "Site Area",
                "value": "SITE_AREA",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Site Coverage",
                "placeholder": "Site Coverage",
                "value": "SITE_COVERAGE",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Development Proposals",
                "placeholder": "Development Proposals",
                "value": "DEVELOPMENT_PROPOSALS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Size of Land (sqft)",
                "placeholder": "Size of Land (sqft)",
                "value": "SIZE_OF_LAND_SQFT",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Size of Land (acres)",
                "placeholder": "Size of Land (acres)",
                "value": "SIZE_OF_LAND_ACRES",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Size of Buildable Area (sqft)",
                "placeholder": "Size of Buildable Area (sqft)",
                "value": "SIZE_OF_BUILDABLE_AREA_SQFT",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Buildable Units",
                "placeholder": "Buildable Units",
                "value": "BUILDABLE_UNITS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            }
        ]
    },
    {
        "name": "Comp Industrial Information",
        "fields": [
            {
                "name": "Clear Ceiling Height (ft.)",
                "placeholder": "Clear Ceiling Height (ft.)",
                "value": "CLEAR_CEILING_HEIGHT",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Shipping Doors",
                "placeholder": "Shipping Doors",
                "value": "SHIPPING_DOORS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            }
        ]
    },
    {
        "name": "Comp Residential Information",
        "fields": [
            {
                "name": "Price Per Bedroom",
                "placeholder": "Price Per Bedroom",
                "value": "PRICE_PER_BEDROOM",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Bachelor Units",
                "placeholder": "Bachelor Units",
                "value": "BACHELOR_UNITS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "One Bedroom Units",
                "placeholder": "One Bedroom Units",
                "value": "ONE_BEDROOM_UNITS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Two Bedroom Units",
                "placeholder": "Two Bedroom Units",
                "value": "TWO_BEDROOM_UNITS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Three+ Bedroom Units",
                "placeholder": "Three+ Bedroom Units",
                "value": "THREE_PLUS_BEDROOM_UNITS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            },
            {
                "name": "Total Bedrooms",
                "placeholder": "Total Bedrooms",
                "value": "TOTAL_BEDROOMS",
                "anyOfGroups": ["COMPARABLE_SALE"],
                "textType": "block"
            }
        ]
    },
    {
        "name": "Lease Counterparty Information",
        "fields": [
            {
                "name": "Counterparty Name",
                "placeholder": "Counterparty",
                "value": "counterparty_name",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            },
            {
                "name": "Counterparty Address",
                "placeholder": "Address",
                "value": "counterparty_address",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            }
        ]
    },
    {
        "name": "Lease Tenancy Information",
        "fields": [
            {
                "name": "Tenancy Address",
                "placeholder": "Tenancy Address",
                "value": "tenancy_address",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            },
            {
                "name": "Tenancy Size",
                "placeholder": "Tenancy Size",
                "value": "size_square_feet",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            },
            {
                "name": "Tenancy Term",
                "placeholder": "Tenancy Term",
                "value": "term",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            },
            {
                "name": "Rent",
                "placeholder": "Rent (PSF $)",
                "value": "rent_per_square_foot",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            },
            {
                "name": "Additional Rent Terms",
                "placeholder": "Additional Rent Terms",
                "value": "additional_rent_terms",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            },
            {
                "name": "Free Rent",
                "placeholder": "Free Rent",
                "value": "free_rent",
                "anyOfGroups": ["LEASE"],
                "textType": "block"
            }
        ]
    }
];