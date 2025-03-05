# Ron Courville Component Library Technical Assessment

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue.svg)](https://ron-courville-component-library-assessment.vercel.app)  
[![Storybook Docs](https://img.shields.io/badge/Storybook-Docs-brightgreen.svg)](https://component-library-assessment-storybook.vercel.app/?path=/story/ui-datagrid--default)

---

## Overview

Built with **React**, **TypeScript**, **shadcn**, **Turborepo**, **Next.JS**, **PostgreSQL**, and **Supabase**, this component library provides a pluggable data grid with customizable cell renderers and an API-driven multi-user selection component. The architecture prioritizes scalability and modularity for extensible front-ends.

---

## Key Features

### Pluggable Data Grid
- **Schema Defined via JavaScript Object:** Configure grid structure and behavior with ease.
- **Custom Cell Renderers:** Register unique View and Edit components.
- **Efficient Large Data Handling:** Server-side rendering optimizes performance.
- **Seamless Pagination:** Adjacent page pre-caching and rehydration enable fluid navigation.
- **Built-in Search:** Find content quickly with integrated search functionality.
- **Flexible Edit Modes:** Support both row-level and single-cell editing.
- **Highly Customizable:** Tailor the grid with an extensive feature set.

> For more details, see the [DataGrid Component README](https://github.com/roncourville/component-library-assessment/blob/main/packages/ui/src/components/DataGrid/README.md).

### Multi-User Selection Component
- **Addon Integration:** Works seamlessly as part of the pluggable data grid.
- **Multi-Select with Avatars:** Easily choose multiple users with a visual interface.
- **Overflow Handling:** Displays a "+1" indicator when selections exceed available space.
- **Autocomplete Search:** Integrated API search for swift user lookup.

> For more details, see the [UserPicker Component README](https://github.com/roncourville/component-library-assessment/blob/main/packages/ui/src/components/UserPicker/README.md).

---

## System Design

- **Monorepo Architecture:** Powered by Turborepo to share dependencies across projects.
- **Database Integration:** PostgreSQL persists state with full CRUD operations via Supabase.
- **Next.JS Demo App:** Implements server-side actions for real-world use cases.
- **Component Documentation:** Detailed and interactive Storybook documentation.

---

## Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/roncourville/component-library-assessment.git
   cd component-library-assessment

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import DataGrid from "@workspace/ui/components/DataGrid"
```
**Full example usage:** [View Demo](https://github.com/roncourville/component-library-assessment/blob/main/apps/web/app/DataGridExample/index.tsx)