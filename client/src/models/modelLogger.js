const listeners = new Set();

export function reportModelIssue(message, error) {
    console.error(message, error);
    listeners.forEach((listener) => listener({message, error}));
}

export function subscribeToModelIssues(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
