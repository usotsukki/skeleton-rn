echo " 🕳  Attempting to clean JS deps..."
rm -rf node_modules  > /dev/null 2>&1 || true
echo "Done. "

echo " 🕳  Attempting to clean IOS project"
cd ios
pod deintegrate  > /dev/null 2>&1 || true
pod cache clean --all  > /dev/null 2>&1 || true
rm -rf build  > /dev/null 2>&1 || true
cd ..
echo "Done. "


echo "Clean up complete. You can now run 'yarn fast' to install all the app dependencies."