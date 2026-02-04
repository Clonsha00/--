---
description: Safely deploys updates to GitHub by building, committing, and pushing.
---
1. **Verify Build Integrity**
   Run the build command to ensure there are no compilation errors before pushing.
   Command: `npm run build`

2. **Stage Changes**
   // turbo
   Stage all modified files for the commit.
   Command: `git add .`

3. **Commit Changes**
   Generate a concise but descriptive commit message summarizing the recent changes (e.g., "feat: Add Dev Mode" or "fix: Bubble shape CSS") and commit.
   Command: `git commit -m "..."`

4. **Push to Remote**
   // turbo
   Push the commits to the configured remote repository.
   Command: `git push`
