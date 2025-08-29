# Project Time & Issue Tracker - Frontend

This is the frontend application for the Project Time & Issue Tracker. It is a modern, responsive web application built with Next.js and React, designed to provide a seamless user interface for interacting with the backend GraphQL API.

## ✨ Features

-   **Modern UI**: Built with Tailwind CSS and shadcn/ui for a clean and responsive user experience.
-   **Component-Based Architecture**: Developed using React with a focus on reusable components.
-   **Type Safety**: Fully written in TypeScript with GraphQL types automatically generated from the backend schema.
-   **Dynamic Data**: Fetches and displays data from the backend using Apollo Client, with full support for queries and mutations.
-   **State Management**: Global state is managed efficiently with Zustand for authentication and UI state.
-   **Real-time Updates**: Integrates with the backend via WebSockets to receive and display live updates on the issues board.
-   **Authentication Flow**: Complete login and signup functionality with JWT handling and automatic token refresh.
-   **Admin Dashboard**: A feature-rich dashboard for administrators to manage users, teams, rates, and view project data.
-   **Core User Features**: Includes a dedicated Time Tracking interface and a real-time Issues board.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Library**: [React](https://reactjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **Data Fetching**: [Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)
-   **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

## 🚀 Getting Started

To get this project up and running on your local machine, please follow the steps below.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
-   The **backend service must be running** locally.
-   [Git](https://git-scm.com/)

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd enablment-front
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the project root. This file will contain the URLs for your local backend service.

    ```dotenv
    # .env.local

    # URL for the backend GraphQL API
    NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

    # URL for the backend WebSocket server
    NEXT_PUBLIC_BACKEND_WEBSOCKET_URL=http://localhost:8080
    ```
    *Note: Ensure the port (`8080`) matches the port your backend service is running on.*

4.  **Download the GraphQL Schema:**
    Before you can generate types, you need to fetch the schema from your running backend.
    ```bash
    npm run download:schema
    ```
    This will create a `schema.graphql` file in your project root.

5.  **Generate GraphQL Types and Hooks:**
    This command uses the schema file to generate all necessary TypeScript types and Apollo Client hooks.
    ```bash
    npm run codegen
    ```
    This will generate the `src/generated/graphql.ts` file.

6.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## 📜 Available Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the codebase using ESLint.
-   `npm run test`: Runs tests using Jest.
-   `npm run download:schema`: Fetches the latest GraphQL schema from the running backend.
-   `npm run codegen`: Generates TypeScript types and hooks from the `schema.graphql` file.

## 🔗 Connecting to the Backend

This frontend is tightly coupled with its backend service. For development, it's essential to keep them in sync.

-   **API Endpoint**: The `NEXT_PUBLIC_BACKEND_URL` environment variable in `.env.local` tells the Apollo Client where to send GraphQL requests.
-   **Schema & Types**:
    1.  Whenever there is a change in the backend's GraphQL API, you must first ensure the backend is running with the latest changes.
    2.  Run `npm run download:schema` to pull the new schema into the frontend project.
    3.  Run `npm run codegen` to update the TypeScript types and Apollo hooks in `src/generated/graphql.ts`.

This workflow ensures that your frontend code is always type-safe and aligned with the current API contract.
