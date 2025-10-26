# Logo Integration Guide

## Overview
Your Screen On Fire logo has been integrated throughout the website. Follow these final steps to complete the setup.

## Steps to Complete

### 1. Save Your Logo Image

Save the logo image you provided (the "Screen On Fire - Cinematic Discovery" logo with the film strip on fire) to your project:

```
public/logo.png
```

**Important:**
- The file must be named exactly `logo.png`
- It should be placed in the `public` folder at the root of your project
- Recommended image specifications:
  - Format: PNG (for transparency support)
  - Size: 512x512 pixels or larger (square aspect ratio works best)
  - Background: Transparent or black to match your dark theme

### 2. Updated Components

The logo has been integrated in the following locations:

1. **Landing Page** (`components/cinematic-landing.tsx`)
   - Header logo in the top navigation bar

2. **Discover Page** (`app/discover/page.tsx`)
   - Header logo in the top navigation bar

3. **Simple Landing** (`components/simple-landing.tsx`)
   - Header logo in the hero section

4. **Enhanced Recommender UI** (`components/enhanced-recommender-ui.tsx`)
   - Header logo in the recommendations page

5. **App Layout** (`app/layout.tsx`)
   - Favicon (browser tab icon)
   - Apple touch icon (for iOS devices)
   - Updated page title to "ScreenOnFire - Cinematic Discovery"

### 3. Verify the Integration

After saving the logo to `public/logo.png`:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Check the following:
   - [ ] Logo appears in the top-left corner of all pages
   - [ ] Logo is visible and not pixelated
   - [ ] Logo maintains proper aspect ratio
   - [ ] Favicon appears in the browser tab
   - [ ] Logo is clickable and redirects to home page

### 4. Troubleshooting

**Logo doesn't appear:**
- Verify the file is named exactly `logo.png` (case-sensitive)
- Ensure it's in the `public` folder (not `public/images` or any subfolder)
- Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for any 404 errors

**Logo looks distorted:**
- Ensure your image is square or at least has consistent dimensions
- Use a PNG file with transparent background
- Minimum recommended size: 512x512 pixels

**Logo is too large/small:**
- The logo is set to display at 32px (mobile) to 40px (desktop)
- If you need to adjust size, edit the `className` in each component file
- Current classes: `w-8 h-8 md:w-10 md:h-10` (8 = 32px, 10 = 40px)

### 5. Optional Enhancements

Consider creating these additional logo variants for better performance:

- `public/logo-192.png` - 192x192 for PWA
- `public/logo-512.png` - 512x512 for PWA
- `public/favicon.ico` - Traditional favicon format

## Code Changes Summary

All logo references have been updated from the yellow "S" placeholder to use your actual logo image:

```tsx
// Before
<div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
  <span className="text-black font-bold text-xl">S</span>
</div>

// After
<img
  src="/logo.png"
  alt="Screen On Fire"
  className="w-10 h-10 object-contain"
/>
```

Or using the OptimizedImage component:

```tsx
<OptimizedImage
  src="/logo.png"
  alt="Screen On Fire"
  width={40}
  height={40}
  className="w-8 h-8 md:w-10 md:h-10 object-contain"
  priority={true}
/>
```

## Next Steps

1. Save your logo as `public/logo.png`
2. Restart the dev server
3. Verify everything looks good
4. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Screen On Fire logo branding"
   ```

Your branding is now complete!
