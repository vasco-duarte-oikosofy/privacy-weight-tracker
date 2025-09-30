# Momentum: Visual Weight Tracker

A privacy-first, on-device visual weight tracker that helps you monitor your progress with a beautiful chart and encouraging feedback.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/vasco-duarte-oikosofy/private-weight-tracker)

## About The Project

Momentum is a minimalist, mobile-first visual weight tracker designed for simplicity and encouragement. The application operates entirely on the client-side, storing all user data securely in the browser's local storage, ensuring absolute privacy. The core user experience revolves around a single, straightforward question: 'What's your weight today?'. Upon entering their weight, users receive a positive, encouraging message.

The app's main feature is a clean, beautiful bar chart that visualizes weight progression over time. The chart's Y-axis dynamically adjusts to the user's data, providing a clear and scaled view of their journey. The application also includes a history view to see all entries and an option to remove them.

### Key Features

*   **100% Private:** All data is stored exclusively on your device in the browser's local storage. No cloud accounts, no data collection.
*   **Simple & Focused:** A clean, single-page interface designed for quick and easy daily weight logging.
*   **Encouraging Feedback:** Receive a unique, positive message every time you log your weight to keep you motivated.
*   **Beautiful Visualization:** A responsive bar chart visualizes your progress over time, making it easy to see trends.
*   **Dynamic Chart Scaling:** The chart's Y-axis automatically adjusts to your weight range, always providing the best view of your data.
*   **Unit Conversion:** Enter your weight in kilograms (kg) or pounds (lbs); the app automatically converts and stores it in kg for consistency.
*   **Full Data Control:** Easily view your entire weight history and delete any entry at any time.

## Technology Stack

This project is built with a modern, high-performance tech stack:

*   **Framework:** [React](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
*   **Charting:** [Recharts](https://recharts.org/)
*   **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
*   **Deployment:** [Cloudflare Pages & Workers](https://workers.cloudflare.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your machine.

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/momentum-visual-weight-tracker.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd momentum-visual-weight-tracker
    ```
3.  Install dependencies:
    ```sh
    bun install
    ```

### Running the Application

To start the development server, run the following command. The application will be available at `http://localhost:3000`.

```sh
bun run dev
```

## Usage

The application is designed to be intuitive and straightforward:

1.  Open the application in your browser.
2.  In the input form, enter your current weight.
3.  Select the unit of measurement (kg or lbs).
4.  Click the "Log Weight" button.
5.  A success notification with an encouraging message will appear.
6.  The chart and history list will instantly update with your new entry.
7.  To remove an entry, click the trash icon next to it in the history list.

## Development Scripts

*   `bun run dev`: Starts the Vite development server.
*   `bun run build`: Builds the application for production.
*   `bun run lint`: Runs the ESLint linter to check for code quality issues.
*   `bun run deploy`: Deploys the application to Cloudflare.

## Deployment

This project is pre-configured for seamless deployment to the Cloudflare global network via Wrangler.

To deploy your application, simply run the following command:

```sh
bun run deploy
```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/vasco-duarte-oikosofy/private-weight-tracker)

## License

Distributed under the MIT License. See `LICENSE` for more information.