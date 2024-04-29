module.exports = {
  extends: '@antfu',
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-restricted-syntax': 'off',
    'no-unused-vars': ['off'],
    // 去除if必须换行展示
    'antfu/if-newline': 'off',
    'no-new': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
  },
}
