#!/bin/bash
# Save this script as setup-logo.sh and run it to copy the logo to all apps
# Usage: ./setup-logo.sh /path/to/logo.png

if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/logo.png"
    echo "Example: $0 ~/Downloads/jiffylaundry-logo.png"
    exit 1
fi

LOGO_PATH="$1"

if [ ! -f "$LOGO_PATH" ]; then
    echo "Error: Logo file not found at $LOGO_PATH"
    exit 1
fi

WORKSPACE="/home/charkes/Documents/jiffylaundry"

echo "Setting up logo in all apps..."

# Create directories if they don't exist
mkdir -p "$WORKSPACE/apps/admin-dashboard/public"
mkdir -p "$WORKSPACE/apps/laundromat-dashboard/public"
mkdir -p "$WORKSPACE/apps/customer-app/assets/images"
mkdir -p "$WORKSPACE/apps/driver-app/assets/images"

# Copy logo to all locations
cp "$LOGO_PATH" "$WORKSPACE/apps/admin-dashboard/public/logo.png"
echo "✓ Admin Dashboard: $WORKSPACE/apps/admin-dashboard/public/logo.png"

cp "$LOGO_PATH" "$WORKSPACE/apps/laundromat-dashboard/public/logo.png"
echo "✓ Laundromat Dashboard: $WORKSPACE/apps/laundromat-dashboard/public/logo.png"

cp "$LOGO_PATH" "$WORKSPACE/apps/customer-app/assets/images/logo.png"
echo "✓ Customer App: $WORKSPACE/apps/customer-app/assets/images/logo.png"

cp "$LOGO_PATH" "$WORKSPACE/apps/driver-app/assets/images/logo.png"
echo "✓ Driver App: $WORKSPACE/apps/driver-app/assets/images/logo.png"

echo ""
echo "✅ Logo setup complete! All apps now have the logo."
