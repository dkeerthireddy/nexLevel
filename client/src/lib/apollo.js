import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Get API URL from environment
const API_URL = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: API_URL,
});

// Authentication middleware
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage
  const token = localStorage.getItem('authToken');
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors - but don't redirect during rendering
      // Let the AuthContext handle this gracefully
      if (message.includes('Not authenticated') || message.includes('Invalid token')) {

        // Don't do hard redirect here - let AuthContext handle it
        // This prevents interrupting React rendering which causes hooks errors
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Create Apollo Client
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Merge strategies for lists
          myActiveChallenges: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          notifications: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          aiMessages: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          popularChallenges: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Challenge: {
        fields: {
          tasks: {
            // Return a new array to prevent read-only mutations
            read(existing) {
              return existing ? [...existing] : [];
            },
          },
        },
      },
      UserChallenge: {
        fields: {
          partners: {
            read(existing) {
              return existing ? [...existing] : [];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
