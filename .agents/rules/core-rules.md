---
trigger: always_on
---

1. ALWAYS read context.md in the project root before starting any task.

2. ALWAYS update context.md after completing each task. Record what was done, which task got completed, what files were created or modified, and any deviations from the original plan.

3. Work on ONE task at a time. Complete it fully before moving to the next. Do not attempt to implement multiple tasks in a single response.

4. Backend before Frontend. Always build and verify the backend API endpoint for a feature before building its frontend UI (ask the user to run the command or api to check it).

5. After creating any backend endpoint, verify it works correctly using a test (console log, curl, or similar) before proceeding to the frontend (if it is simple do it yourself and if it is big ask the user to do it and show the result).

6. Never delete or overwrite existing working code unless the task explicitly requires it. When in doubt, extend — do not replace and tell the user about it.

7. Follow the exact file structure defined in context.md. Do not create files in locations not specified in the plan without noting the deviation.

8. All database operations must go through Prisma. Do not write raw SQL unless the task explicitly requires it (e.g., analytics aggregations).

9. Every protected API route must have both verifyToken AND requireRole middleware applied. Never leave a route without role enforcement.

10. After completing a phase, do a quick self-check: confirm all files mentioned in the task exist, all imports are correct, and the server starts without errors.

11. If you are uncertain about a requirement, refer to context.md and the original plan(ScrapBridge_Implementation_Plan present in the root). Do not guess — ask for clarification before proceeding.

12. Keep all secrets (JWT_SECRET, DB credentials, email credentials) in the .env file only. Never hardcode them anywhere.

13. When a task is complete, explicitly state: "Task [X.Y] complete. context.md has been updated."

14. Do not add features, libraries, or optimisations not mentioned in the plan unless asked. Stick to the defined tech stack.

15. If a server or build error occurs, fix it completely before moving on. Do not leave broken code and continue to the next task (ask the user to run the build command and show the result). Run the build command only if necessary.
