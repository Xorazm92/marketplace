import { gql } from "@apollo/client"

export const CREATE_CHATROOM = gql`
  mutation CreateChatroom($name: String!, $userId: Int!) {
    createChatroom(name: $name, id: $userId) {
      name
      id
    }
  }
`
