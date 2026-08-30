const labels: Record<string, string> = {actual: 'Actuals', budget: 'Budget', user: 'User'};

export default function YearlySourceTypeFormat({value}: {value?: string}) {
    return labels[value ?? ''] ?? '';
}
