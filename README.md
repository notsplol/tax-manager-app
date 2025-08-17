# tax-manager-app
This app is actively in development.

# Overview
This app is a client management system designed with tax professionals and accounting firms in mind. It aims to provide an ultimate solution for managing client information, tracking tax documents, organizing financial records, and streamlining the tax preparation workflow.

## Key Features
- **Client Database**: Maintain detailed client profiles with contact information, tax history, and notes
- **Document Management**: Upload, organize, and securely store tax documents (In development)
- **Tax Year Tracking**: Manage multiple tax years and track preparation status for each client (In development)
- **Deadline Management**: Built-in calendar and reminder system for important tax deadlines (To do)
- **Secure Storage**: Client data protection with encryption and secure authentication (To do)
- **Reporting**: Generate reports on client status, outstanding documents, and revenue tracking (To do)


## Current UI
![App screenshot](./docs/images/tax-app-screen1)

![App screenshot](./docs/images/tax-app-screen2)

![App screenshot](./docs/images/tax-app-screen3)


## Target Users
- Individual tax preparers
- Small to medium accounting firms
- Tax professionals managing multiple clients
- Anyone who needs to organize tax-related client information efficiently

## Technology Stack
- **Frontend**: React with TypeScript for type safety
- **Styling**: Tailwind CSS for responsive and consistent UI design
- **Desktop App**: Electron-based application for cross-platform compatibility
- **Data Storage**: Local database (with plans of cloud backup)

## What I'm Working On
- Document uploading
- Editing client info after they are in the db
- Built-in calendar for tax deadlines

If you'd like to help develop this app, here are the steps you should follow to set up everything on your machine:

This repository uses TypeScript, React (renderer) and Tailwind CSS. The project includes a simple formatting setup so contributors have a consistent code style.

Getting started (for potential contributors)

1. Clone the repo:
```
git clone https://github.com/notsplol/tax-manager-app.git
cd tax-manager-app
```
2. Install dependencies (root and renderer):

   # install root dependencies:

   `npm install`

   # install renderer dependencies (optional, if you work on the renderer explicitly):
   ```
   cd apps/renderer
   npm install
   cd -
   ```
3. Run the app in development mode:

   # Use the root script to run both the main backend and the renderer dev server

    `npm run dev`




### Formatting and linting

This repo uses Prettier for formatting with the `prettier-plugin-tailwindcss` plugin so Tailwind class lists are sorted consistently.

- To format all files (JS/TS/TSX/CSS/MD):

    `npm run format`

- To check formatting without changing files:

    `npm run format:check`

If you're working only in `apps/renderer`, you can run the renderer-local scripts from that folder:

    cd apps/renderer
    npm run format

Some recommendations

- Install the official Prettier extension for your editor and enable format on save.
- Install a Tailwind IntelliSense plugin for class name hints.

Contributing

- Open issues or PRs against `main`.
- Keep commits focused and run `npm run format` before pushing to keep to code tidy.