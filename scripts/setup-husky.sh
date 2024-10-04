npx husky init
echo "yarn commitlint \${1}" > .husky/commit-msg
echo "yarn lint-staged" > .husky/pre-commit