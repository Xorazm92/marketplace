import { gql } from "@apollo/client"


export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($chatroomId: Int!, $messageId: Int!) {
    deleteMessage(chatroomId: $chatroomId, messageId: $messageId)
  }
`