# Nuxt 4 Frontend

A modern frontend application built with Nuxt 4, featuring the latest Vue.js ecosystem tools.

## 🚀 Features

- **Nuxt 4** - Latest version with Vue 3.5+
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Vite** - Lightning-fast build tool
- **Auto-imports** - Components, composables, and utilities
- **File-based routing** - Intuitive page structure

## 📁 Project Structure

```
frontend/
├── app/                 # App configuration
├── assets/             # Static assets
│   └── css/           # Global styles
├── components/         # Vue components
├── composables/        # Vue composables
├── layouts/           # Layout components
├── middleware/        # Route middleware
├── pages/             # File-based routing
├── plugins/           # Nuxt plugins
├── stores/            # Pinia stores
├── types/             # TypeScript types
├── utils/             # Utility functions
└── nuxt.config.ts     # Nuxt configuration
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build

## 🔧 Configuration

The app is configured in `nuxt.config.ts` with:

- Tailwind CSS integration
- Pinia state management
- Custom CSS utilities
- Runtime configuration for API endpoints

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
API_BASE_URL=http://localhost:3000
NUXT_PUBLIC_APP_NAME="Nuxt 4 Frontend"
NUXT_PUBLIC_APP_VERSION="1.0.0"
```

## 🎨 Styling

The project uses Tailwind CSS with custom utilities defined in `assets/css/main.css`:

- `.container` - Responsive container
- `.btn` - Primary button style
- `.btn-secondary` - Secondary button style

## 📚 Learn More

- [Nuxt 4 Documentation](https://nuxt.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)
