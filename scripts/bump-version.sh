#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No color

# Emoji icons
STARTING_ICON="🚀"
SUCCESS_ICON="✅"
ERROR_ICON="👺"
UPDATING_ICON="🌸"

COMMIT_VERSION_UPDATE=true  # Set to false to disable Git commit

json_file="app.json"

# Define the expo_sdk_version variable
expo_sdk_version="051"

# Get the update type argument (major, minor, or patch) and optional --decrement flag
update_type="$1"
decrement_flag="$2"

if [ -z "$update_type" ] || ! [[ "$update_type" =~ ^(major|minor|patch)$ ]]; then
  echo -e "${RED}${ERROR_ICON} Error: Invalid update type. Use one of <major|minor|patch>${NC}"
  exit 1
fi

if [ -n "$decrement_flag" ] && [ "$decrement_flag" != "--decrement" ]; then
  echo -e "${RED}${ERROR_ICON} Error: Invalid option. Use --decrement to decrease the version.${NC}"
  exit 1
fi

if [ ! -f "$json_file" ]; then
  echo -e "${RED}${ERROR_ICON} Error: JSON file not found at path: $json_file${NC}"
  exit 1
fi

echo -e "${GREEN}${STARTING_ICON} Starting the update process... ${STARTING_ICON}${NC}"

current_version=$(jq -r '.expo.version' "$json_file")
current_build_number=$(jq -r '.expo.ios.buildNumber' "$json_file")
current_version_code=$(jq -r '.expo.android.versionCode' "$json_file")

IFS='.' read -r -a version_parts <<< "$current_version"

# Handle the decrement flag (if present, decrement instead of increment)
if [ "$decrement_flag" == "--decrement" ]; then
  case "$update_type" in
    "major")
      if ((version_parts[0] > 1)); then
        ((version_parts[0]--))
        version_parts[1]=0
        version_parts[2]=0
      else
        echo -e "${RED}${ERROR_ICON} Cannot decrement major version below 1.${NC}"
        exit 1
      fi
      ;;
    "minor")
      if ((version_parts[1] > 0)); then
        ((version_parts[1]--))
        version_parts[2]=0
      else
        echo -e "${RED}${ERROR_ICON} Cannot decrement minor version below 0.${NC}"
        exit 1
      fi
      ;;
    "patch")
      if ((version_parts[2] > 0)); then
        ((version_parts[2]--))
      else
        echo -e "${RED}${ERROR_ICON} Cannot decrement patch version below 0.${NC}"
        exit 1
      fi
      ;;
  esac
else
  # If no decrement flag, increment as usual
  case "$update_type" in
    "major")
      ((version_parts[0]++))
      version_parts[1]=0
      version_parts[2]=0
      ;;
    "minor")
      ((version_parts[1]++))
      version_parts[2]=0
      ;;
    "patch")
      ((version_parts[2]++))
      ;;
  esac
fi

# Ensure that version components do not exceed 99
for i in "${!version_parts[@]}"; do
  if ((version_parts[i] > 99)); then
    version_parts[i]=99
  fi
done

new_version="${version_parts[0]}.${version_parts[1]}.${version_parts[2]}"

new_version_code_dynamic="${expo_sdk_version}$(printf "%02d" "${version_parts[0]}")$(printf "%02d" "${version_parts[1]}")$(printf "%02d" "${version_parts[2]}")"

# Update the version, buildNumber, and versionCode fields in the JSON file
jq --arg new_version "$new_version" --arg new_version_code "$new_version_code_dynamic" '.expo.version = $new_version | .expo.ios.buildNumber = $new_version | .expo.android.versionCode = ($new_version_code | tonumber)' "$json_file" > tmp.json && mv tmp.json "$json_file"

prettier --write "$json_file"

echo -e "${GREEN} version, buildNumber and versionCode updated ${UPDATING_ICON}${NC}"
echo -e "${GREEN}${SUCCESS_ICON}${NC} version: $new_version"
echo -e "${GREEN}${SUCCESS_ICON}${NC} buildNumber: $new_version"
echo -e "${GREEN}${SUCCESS_ICON}${NC} versionCode: $new_version_code_dynamic"

if [ "$COMMIT_VERSION_UPDATE" = true ]; then
  git add "$json_file"
  git commit -m "chore: bump version to $new_version"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}${SUCCESS_ICON} Successfully committed version bump to $new_version.${NC}"
  else
    echo -e "${RED}${ERROR_ICON} Failed to create a commit.${NC}"
  fi
fi