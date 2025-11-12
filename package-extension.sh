#!/bin/bash

# 🚀 GrindTime Extension - Package for Deployment
# This script creates a clean ZIP package ready for Chrome Web Store

echo "🔥 GrindTime Extension - Deployment Packager 🔥"
echo "================================================"
echo ""

# Set colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found!${NC}"
    echo "Please run this script from the GrindTime directory."
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Creating clean build directory...${NC}"

# Create temp directory
TEMP_DIR="../GrindTime-Release"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy all files
cp -r ./* "$TEMP_DIR/"

# Enter temp directory
cd "$TEMP_DIR"

echo -e "${GREEN}✅ Files copied${NC}"
echo ""

echo -e "${YELLOW}🧹 Step 2: Cleaning up development files...${NC}"

# Remove git files
rm -rf .git .gitignore

# Remove documentation that's not needed in the extension
rm -f DEPLOYMENT-GUIDE.md

# Remove HTML preview files
rm -f icons/preview.html icons/generate-png.html

# Remove any test files
rm -f popup/test-popup.js

# Remove node_modules if present
rm -rf node_modules

# Remove any backup files
find . -name "*~" -delete
find . -name "*.bak" -delete
find . -name ".DS_Store" -delete

echo -e "${GREEN}✅ Cleaned up development files${NC}"
echo ""

echo -e "${YELLOW}📊 Step 3: Checking file sizes...${NC}"

# Check total size
TOTAL_SIZE=$(du -sh . | cut -f1)
echo "Total package size: $TOTAL_SIZE"

# List largest files
echo ""
echo "Largest files:"
du -ah . | sort -rh | head -10

echo ""

echo -e "${YELLOW}📋 Step 4: Verifying required files...${NC}"

# Check for required files
REQUIRED_FILES=("manifest.json" "background/background.js" "popup/popup.html" "icons/icon128.png")
MISSING=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ] || [ -f "${file/.png/.svg}" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        MISSING=1
    fi
done

echo ""

# Check for PNG icons
if [ ! -f "icons/icon16.png" ] && [ -f "icons/icon16.svg" ]; then
    echo -e "${YELLOW}⚠️  Warning: Icons are still in SVG format${NC}"
    echo "   Chrome Web Store prefers PNG icons"
    echo "   Consider converting SVG to PNG for better compatibility"
    echo ""
fi

if [ $MISSING -eq 1 ]; then
    echo -e "${RED}❌ Some required files are missing!${NC}"
    echo "Please fix the issues before packaging."
    exit 1
fi

echo -e "${YELLOW}📦 Step 5: Creating ZIP package...${NC}"

# Get version from manifest
VERSION=$(grep -oP '"version":\s*"\K[^"]+' manifest.json)
ZIP_NAME="grindtime-v${VERSION}.zip"

# Create ZIP
cd ..
zip -r "$ZIP_NAME" GrindTime-Release/* -q

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Package created successfully!${NC}"
    echo ""
    echo "================================================"
    echo -e "${GREEN}🎉 SUCCESS! 🎉${NC}"
    echo "================================================"
    echo ""
    echo "Package details:"
    echo "  Name: $ZIP_NAME"
    echo "  Location: $(pwd)/$ZIP_NAME"
    echo "  Size: $(du -h "$ZIP_NAME" | cut -f1)"
    echo ""
    echo "📤 Next steps:"
    echo "  1. Go to: https://chrome.google.com/webstore/devconsole"
    echo "  2. Click 'New Item'"
    echo "  3. Upload: $ZIP_NAME"
    echo "  4. Fill in store listing details"
    echo "  5. Submit for review"
    echo ""
    echo "📖 See DEPLOYMENT-GUIDE.md for detailed instructions"
    echo ""
else
    echo -e "${RED}❌ Failed to create ZIP package${NC}"
    exit 1
fi

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up temp files...${NC}"
# Keep the release directory for inspection
# rm -rf GrindTime-Release

echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo "🔥 Your extension is ready to deploy! 🔥"
