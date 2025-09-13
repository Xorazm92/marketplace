import { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "http://localhost:3001/graphql",
  documents: ["./app/Chat/src/graphql/**/*.ts"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./app/Chat/src/gql/": {
      preset: "client",
      plugins: ["typescript"],
    },
  },
}

export default config
