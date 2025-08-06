import { gql } from "@apollo/client"

export const UPDATE_PROFILE = gql`
  mutation updateProfile($first_name: String!, $file: Upload) {
    updateProfile(first_name: $first_name, file: $file) {
      id
      first_name
      profile_img
    }
  }
`
