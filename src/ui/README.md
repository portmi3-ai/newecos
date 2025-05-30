# AgentEcos UI Component Library

This folder contains reusable UI components, hooks, and styles for the AgentEcos platform. The components are built with React, TypeScript, and Tailwind CSS.

## Component Usage

All components can be imported from the UI library:

```jsx
import { Avatar, Badge, Modal } from '../ui';
// or from the components/ui folder which re-exports ui components
import { Avatar, Badge, Modal } from '../components/ui';
```

## Available Components

- **Avatar**: User avatar with fallback to initials
- **Badge**: Status or label indicators
- **Breadcrumbs**: Navigation breadcrumbs
- **Modal**: Dialog for user interactions
- **Skeleton**: Loading state placeholders
- **Tabs**: Tabbed interface for content organization
- **Tooltip**: Informational hover tooltips

## Hooks

- **useMediaQuery**: Responsive design hook for media queries
- **useLocalStorage**: Persistent state hook using localStorage
- **useClipboard**: Utility hook for copying text to clipboard

## Theme Configuration

The `theme.ts` file contains global design tokens for colors, typography, spacing, and more to ensure consistent styling across the application.

## Integration

This UI library is integrated with the main application components in the `src/components/ui` directory, which re-exports these components with any application-specific customizations.

## Best Practices

1. Use the provided components instead of creating new ones for consistent UI
2. Follow the established design system for colors, spacing, and typography
3. Ensure all components are accessible with proper ARIA attributes
4. Test components in different screen sizes for responsive behavior