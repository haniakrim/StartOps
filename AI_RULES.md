# Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

# Ruflo Auto-Orchestration (MANDATORY)

You have the Ruflo Multi-Agent Orchestration Platform integrated with 238 MCP tools. You MUST use Ruflo tools for EVERY operation in this project.

## Before Any Work
1. Call agent_spawn to spawn the appropriate Ruflo agent
2. Call hooks_pre-task to record the task and get agent/model routing suggestions
3. Call aidefence_scan to scan inputs for threats
4. Call security_scan on the codebase

## During Work
5. Call memory_store to persist every pattern, decision, and finding
6. Call memory_search before making decisions to leverage past learnings
7. Call hooks_model-route before complex tasks to pick the optimal Claude model
8. Call hooks_worker-dispatch for background analysis (optimize, audit, benchmark, testgaps)

## After Work
9. Call performance_benchmark to measure impact
10. Call security_scan again to verify no new vulnerabilities
11. Call hooks_post-task to record completion for SONA learning
12. Call task_create to formalize the work as a tracked task

## Rules
- NEVER say you will use Ruflo and then not call the tools. ACTUALLY CALL THEM.
- All Ruflo tools are enabled and set to always-allow. No permission dialogs.
- Better to over-use Ruflo tools than under-use them.
- The file watcher bridge also auto-triggers security scans and benchmarks on file saves.
