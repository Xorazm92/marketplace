import { gql } from "@apollo/client";

export const MESSAGE_DELETED = gql`
  subscription MessageDeleted($chatroomId: Int!) {
    messageDeleted(chatroomId: $chatroomId) {
      id
    }
  }
`;
