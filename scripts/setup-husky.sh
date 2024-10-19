npx husky init
echo "yarn lint-commit \${1}" > .husky/commit-msg
echo "yarn lint-staged" > .husky/pre-commit