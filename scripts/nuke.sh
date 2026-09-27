#!/bin/bash

# Colors and Text Effects
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
CYAN='\033[0;36m'
PURPLE='\033[1;35m'
BOLD='\033[1m'
ITALIC='\033[3m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
cat << "EOF"
                        ____
                __,-~~/~    `---.
              _/_,---(      ,    )
          __ /        <    /   )  \___
- ---===;;;'====------------------===;;;===- -
            \/  ~"~"~"~"~"~\~"~)~"/
            (_ (   \  (     >    \)
              \_( _ <         >_>'
                ~ `-i' ::>|--"
                    I;|.|.|
                    <|i::|i|`.
                  (` ^'"`-' ")

EOF
echo -e "${NC}"

function separator {
  echo -e "${PURPLE}
  ---------------------------------------------${NC}"
}

echo -e "${YELLOW}🔥 Nuking the project... 🔥${NC}"
separator

# Node modules
echo -e "${CYAN}🧹  Cleaning JS dependencies...${NC}"
rm -rf node_modules > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ JS dependencies removed successfully!${NC}"
else
  echo -e "${RED}❌ Failed to remove JS dependencies.${NC}"
fi

separator

# IOS
echo -e "${CYAN}🍎  Cleaning iOS project...${NC}"
if [ -d "ios" ]; then
  cd ios || exit

  pod deintegrate > /dev/null 2>&1
  pod cache clean --all > /dev/null 2>&1
  rm -rf build > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ iOS project cleaned successfully!${NC}"
  else
    echo -e "${RED}❌ Failed to clean iOS project.${NC}"
  fi
  cd ..
else
  echo -e "${RED}❌ 'ios' folder not found. Skipping iOS cleanup.${NC}"
fi

separator

# Xcode Derived Data
echo -e "${CYAN}🗑  Cleaning Xcode Derived Data...${NC}"

rm -rf ~/Library/Developer/Xcode/DerivedData/* > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Xcode Derived Data cleaned successfully!${NC}"
else
  echo -e "${RED}❌ Failed to clean Xcode Derived Data.${NC}"
fi

separator

# Android
echo -e "${CYAN}🤖  Cleaning Android project...${NC}"
if [ -d "android" ]; then
  cd android || exit

  ./gradlew clean > /dev/null 2>&1
  rm -rf build/ > /dev/null 2>&1
  rm -rf .gradle/ > /dev/null 2>&1
  rm -rf app/build/ > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Android project cleaned successfully!${NC}"
  else
    echo -e "${RED}❌ Failed to clean Android project.${NC}"
  fi
  cd ..
else
  echo -e "${RED}❌ 'android' folder not found. Skipping Android cleanup.${NC}"
fi

separator

# Watchman cache
if command -v watchman > /dev/null 2>&1; then
  echo -e "${CYAN}👀  Cleaning Watchman cache...${NC}"
  
  watchman watch-del-all > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Watchman cache cleaned successfully!${NC}"
  else
    echo -e "${RED}❌ Failed to clean Watchman cache.${NC}"
  fi
else
  echo -e "${RED}❌ Watchman not installed. Skipping Watchman cleanup.${NC}"
fi

separator

echo -e "${PURPLE}"
cat << "EOF"
             _               _ 
            | |             | |
 ____  _   _| |  _ _____  __| |
|  _ \| | | | |_/ ) ___ |/ _  |
| | | | |_| |  _ (| ____( (_| |
|_| |_|____/|_| \_)_____)\____|
                               
EOF
echo -e "${NC}"

echo -e "${YELLOW}🚀 ${BOLD}Project nuked!${NC}"
echo -e "${CYAN}You can now run ${BOLD}'yarn install'${NC}${CYAN} to install all dependencies.${NC}"

separator
