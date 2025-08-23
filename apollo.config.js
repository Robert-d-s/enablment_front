module.exports = {
  client: {
    service: {
      name: "enablment_front",
      // prefer environment override in Next apps
      url:
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql",
    },
    includes: ["src/**/*.{ts,tsx,js,jsx,graphql,gql}"],
  },
};
