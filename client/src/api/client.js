import axios from 'axios';

const configuredBaseUrl =
    (typeof window !== 'undefined' && window.__SWIFTLY_API_BASE_URL__) ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000';

export const apiBaseUrl = configuredBaseUrl.replace(/\/$/, '');

const apiClient = axios.create({
    baseURL: apiBaseUrl,
});

export function apiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${apiBaseUrl}${normalizedPath}`;
}

export function reportUrl(appraisalId, reportName, format) {
    const formats = { word: 'docx', excel: 'xlsx', detailed_word: 'detailed-docx' };
    const apiFormat = formats[format] || format;
    const path = `/appraisals/${encodeURIComponent(appraisalId)}/reports/${encodeURIComponent(reportName)}`;
    return apiUrl(`${path}?format=${encodeURIComponent(apiFormat)}`);
}

export function fileContentUrl(appraisalId, fileId) {
    return apiUrl(`/appraisals/${encodeURIComponent(appraisalId)}/files/${encodeURIComponent(fileId)}/content`);
}

export function renderedPageUrl(appraisalId, fileId, page) {
    return apiUrl(`/appraisals/${encodeURIComponent(appraisalId)}/files/${encodeURIComponent(fileId)}/rendered-pages/${page}`);
}

export default apiClient;
