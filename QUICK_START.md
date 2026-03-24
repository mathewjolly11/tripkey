# TripKey Landing Page - Quick Start Guide

## 📦 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure Overview

```
tripkey/
├── app/
│   ├── globals.css       # Global styles + Tailwind directives
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Main landing page (combines all components)
│
├── components/           # Reusable React components
│   ├── Navbar.tsx        # Navigation with mobile menu
│   ├── Hero.tsx          # Hero section with title & CTA
│   ├── ProblemSection.tsx # Problem cards (3 cards)
│   ├── SolutionSection.tsx # How it works (3 steps)
│   ├── StakeholdersSection.tsx # Stakeholders (3 cards)
│   ├── FeaturesSection.tsx # Features grid (6 features)
│   ├── CTASection.tsx    # Call-to-action with gradient
│   └── Footer.tsx        # Footer with links & socials
│
├── Configuration Files
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── next.config.js
│   ├── .eslintrc.json
│   └── .gitignore
│
└── Documentation
    └── README.md
```

## 🎨 Design System

### Colors
- **Sky Blue**: `#0EA5E9` (Primary)
- **Light Sky**: `#38BDF8` (Secondary)  
- **Very Light Blue**: `#E0F2FE` (Accent)
- **Dark Gray**: `#1F2937` (Text)

### Typography
- Font: System fonts (optimized for all platforms)
- Sizes: 
  - Hero: `text-6xl` (desktop) → `text-4xl` (mobile)
  - Headings: `text-2xl` to `text-5xl`
  - Body: `text-base` to `text-lg`

### Spacing
- Container: `max-w-7xl mx-auto`
- Section padding: `py-16 sm:py-20 lg:py-24`
- Gap between items: `gap-4` to `gap-12`

### Buttons
```html
<!-- Primary Button -->
<button class="btn-primary">Get Started</button>

<!-- Secondary Button -->
<button class="btn-secondary">Learn More</button>

<!-- Outline Button -->
<button class="btn-outline">Login</button>
```

## 🔧 Customization Guide

### 1. Change Primary Color
Edit `tailwind.config.ts`:
```typescript
colors: {
  sky: {
    50: "#YOUR_LIGHT_COLOR",
    500: "#YOUR_PRIMARY_COLOR",
    600: "#YOUR_DARK_COLOR",
  }
}
```

### 2. Update Logo
In `components/Navbar.tsx`, replace the SVG with your logo.

### 3. Modify Content
All text is in individual component files. Simply edit the strings:
- Hero title → `components/Hero.tsx`
- Feature descriptions → `components/FeaturesSection.tsx`
- Footer links → `components/Footer.tsx`

### 4. Add New Sections
1. Create `components/NewSection.tsx`
2. Import in `app/page.tsx`
3. Add to the JSX

### 5. Change Navigation Links
Edit `components/Navbar.tsx` - update the Link href values.

### 6. Adjust Responsive Breakpoints
Tailwind breakpoints:
```
sm: 640px
md: 768px  
lg: 1024px
xl: 1280px
2xl: 1536px
```

Use them in classes: `sm:text-lg md:text-2xl lg:text-3xl`

## 🎭 Animation Possibilities

Currently implemented:
- `animate-fade-in` - Fade in effect
- `animate-slide-up` - Slide up animation
- `hover:scale-105` - Scale on hover
- `hover:shadow-xl` - Shadow on hover
- `active:scale-95` - Scale when clicked

Add more in `tailwind.config.ts` under `animation` and `keyframes`.

## 📊 Page Sections Breakdown

| Section | Purpose | Components |
|---------|---------|-----------|
| Navbar | Navigation & Auth | Logo, Links, Buttons |
| Hero | Introduction | Title, Subtitle, CTA, Illustration |
| Problem | Pain Points | 3 Problem Cards |
| Solution | How-To Guide | 3 Step Cards, Timeline |
| Stakeholders | Value Props | 3 Stakeholder Cards |
| Features | Key Benefits | 6 Feature Cards + Highlights |
| CTA | Conversion | Title, Buttons, Trust Badges |
| Footer | Links & Info | Navigation, Social, Legal |

## 🚀 Performance Tips

1. **Lazy Load Images**: Use `next/image` for images
2. **Code Splitting**: Components are already optimized
3. **CSS Optimization**: Tailwind automatically purges unused styles
4. **Font Optimization**: System fonts are loaded automatically

## 📱 Mobile Responsiveness

- All sections use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern
- Padding adjusts: `p-4 sm:p-6 md:p-8`
- Text scales: `text-2xl sm:text-3xl lg:text-5xl`
- Navigation collapses into mobile menu

## 🔐 Security Features

- No external dependencies for core functionality
- Built-in Next.js security headers
- Type-safe with TypeScript
- ESLint configured for best practices

## 🆘 Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Styles not loading
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Component not showing
1. Check import path is correct
2. Verify component is exported as default
3. Check for TypeScript errors

## 📝 Next Steps

1. Connect auth buttons to your login/signup pages
2. Add form validation for CTAs
3. Integrate analytics (Google Analytics, etc.)
4. Add actual booking functionality
5. Set up email newsletter signup
6. Deploy to Vercel, AWS, or your preferred platform

## 🤝 Need Help?

- Check `README.md` for more details
- Review component files for inline documentation
- Tailwind CSS docs: https://tailwindcss.com/docs
- Next.js docs: https://nextjs.org/docs

---

**Happy Building! 🚀**
