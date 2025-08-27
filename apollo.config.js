module.exports = {
  client: {
    service: {
      name: "enablment_front",
      localSchemaFile: "./schema.graphql",
    },
    includes: ["src/**/*.{ts,tsx,js,jsx,graphql,gql}"],
  },
};
