import { gql } from "@apollo/client"

export const SEARCH_USERS = gql`
  query SearchUsers($first_name: String!) {
    searchUsers(first_name: $first_name) {
      id
      first_name
    }
  }
`
