import { gql } from "@apollo/client"

export const USER_STARTED_TYPING_MUTATION = gql`
  mutation UserStartedTypingMutation($chatroomId: Float!) {
    userStartedTypingMutation(chatroomId: $chatroomId) {
      id
      first_name
    }
  }
`
