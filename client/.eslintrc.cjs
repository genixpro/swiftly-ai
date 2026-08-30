module.exports = {
  env: { browser: true, es2021: true, node: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  // The retained UI is legacy JS. Keep CI focused on correctness regressions
  // while accessibility/style remediation is completed screen by screen.
  rules: {
    "no-undef": "error",
    "no-dupe-keys": "error",
    "no-unreachable": "error",
    "no-debugger": "error",
    "no-constant-condition": "warn",
    "no-unused-vars": "warn"
  },
  ignorePatterns: ["dist/", "public/themes/", "src/modernizr.js"]
};
