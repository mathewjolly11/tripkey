# TripKey Landing Page

A modern, professional landing page for TripKey - One QR for Your Entire Trip.

## 🎨 Design Features

- **Sky Blue Theme**: Professional SaaS-style color palette with sky blue primary colors
- **Fully Responsive**: Mobile-first design that looks great on all devices
- **Modern UI**: Clean, minimalist design with smooth animations and interactions
- **Reusable Components**: Well-structured React components for easy maintenance

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - For type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach

## 📋 Sections

1. **Navigation Bar** - Sticky navbar with logo, links, and auth buttons
2. **Hero Section** - Eye-catching intro with CTA buttons and illustrations
3. **Problem Section** - Highlights key tourist pain points
4. **Solution Section** - Explains how TripKey works in 3 steps
5. **Stakeholders Section** - Shows value for tourists, providers, and authorities
6. **Features Section** - Showcases 6 key features with icons
7. **Call-to-Action Section** - Gradient section with signup buttons
8. **Footer** - Complete footer with links and social media

## 🎯 Color Palette

- **Primary**: Sky Blue `#0EA5E9`
- **Secondary**: Light Sky `#38BDF8`
- **Background**: White with soft blue gradients
- **Accent**: Very Light Blue `#E0F2FE`
- **Text**: Dark Gray

## 📦 Project Structure

```
tripkey/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Navbar.tsx          # Navigation component
│   ├── Hero.tsx            # Hero section
│   ├── ProblemSection.tsx   # Problem cards
│   ├── SolutionSection.tsx  # How it works
│   ├── StakeholdersSection.tsx # Stakeholders
│   ├── FeaturesSection.tsx  # Features grid
│   ├── CTASection.tsx       # Call-to-action
│   └── Footer.tsx           # Footer
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.js
└── .gitignore
```

## � Documentation

**👉 [START_HERE.md](START_HERE.md)** - Overview of all guides (read this first!)

Then choose your path:

| Document | Best For | Time |
|----------|----------|------|
| **[☑️ Setup Checklist](SETUP_CHECKLIST.md)** | Step-by-step with checkboxes | 30 min |
| **[🔐 Step-by-Step Guide](GOOGLE_LOGIN_STEPBYSTEP.md)** | Detailed walkthrough | 20 min |
| **[🎯 Quick Reference](SETUP_QUICK_REFERENCE.md)** | Copy-paste values | 5 min |
| **[📍 Documentation Map](DOCUMENTATION_MAP.md)** | Finding what to read | 2 min |
| **[📖 Overview](DOCUMENTATION_OVERVIEW.md)** | See all documentation | 5 min |
| [Quick Start](QUICK_START.md) | Get it running | 5 min |
| [Database Setup](SUPABASE_SETUP.md) | Supabase configuration | 15 min |
| [Implementation Details](GOOGLE_OAUTH_IMPLEMENTATION.md) | Code changes | 5 min |

---

## �🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn installed

### Installation

1. **Navigate to the project folder**:
   ```bash
   cd tripkey
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 📱 Responsive Breakpoints

- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

All components are optimized for mobile-first experience with graceful scaling.

## ✨ Key Features

### Animations
- Fade-in animations for sections
- Slide-up animations for cards
- Smooth hover effects on buttons and cards
- Scale transformations on interaction

### Component Reusability
- Button styles: `.btn-primary`, `.btn-secondary`, `.btn-outline`
- Card styling: `.card-base` with hover effects
- Gradient utilities: `.gradient-sky`, `.text-gradient`
- Layout helpers: `.container-max`, `.section-padding`

### Performance
- Optimized images and SVG illustrations
- CSS animations for smooth interactions
- Next.js built-in optimizations

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  sky: {
    50: "#E0F2FE",
    500: "#0EA5E9",
    600: "#0284C7",
  }
}
```

### Modify Content
All text content is in the component files - simply edit the strings.

### Add New Sections
1. Create a new component in `components/`
2. Import and add it to `app/page.tsx`

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Support

For questions or suggestions, please reach out to the TripKey team.

---

**Built with ❤️ for modern travel experiences**
