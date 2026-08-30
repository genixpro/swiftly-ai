import _ from 'underscore';

export function updateComparableSearch(currentSearch, field, value) {
    const search = {...currentSearch};
    if (value === null || value === '') {
        if (!_.isUndefined(search[field])) delete search[field];
    } else {
        search[field] = value;
    }
    return search;
}
