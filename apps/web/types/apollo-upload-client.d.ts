declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client/core';
  import { HttpOptions } from '@apollo/client/link/http';

  export function createUploadLink(options?: HttpOptions): ApolloLink;
}
