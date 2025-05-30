# Resume Tailor App - Component Flow Diagram

```
+---------------------+     +----------------------+     +----------------------+
|                     |     |                      |     |                      |
|   Landing Page      |---->|   Upload Interface   |---->|  Processing Status   |
|                     |     |                      |     |                      |
+---------------------+     +----------------------+     +----------------------+
                                      |                             |
                                      v                             v
                      +--------------------------------+   +----------------------+
                      |                                |   |                      |
                      |   Job Description Analysis     |   |   Resume Parsing     |
                      |                                |   |                      |
                      +--------------------------------+   +----------------------+
                                      |                             |
                                      v                             v
                      +--------------------------------+   +----------------------+
                      |                                |   |                      |
                      |   Resume Tailoring Engine      |<--|   Skills Matching    |
                      |                                |   |                      |
                      +--------------------------------+   +----------------------+
                                      |
                                      v
                      +--------------------------------+   +----------------------+
                      |                                |   |                      |
                      |   Cover Letter Generation      |   |   Document Generator |
                      |                                |-->|                      |
                      +--------------------------------+   +----------------------+
                                                                    |
                                                                    v
                                                          +----------------------+
                                                          |                      |
                                                          |    Results Page      |
                                                          |                      |
                                                          +----------------------+
```

# Next.js Project Structure

```
resume-tailor-app/
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   └── icons/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── upload/
│   │   │   └── page.tsx             # Upload interface
│   │   ├── processing/
│   │   │   └── page.tsx             # Processing status
│   │   └── results/
│   │       └── page.tsx             # Results page
│   ├── components/
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ...
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── resume/                  # Resume-specific components
│   │   │   ├── ResumeUploader.tsx
│   │   │   ├── ResumePreview.tsx
│   │   │   └── ...
│   │   └── job/                     # Job-specific components
│   │       ├── JobDescriptionInput.tsx
│   │       ├── JobUrlInput.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── resume/                  # Resume processing utilities
│   │   │   ├── parser.ts
│   │   │   ├── tailor.ts
│   │   │   └── ...
│   │   ├── job/                     # Job description utilities
│   │   │   ├── scraper.ts
│   │   │   ├── analyzer.ts
│   │   │   └── ...
│   │   ├── cover-letter/            # Cover letter utilities
│   │   │   ├── generator.ts
│   │   │   ├── templates.ts
│   │   │   └── ...
│   │   └── document/                # Document generation utilities
│   │       ├── pdf-generator.ts
│   │       ├── docx-generator.ts
│   │       └── ...
│   ├── hooks/                       # Custom React hooks
│   │   ├── useFileUpload.ts
│   │   ├── useJobAnalysis.ts
│   │   └── ...
│   ├── types/                       # TypeScript type definitions
│   │   ├── Resume.ts
│   │   ├── Job.ts
│   │   └── ...
│   └── api/                         # API routes
│       ├── parse-resume/
│       │   └── route.ts
│       ├── analyze-job/
│       │   └── route.ts
│       ├── generate-cover-letter/
│       │   └── route.ts
│       └── ...
├── tailwind.config.js               # Tailwind CSS configuration
├── next.config.js                   # Next.js configuration
├── package.json                     # Project dependencies
└── tsconfig.json                    # TypeScript configuration
```
