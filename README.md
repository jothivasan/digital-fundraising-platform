# Digital Fundraising Platform

A React and Supabase web application that helps entrepreneurs present fundraising projects and lets investors discover, review, and support them through a structured workflow.

## Highlights

- Public landing page and project discovery
- Account registration, login, password reset, and profile management
- Project creation, editing, details, and progress tracking
- Supabase-backed authentication and data storage
- User-management views and responsive reusable UI components

## Built with

React 18, TypeScript, Vite, React Router, and Supabase.

## Local development

Prerequisites: Node.js 18 or later and a Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set the Supabase URL and anonymous key in `.env.local` using the names expected by `lib/supabaseClient.ts`. Never commit `.env.local` or service-role credentials.

Create a production build with `npm run build` and preview it with `npm run preview`.

## Structure

- `components/` – authentication, project, profile, and shared UI components
- `context/` – authentication state
- `lib/` – Supabase client configuration
- `Documentation/` – project analysis and design documentation

## License

Released under the MIT License. See [LICENSE](LICENSE).
