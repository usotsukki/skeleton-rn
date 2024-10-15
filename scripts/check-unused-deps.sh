#!/bin/bash

# read packages from json and search each package in repo to determine either it's used or not
PACKAGE_JSON_PATH=package.json
packageJson=$(cat $PACKAGE_JSON_PATH)

# fetch only dependencies object
allDependencies=$(echo "$packageJson" | jq -r ".dependencies")

# read  dependency packageName
for packageName in $(echo $allDependencies | jq -r "keys[]"); do
    if ! grep -iqE -r --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules "$packageName" .; then
        # List down the unused package name
        echo "this package: $packageName -> not used"
    fi
done