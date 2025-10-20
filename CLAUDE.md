# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a media agency website project using Supabase as the backend infrastructure. The project is configured with Supabase MCP server for seamless database and backend operations.

## Supabase Configuration

**Project URL**: `https://dghlytwuslldhogqscho.supabase.co`

The Supabase MCP server is configured in `.mcp.json` and provides tools for:
- Database schema management (migrations, tables, extensions)
- Edge Functions deployment
- SQL execution
- TypeScript type generation
- Development branches for safe schema testing
- Logs and advisories monitoring

## Architecture Principles

### Backend (Supabase)
- Use **migrations** for all DDL operations via `mcp__supabase__apply_migration`
- Use **Edge Functions** for serverless API endpoints and business logic
- Leverage **Row Level Security (RLS)** policies for data access control
- Store media assets in **Supabase Storage** with appropriate access policies

### Frontend
- Build a modern, responsive UI for the media agency
- Integrate with Supabase client library for authentication and data fetching
- Implement proper error handling and loading states
- Use environment variables for Supabase credentials

## Database Schema Considerations

For a media agency website, typical tables include:
- **profiles** - User/client profiles
- **projects** - Media projects/portfolios
- **media_assets** - References to stored media files
- **services** - Agency services offered
- **testimonials** - Client testimonials
- **contact_inquiries** - Contact form submissions

Always apply migrations using the MCP tool and verify with `mcp__supabase__list_migrations`.

## Development Workflow

### Adding Database Changes
1. Use `mcp__supabase__apply_migration` with descriptive snake_case names
2. Always include RLS policies in the same migration
3. Run `mcp__supabase__get_advisors` after DDL changes to check for security issues
4. Generate TypeScript types after schema changes: `mcp__supabase__generate_typescript_types`

### Deploying Edge Functions
1. Create function files following Deno/Supabase Edge Runtime standards
2. Use `mcp__supabase__deploy_edge_function` with all required files
3. Include proper CORS headers and error handling
4. Check logs with `mcp__supabase__get_logs` if issues occur

### Using Branches for Safe Development
- Create branches with `mcp__supabase__create_branch` for testing schema changes
- Test migrations on branches before merging to production
- Use `mcp__supabase__merge_branch` to apply tested changes to production

## Security Best Practices

- **Never commit** the Supabase access token (already in .gitignore as .mcp.json)
- Always enable RLS on tables containing user data
- Run `mcp__supabase__get_advisors` with type "security" regularly
- Use anon key for client-side operations, service role only server-side
- Validate all user inputs in Edge Functions

## Monitoring and Debugging

- Check service logs: `mcp__supabase__get_logs` (supports: api, postgres, auth, storage, realtime, edge-function)
- Logs are only available for the last minute - reproduce issues to capture logs
- Review performance advisors: `mcp__supabase__get_advisors` with type "performance"
- Include remediation URLs from advisors in any issue reports

## Environment Setup

When setting up the project:
1. Initialize the frontend framework (Next.js, React, etc.)
2. Install Supabase client library
3. Configure environment variables for project URL and anon key
4. Set up the database schema via migrations
5. Deploy necessary Edge Functions
6. Configure Supabase Storage buckets for media assets
