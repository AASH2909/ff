const config = {
  "*.{ts,tsx}": () => ["pnpm lint", "pnpm test"]
};

export default config;
