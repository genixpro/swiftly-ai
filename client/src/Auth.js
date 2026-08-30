// The laptop demo deliberately has no third-party identity provider.
// Keep this compatibility surface while legacy screens are migrated.
const Auth = {
    isAdmin: true,
    login() {},
    logout() {},
    isAuthenticated() { return true; },
    getAccessToken() { return null; },
    getIdToken() { return null; },
    handleAuthentication(done) { done('/appraisals'); },
    handleRapidDemoAuth(done) { done('/appraisals'); },
    updateAxiosToken() {},
};

export default Auth;
