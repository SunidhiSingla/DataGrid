# Next.js Data Grid Implementation Challenge

## Overview
Build a sophisticated data grid application using Next.js 15 and React 19 that demonstrates your expertise in modern web development practices, state management, and TypeScript.

## Requirements

### Tech Stack
- Next.js 15 with React 19
- TypeScript (strict mode)
- shadcn/ui for UI components
- AG Grid Community for data grid
- nuqs for URL state management
- Bun.js as package manager (preferred)

### Core Features
1. Data Grid Implementation
   - Use sample data from `sample-applications.json` in project root
   - Implement column filtering and sorting
   - Enable column reordering and hiding
   - Add global search functionality
   - Support pagination (20 rows per page default)
   - Add export functionality (Excel, CSV)
   - Array of skils should be displayed in the grid each in their own column just like the other columns in the grid

2. State Management
   - Implement URL-based state management using nuqs
   - URL should reflect:
     - Hidden columns
     - Sort order and column
     - Current page number
     - Active filters
     - Search query
     - Rows per page selection

3. TypeScript
   - Implement proper type definitions
   - Ensure type safety across the application
   - No implicit any types

## Getting Started

1. Create a new public GitHub repository
2. Clone the base project
3. Replace this README with your implementation
4. Share your repository link for review

## Evaluation Criteria
- Code quality and organization
- TypeScript implementation
- Feature completeness
- Build success (zero warnings/errors)
- Git commit history
- Documentation quality

## Implementation Steps

1. **Setup**
   ```bash
   git clone <base-project-url>
   cd <project-directory>
   bun install # or npm install
   ```

2. **Development**
   ```bash
   bun dev # or npm run dev
   ```

3. **Build**
   ```bash
   bun run build # or npm run build
   ```

## Submission
1. Create your public GitHub repository
2. Implement the solution
3. Update README with:
   - Setup instructions
   - Development commands
   - Any additional features/notes
4. Share repository link with us

## Time Expectation
- Take the time you need to deliver quality work
- Focus on implementing all required features
- Ensure thorough documentation

## Questions?
Feel free to reach out if you have any questions or need clarification about the requirements.

## Notes
- Attention to detail in TypeScript implementation is crucial
- Code organization and cleanliness will be evaluated
- Consider edge cases in your implementation
- Write clear documentation for your code

---
*Happy Coding! We look forward to reviewing your implementation.*