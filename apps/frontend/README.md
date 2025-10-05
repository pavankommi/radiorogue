Radiorogue Frontend
===================

This is the frontend repository for **Radiorogue**, a bold, direct, and unfiltered blog platform. Built with **Next.js**, the project focuses on delivering a fast and SEO-optimized experience with features like real-time trend-based blogs, dynamic content, and structured data for enhanced reach.

* * * * *

**Table of Contents**
---------------------

-   [Features](#features)
-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Scripts](#scripts)
-   [Project Structure](#project-structure)
-   [Technologies Used](#technologies-used)
-   [License](#license)

* * * * *

**Features**
------------

-   **Next.js**: Leverages the latest version for server-side rendering and performance.
-   **SEO Optimization**: Utilizes `next-sitemap` for dynamic sitemap generation and `JSON-LD` structured data.
-   **Tailwind CSS**: Custom styling with `@tailwindcss/typography`.
-   **Dynamic Metadata**: Generates metadata on the fly for enhanced discoverability.
-   **Sanitized Content**: Protects against XSS vulnerabilities with `sanitize-html`.
-   **Performance Monitoring**: Integrated with Vercel Analytics for speed insights.
-   **Mobile-First Design**: Fully responsive layout tailored for all devices.

* * * * *

**Requirements**
----------------

-   **Node.js**: Version 18 or higher
-   **npm**: Version 8 or higher

* * * * *

**Installation**
----------------

1.  Clone the repository:

    bash

    Copy code

    `git clone https://github.com/your-username/radiorogue-frontend.git`

2.  Navigate to the project directory:

    bash

    Copy code

    `cd radiorogue-frontend`

3.  Install dependencies:

    bash

    Copy code

    `npm install`

* * * * *

**Scripts**
-----------

-   **`npm run dev`**: Start the development server at http://localhost:5000.
-   **`npm run build`**: Build the project for production.
-   **`npm run start`**: Start the production server.
-   **`npm run lint`**: Run linting checks using ESLint.
-   **`npm run postbuild`**: Generate the sitemap after a build.

* * * * *

**Project Structure**
---------------------

ruby

Copy code

`radiorogue-frontend/
├── public/           # Static files
├── src/
│   ├── app/          # Pages and routing (Next.js App Router)
│   ├── components/   # Reusable React components
│   ├── styles/       # Tailwind CSS configuration and global styles
│   ├── utils/        # Utility functions
│   ├── services/     # API integrations and data fetching
├── next.config.mjs   # Next.js configuration
├── postcss.config.mjs # PostCSS configuration
├── tailwind.config.mjs # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration`

* * * * *

**Technologies Used**
---------------------

-   **Frontend Framework**: [Next.js 14](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Utilities**:
    -   [date-fns](https://date-fns.org/) for date manipulation
    -   Cheerio for HTML parsing
    -   [sanitize-html](https://github.com/apostrophecms/sanitize-html) for secure HTML rendering
-   **Analytics**: Vercel Analytics
-   **Icons**: [Heroicons](https://heroicons.com/)
-   **Fingerprinting**: [FingerprintJS](https://fingerprint.com/)

* * * * *

**License**
-----------

This project is licensed under the MIT License. See the LICENSE file for details.

* * * * *

**Contributing**
----------------

Contributions are welcome! Feel free to fork the repository and create a pull request for any feature or issue improvements.