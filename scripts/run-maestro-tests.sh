#!/bin/bash

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

MAESTRO_SIM_ID=8345DFD0-7F36-41CA-940C-8DB385222806
SCRIPT_DIR="$(dirname "$0")"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
E2E_DIR="$ROOT_DIR/e2e"

check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}$1 is not installed.${NC}"
    echo -e "${YELLOW}To install $1, run: $2${NC}"
    return 1
  else
    version=$([ -z "$3" ] && $1 --version 2>&1 | head -n 1 || $3 2>&1 | head -n 1)
    echo -e "${GREEN}$1 is installed. Version: $version${NC}"
  fi
}

check_command "maestro" "brew install maestro"
check_command "idb" "brew tap facebook/fb && brew install idb-companion"

echo -e "\n${BOLD}--- Simulator Connection ---${NC}"
echo -e "${YELLOW}Connecting to simulator with ID: $MAESTRO_SIM_ID...${NC}"
if ! idb connect "$MAESTRO_SIM_ID" &> /dev/null; then
  echo -e "${RED}Failed to connect to simulator with ID: $MAESTRO_SIM_ID.${NC}"
  exit 1
else
  echo -e "${GREEN}Successfully connected to simulator with ID: $MAESTRO_SIM_ID.${NC}"
fi

echo -e "\n${BOLD}--- Final Check ---${NC}"
if [[ $? -eq 1 ]]; then
  echo -e "${RED}Some tools are missing. Please install them before proceeding.${NC}"
  exit 1
else
  echo -e "${GREEN}All tools are installed and connected successfully.${NC}"
fi

yaml_files=("$E2E_DIR"/*.yaml)

if [ ${#yaml_files[@]} -eq 0 ]; then
  echo -e "${RED}No test files found in ../e2e/.${NC}"
  exit 1
fi

file_names=()
for file in "${yaml_files[@]}"; do
  file_names+=("$(basename "$file" .yaml)")
done
file_names+=("Run All Tests")

display_menu() {
  clear
  echo -e "${BOLD}Available E2E Test Files:${NC}"
  for i in "${!file_names[@]}"; do
    if [ $i -eq $selected ]; then
      echo -e "${GREEN}> ${file_names[$i]}${NC}"
    else
      echo "  ${file_names[$i]}"
    fi
  done
  echo -e "\n${YELLOW}Use 'p' (previous), 'n' (next) to navigate, and 'Enter' to select.${NC}"
}

selected=0
while true; do
  display_menu
  read -rsn1 key
  case "$key" in
    p) ((selected--)); [ $selected -lt 0 ] && selected=$((${#file_names[@]} - 1)) ;;
    n) ((selected++)); [ $selected -ge ${#file_names[@]} ] && selected=0 ;;
    "") clear; break ;;
  esac
done

if [ "${file_names[$selected]}" == "Run All Tests" ]; then
  echo -e "\n${BOLD}--- Running All Maestro Tests ---${NC}"
  for file in "${yaml_files[@]}"; do
    echo -e "${YELLOW}Running Maestro test for file: $file${NC}"
    maestro test "$file"
  done
else
  selected_file="${yaml_files[$selected]}"
  echo -e "\n${BOLD}--- Running Maestro Test ---${NC}"
  echo -e "${YELLOW}Running Maestro test for file: $selected_file${NC}"
  maestro test "$selected_file"
fi
