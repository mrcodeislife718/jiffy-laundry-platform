# JiffyLaundry - Critical Configuration Mismatch Analysis

**Date:** May 9, 2026  
**Severity:** HIGH - Build Infrastructure Issue  

---

## 🚨 ROOT CAUSE IDENTIFIED

### Configuration Mismatch: Package Manager
**Problem:** Root `package.json` specifies pnpm but project using npm  

```json
// package.json specifies:
"packageManager": "pnpm@8.15.0"
"engines": {
  "node": ">=20.0.0",
  "pnpm": ">=8.0.0"
}

// But installation used: npm
```

**Impact:** Conflicting package managers can cause:
- Turbo crashes (SIGSEGV)
- Inconsistent node_modules structure
- Build failures

---

### Configuration Mismatch: App Paths
**Problem:** Build scripts reference wrong paths

```json
{
  "dev:admin": "cd apps/admin-web && npm run dev",      // ❌ Path wrong
  "build:admin": "cd apps/admin-web && npm run build",  // ❌ Path wrong
}

// Actual paths:
apps/admin-dashboard/       // ✅ Current
apps/customer-app/          // ✅ Current
apps/driver-app/            // ✅ Current
apps/laundromat-dashboard/  // ✅ Current
```

**Impact:** Build scripts won't find apps, causing failures

---

### TypeScript Version Conflict
**Problem:** Very high TypeScript version

```json
"typescript": "^6.0.3"  // ❌ Extremely high
                        // Doesn't exist yet (Node v20 max is 5.x)
```

**Impact:** Cannot resolve TypeScript, breaking type checking

---

## ✅ RECOMMENDED FIXES

### Fix 1: Choose Package Manager Strategy

**Option A: Switch to pnpm (Recommended)**
```bash
# Install pnpm globally
npm install -g pnpm@8.15.0

# Clear npm artifacts
rm -rf node_modules package-lock.json

# Use pnpm instead
pnpm install --frozen-lockfile
pnpm run build
```

**Option B: Continue with npm (Current)**
```bash
# Update package.json to specify npm
# Change package.json:
"packageManager": "npm@10.0.0"

# Remove pnpm requirement from engines
# Update build scripts to use correct paths
```

### Fix 2: Correct App Paths in package.json

**Change from:**
```json
"dev:admin": "cd apps/admin-web && npm run dev",
"build:admin": "cd apps/admin-web && npm run build",
"dev:staff": "cd apps/staff-web && npm run dev",
```

**Change to:**
```json
"dev:admin": "cd apps/admin-dashboard && npm run dev",
"build:admin": "cd apps/admin-dashboard && npm run build",
"dev:customer": "cd apps/customer-app && npm run start",
"build:customer": "cd apps/customer-app && npm run build",
"dev:driver": "cd apps/driver-app && npm run start",
"build:driver": "cd apps/driver-app && npm run build",
```

### Fix 3: Fix TypeScript Version

**Change from:**
```json
"typescript": "^6.0.3"  // ❌ Doesn't exist
```

**Change to:**
```json
"typescript": "^5.3.0"  // ✅ Stable, compatible with Node 20
```

**Then reinstall:**
```bash
npm install --legacy-peer-deps
```

---

## 🔧 STEP-BY-STEP RECOVERY PLAN

### Plan A: Fix with npm (Faster)

```bash
# Step 1: Update package.json package manager declaration
# Edit: apps/admin-dashboard/package.json line 1
# Change "packageManager": "pnpm@8.15.0" → "packageManager": "npm@10.0.0"

# Step 2: Fix TypeScript version
# Edit: package.json line ~40
# Change "typescript": "^6.0.3" → "typescript": "^5.3.0"

# Step 3: Fix build script paths
# Edit: package.json scripts section
# Update admin-web → admin-dashboard
# Update staff-web → laundromat-dashboard (or remove if not needed)

# Step 4: Clear and rebuild
cd /home/charkes/Documents/jiffylaundry
rm -rf node_modules package-lock.json .turbo
npm install --legacy-peer-deps --network-timeout=600000
npm run build

# Step 5: Test individual app build
cd apps/admin-dashboard
npx next build
```

### Plan B: Switch to pnpm (Proper)

```bash
# Step 1: Install pnpm globally
npm install -g pnpm@8.15.0

# Step 2: Clean up npm artifacts
rm -rf node_modules package-lock.json

# Step 3: Install with pnpm
cd /home/charkes/Documents/jiffylaundry
pnpm install --frozen-lockfile

# Step 4: Build with turbo through pnpm
pnpm run build

# Step 5: If still issues, debug individually
cd apps/admin-dashboard
pnpm build
```

---

## 📊 CURRENT STATE vs EXPECTED

| Item | Expected | Actual | Issue |
|------|----------|--------|-------|
| Package Manager | pnpm 8.15.0 | npm | ❌ Mismatch |
| Node Version | >=20.0.0 | v20.20.2 | ✅ OK |
| pnpm | >=8.0.0 | not installed | ❌ Not installed |
| Build Tool | Turbo | Turbo (broken) | ❌ Crashing |
| TypeScript | ^5.3.0 | ^6.0.3 | ❌ Version issue |
| Admin Path | apps/admin-web | apps/admin-dashboard | ❌ Wrong path |
| Staff Path | apps/staff-web | apps/laundromat-dashboard | ❌ Wrong path |

---

## 🎯 IMMEDIATE RECOMMENDATION

**Fastest path forward:** Continue with npm by fixing package.json configuration

**Steps:**
1. Update `package.json` packageManager declaration
2. Fix TypeScript version to ^5.3.0
3. Update all build script paths to match actual directories
4. Clear all caches and reinstall
5. Run individual app builds

**Estimated time:** 10-15 minutes

---

## 📝 FILES TO EDIT

### 1. /home/charkes/Documents/jiffylaundry/package.json
**Lines to change:**
- Line ~3: `"packageManager": "npm@10.0.0"`
- Line ~40: `"typescript": "^5.3.0"`
- Line ~19-24: Update build script paths

### 2. Other app package.json files
- Verify consistency across apps

---

## 🚀 VALIDATION CHECKLIST

After applying fixes:
- [ ] npm install completes without errors
- [ ] No TypeScript resolution errors
- [ ] Turbo executes without SIGSEGV
- [ ] Admin dashboard builds successfully
- [ ] All app paths in scripts are correct
- [ ] Individual app builds work
- [ ] Type checking passes

---

**This analysis explains the build infrastructure crashes discovered during audit.**

**Next action:** Apply recommended fixes to package.json configuration.
