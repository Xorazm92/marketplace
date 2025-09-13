import { gql } from "@apollo/client"

export const GET_USER = gql`
  query GetUser {
    getUser {
        id
        first_name
        profile_img
    }
  }
`