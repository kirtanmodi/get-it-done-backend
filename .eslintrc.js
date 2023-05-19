module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    rules: {
        'no-underscore-dangle': ['error', { allow: ['_source', '_id', '_doc'] }],
        'consistent-return': 0,
        'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    },
};
