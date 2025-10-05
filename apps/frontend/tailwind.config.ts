import typography from '@tailwindcss/typography';

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              marginTop: '1rem', // Adjust the margin to reduce space above h1
              marginBottom: '0.5rem', // Adjust the margin to reduce space below h1
            },
            h2: {
              marginTop: '0.75rem', // Adjust space above h2
              marginBottom: '0.5rem', // Adjust space below h2
            },
            h3: {
              marginTop: '0.75rem', // Adjust space above h3
              marginBottom: '0.5rem', // Adjust space below h3
            },
            p: {
              marginTop: '0.5rem', // Adjust space above paragraph
              marginBottom: '0.5rem', // Adjust space below paragraph
            },
            ul: {
              marginTop: '0.5rem', // Adjust space above unordered list
              marginBottom: '0.5rem', // Adjust space below unordered list
            },
            li: {
              marginBottom: '0.25rem', // Adjust space between list items
            },
            img: {
              display: 'none', // Hide the images
            },
            figure: {
              marginTop: '1rem', // Add margin above figure elements
              marginBottom: '1rem', // Add margin below figure elements
              textAlign: 'center', // Center figure captions
            },
            figcaption: {
              marginTop: '0.5rem', // Add space above figcaption
              fontStyle: 'italic', // Make figcaption italic
              color: '#6b7280', // Add a lighter color for captions
            },
          },
        },
      },
    },
  },
  plugins: [typography], // Add the typography plugin here
};

export default config;
