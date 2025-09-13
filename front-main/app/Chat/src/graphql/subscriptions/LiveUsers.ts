import gql from "graphql-tag"

export const LIVE_USERS_SUBSCRIPTION = gql`
  subscription LiveUsersInChatroom($chatroomId: Float!) {
    liveUsersInChatroom(chatroomId: $chatroomId) {
      id
      first_name
      profile_img
    }
  }
`
