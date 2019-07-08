module.exports = function (api) {
    api.cache(true);

    const presets = [
        "@babel/env",
        "@babel/react"
    ];
    const plugins = [
        "transform-es2015-modules-commonjs",
        "@babel/syntax-dynamic-import",
        "@babel/plugin-proposal-class-properties"
    ];

    return {
        presets,
        plugins
    };
};

