
export default [
    {
        "name": "General",
        "fields": [
            {
                "name": "Date",
                "placeholder": "Date",
                "field": "date"
            }
        ]
    },
    {
        "name": "Income",
        "multiple": true,
        "field": "income",
        "fields": [
            {
                "name": "Name",
                "placeholder": "Name",
                "field": "income_name"
            },
            {
                "name": "Amount",
                "placeholder": "Amount",
                "field": "income_amount"
            }
        ]
    },
    {
        "name": "Expenses",
        "multiple": true,
        "field": "expense",
        "fields": [
            {
                "name": "Name",
                "placeholder": "Name",
                "field": "expense_name"
            },
            {
                "name": "Amount",
                "placeholder": "Amount",
                "field": "expense_amount"
            }
        ]
    }
];