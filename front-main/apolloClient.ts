import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
  HttpLink,
  split,
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { onError } from "@apollo/client/link/error";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { setUser } from "@/store/chatUser/chatUserSlice";
import { store } from "@/store/store";
import { getLocalStorage } from "./utils/local-storege";
import { createUploadLink } from "apollo-upload-client";

loadErrorMessages();
loadDevMessages();

// Token refresh logic (mocked – customize if needed)
async function refreshToken(): Promise<string> {
  const newAccessToken = getLocalStorage("accessToken");
  if (!newAccessToken) throw new Error("No access token found.");
  return `Bearer ${newAccessToken}`;
}

let retryCount = 0;
const maxRetry = 3;

// Error handler for token expiration
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === "UNAUTHENTICATED" && retryCount < maxRetry) {
        retryCount++;
        return new Observable((observer) => {
          refreshToken()
            .then((token) => {
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: token,
                },
              }));
              forward(operation).subscribe(observer);
            })
            .catch((error) => observer.error(error));
        });
      }

      if (err.message === "Refresh token not found") {
        console.warn("Refresh token missing – logging user out");
        store.dispatch(
          setUser({
            id: undefined,
            profile_img: null,
            first_name: "",
          })
        );
      }
    }
  }
});

const authLink = setContext((_, { headers }) => {
  const token = getLocalStorage("accessToken");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      "apollo-require-preflight": "true",
    },
  };
});

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  credentials: 'include',
  headers: {
    "apollo-require-preflight": "true",
    "authorization": `Bearer ${getLocalStorage("accessToken")}`,
  },
});

// WebSocket link for subscriptions
const wsLink = typeof window !== "undefined"
  ? new WebSocketLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_WS || `ws://localhost:4000/graphql`,
      options: {
        reconnect: true,
        connectionParams: () => ({
          Authorization: `Bearer ${getLocalStorage("accessToken")}`,
        }),
      },
    })
  : null;

const httpLink = ApolloLink.from([errorLink, authLink, uploadLink]);
const splitLink =
  typeof window !== "undefined" && wsLink
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return def.kind === "OperationDefinition" && def.operation === "subscription";
        },
        wsLink,
        httpLink
      )
    : httpLink;

// Final Apollo Client instance
export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
  credentials: "include",
});
