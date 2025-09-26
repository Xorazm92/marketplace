import { gql } from "@apollo/client"

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription NewMessage($chatroomId: Float!) {
    newMessage(chatroomId: $chatroomId) {
      id
      content
      imageUrl
      createdAt
      user {
        id
        first_name
        profile_img
      }
    }
  }
`
