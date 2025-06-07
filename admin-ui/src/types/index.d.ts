// Global type definitions

// Define environment variables for Vite
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add any other global type definitions here