/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation AddUsersToChatroom($chatroomId: Float!, $userIds: [Float!]!) {\n    addUsersToChatroom(chatroomId: $chatroomId, userIds: $userIds) {\n      name\n      id\n    }\n  }\n": typeof types.AddUsersToChatroomDocument,
    "\n  mutation CreateChatroom($name: String!, $userId: Int!) {\n    createChatroom(name: $name, id: $userId) {\n      name\n      id\n    }\n  }\n": typeof types.CreateChatroomDocument,
    "\n  mutation DeleteChatroom($chatroomId: Float!) {\n    deleteChatroom(chatroomId: $chatroomId)\n  }\n": typeof types.DeleteChatroomDocument,
    "\n  mutation DeleteMessage($chatroomId: Int!, $messageId: Int!) {\n    deleteMessage(chatroomId: $chatroomId, messageId: $messageId)\n  }\n": typeof types.DeleteMessageDocument,
    "\n  mutation EnterChatroom($chatroomId: Float!) {\n    enterChatroom(chatroomId: $chatroomId)\n  }\n": typeof types.EnterChatroomDocument,
    "\n  mutation LeaveChatroom($chatroomId: Float!) {\n    leaveChatroom(chatroomId: $chatroomId)\n  }\n": typeof types.LeaveChatroomDocument,
    "\n  mutation SendMessage($chatroomId: Float!, $content: String!, $image: Upload) {\n    sendMessage(chatroomId: $chatroomId, content: $content, image: $image) {\n      id\n      content\n      imageUrl\n      user {\n        id\n        first_name\n      }\n    }\n  }\n": typeof types.SendMessageDocument,
    "\n  mutation updateProfile($first_name: String!, $file: Upload) {\n    updateProfile(first_name: $first_name, file: $file) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation UserStartedTypingMutation($chatroomId: Float!) {\n    userStartedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n": typeof types.UserStartedTypingMutationDocument,
    "\n  mutation UserStoppedTypingMutation($chatroomId: Float!) {\n    userStoppedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n": typeof types.UserStoppedTypingMutationDocument,
    "\n  query GetChatroomsForUser {\n    getChatroomsForUser {\n      id\n      name\n      messages {\n        id\n        content\n        createdAt\n        user {\n          id\n          first_name\n        }\n      }\n      users {\n        profile_img\n        id\n        first_name\n      }\n    }\n  }\n": typeof types.GetChatroomsForUserDocument,
    "\n  query GetMessagesForChatroom($chatroomId: Float!) {\n    getMessagesForChatroom(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n      chatroom {\n        id\n        name\n        users {\n          id\n          first_name\n          profile_img\n        }\n      }\n    }\n  }\n": typeof types.GetMessagesForChatroomDocument,
    "\n  query GetUser {\n    getUser {\n        id\n        first_name\n        profile_img\n    }\n  }\n": typeof types.GetUserDocument,
    "\n  query GetUsersOfChatroom($chatroomId: Float!) {\n    getUsersOfChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": typeof types.GetUsersOfChatroomDocument,
    "\n  query SearchUsers($first_name: String!) {\n    searchUsers(first_name: $first_name) {\n      id\n      first_name\n    }\n  }\n": typeof types.SearchUsersDocument,
    "\n  subscription LiveUsersInChatroom($chatroomId: Float!) {\n    liveUsersInChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": typeof types.LiveUsersInChatroomDocument,
    "\n  subscription MessageDeleted($chatroomId: Int!) {\n    messageDeleted(chatroomId: $chatroomId) {\n      id\n    }\n  }\n": typeof types.MessageDeletedDocument,
    "\n  subscription NewMessage($chatroomId: Float!) {\n    newMessage(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n    }\n  }\n": typeof types.NewMessageDocument,
    "\n  subscription UserStartedTyping($chatroomId: Float!, $userId: Float!) {\n    userStartedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": typeof types.UserStartedTypingDocument,
    "\n  subscription UserStoppedTyping($chatroomId: Float!, $userId: Float!) {\n    userStoppedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": typeof types.UserStoppedTypingDocument,
};
const documents: Documents = {
    "\n  mutation AddUsersToChatroom($chatroomId: Float!, $userIds: [Float!]!) {\n    addUsersToChatroom(chatroomId: $chatroomId, userIds: $userIds) {\n      name\n      id\n    }\n  }\n": types.AddUsersToChatroomDocument,
    "\n  mutation CreateChatroom($name: String!, $userId: Int!) {\n    createChatroom(name: $name, id: $userId) {\n      name\n      id\n    }\n  }\n": types.CreateChatroomDocument,
    "\n  mutation DeleteChatroom($chatroomId: Float!) {\n    deleteChatroom(chatroomId: $chatroomId)\n  }\n": types.DeleteChatroomDocument,
    "\n  mutation DeleteMessage($chatroomId: Int!, $messageId: Int!) {\n    deleteMessage(chatroomId: $chatroomId, messageId: $messageId)\n  }\n": types.DeleteMessageDocument,
    "\n  mutation EnterChatroom($chatroomId: Float!) {\n    enterChatroom(chatroomId: $chatroomId)\n  }\n": types.EnterChatroomDocument,
    "\n  mutation LeaveChatroom($chatroomId: Float!) {\n    leaveChatroom(chatroomId: $chatroomId)\n  }\n": types.LeaveChatroomDocument,
    "\n  mutation SendMessage($chatroomId: Float!, $content: String!, $image: Upload) {\n    sendMessage(chatroomId: $chatroomId, content: $content, image: $image) {\n      id\n      content\n      imageUrl\n      user {\n        id\n        first_name\n      }\n    }\n  }\n": types.SendMessageDocument,
    "\n  mutation updateProfile($first_name: String!, $file: Upload) {\n    updateProfile(first_name: $first_name, file: $file) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation UserStartedTypingMutation($chatroomId: Float!) {\n    userStartedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n": types.UserStartedTypingMutationDocument,
    "\n  mutation UserStoppedTypingMutation($chatroomId: Float!) {\n    userStoppedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n": types.UserStoppedTypingMutationDocument,
    "\n  query GetChatroomsForUser {\n    getChatroomsForUser {\n      id\n      name\n      messages {\n        id\n        content\n        createdAt\n        user {\n          id\n          first_name\n        }\n      }\n      users {\n        profile_img\n        id\n        first_name\n      }\n    }\n  }\n": types.GetChatroomsForUserDocument,
    "\n  query GetMessagesForChatroom($chatroomId: Float!) {\n    getMessagesForChatroom(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n      chatroom {\n        id\n        name\n        users {\n          id\n          first_name\n          profile_img\n        }\n      }\n    }\n  }\n": types.GetMessagesForChatroomDocument,
    "\n  query GetUser {\n    getUser {\n        id\n        first_name\n        profile_img\n    }\n  }\n": types.GetUserDocument,
    "\n  query GetUsersOfChatroom($chatroomId: Float!) {\n    getUsersOfChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": types.GetUsersOfChatroomDocument,
    "\n  query SearchUsers($first_name: String!) {\n    searchUsers(first_name: $first_name) {\n      id\n      first_name\n    }\n  }\n": types.SearchUsersDocument,
    "\n  subscription LiveUsersInChatroom($chatroomId: Float!) {\n    liveUsersInChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": types.LiveUsersInChatroomDocument,
    "\n  subscription MessageDeleted($chatroomId: Int!) {\n    messageDeleted(chatroomId: $chatroomId) {\n      id\n    }\n  }\n": types.MessageDeletedDocument,
    "\n  subscription NewMessage($chatroomId: Float!) {\n    newMessage(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n    }\n  }\n": types.NewMessageDocument,
    "\n  subscription UserStartedTyping($chatroomId: Float!, $userId: Float!) {\n    userStartedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": types.UserStartedTypingDocument,
    "\n  subscription UserStoppedTyping($chatroomId: Float!, $userId: Float!) {\n    userStoppedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n": types.UserStoppedTypingDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddUsersToChatroom($chatroomId: Float!, $userIds: [Float!]!) {\n    addUsersToChatroom(chatroomId: $chatroomId, userIds: $userIds) {\n      name\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation AddUsersToChatroom($chatroomId: Float!, $userIds: [Float!]!) {\n    addUsersToChatroom(chatroomId: $chatroomId, userIds: $userIds) {\n      name\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateChatroom($name: String!, $userId: Int!) {\n    createChatroom(name: $name, id: $userId) {\n      name\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateChatroom($name: String!, $userId: Int!) {\n    createChatroom(name: $name, id: $userId) {\n      name\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteChatroom($chatroomId: Float!) {\n    deleteChatroom(chatroomId: $chatroomId)\n  }\n"): (typeof documents)["\n  mutation DeleteChatroom($chatroomId: Float!) {\n    deleteChatroom(chatroomId: $chatroomId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteMessage($chatroomId: Int!, $messageId: Int!) {\n    deleteMessage(chatroomId: $chatroomId, messageId: $messageId)\n  }\n"): (typeof documents)["\n  mutation DeleteMessage($chatroomId: Int!, $messageId: Int!) {\n    deleteMessage(chatroomId: $chatroomId, messageId: $messageId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EnterChatroom($chatroomId: Float!) {\n    enterChatroom(chatroomId: $chatroomId)\n  }\n"): (typeof documents)["\n  mutation EnterChatroom($chatroomId: Float!) {\n    enterChatroom(chatroomId: $chatroomId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LeaveChatroom($chatroomId: Float!) {\n    leaveChatroom(chatroomId: $chatroomId)\n  }\n"): (typeof documents)["\n  mutation LeaveChatroom($chatroomId: Float!) {\n    leaveChatroom(chatroomId: $chatroomId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendMessage($chatroomId: Float!, $content: String!, $image: Upload) {\n    sendMessage(chatroomId: $chatroomId, content: $content, image: $image) {\n      id\n      content\n      imageUrl\n      user {\n        id\n        first_name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SendMessage($chatroomId: Float!, $content: String!, $image: Upload) {\n    sendMessage(chatroomId: $chatroomId, content: $content, image: $image) {\n      id\n      content\n      imageUrl\n      user {\n        id\n        first_name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation updateProfile($first_name: String!, $file: Upload) {\n    updateProfile(first_name: $first_name, file: $file) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"): (typeof documents)["\n  mutation updateProfile($first_name: String!, $file: Upload) {\n    updateProfile(first_name: $first_name, file: $file) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UserStartedTypingMutation($chatroomId: Float!) {\n    userStartedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n"): (typeof documents)["\n  mutation UserStartedTypingMutation($chatroomId: Float!) {\n    userStartedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UserStoppedTypingMutation($chatroomId: Float!) {\n    userStoppedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n"): (typeof documents)["\n  mutation UserStoppedTypingMutation($chatroomId: Float!) {\n    userStoppedTypingMutation(chatroomId: $chatroomId) {\n      id\n      first_name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetChatroomsForUser {\n    getChatroomsForUser {\n      id\n      name\n      messages {\n        id\n        content\n        createdAt\n        user {\n          id\n          first_name\n        }\n      }\n      users {\n        profile_img\n        id\n        first_name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetChatroomsForUser {\n    getChatroomsForUser {\n      id\n      name\n      messages {\n        id\n        content\n        createdAt\n        user {\n          id\n          first_name\n        }\n      }\n      users {\n        profile_img\n        id\n        first_name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMessagesForChatroom($chatroomId: Float!) {\n    getMessagesForChatroom(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n      chatroom {\n        id\n        name\n        users {\n          id\n          first_name\n          profile_img\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMessagesForChatroom($chatroomId: Float!) {\n    getMessagesForChatroom(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n      chatroom {\n        id\n        name\n        users {\n          id\n          first_name\n          profile_img\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUser {\n    getUser {\n        id\n        first_name\n        profile_img\n    }\n  }\n"): (typeof documents)["\n  query GetUser {\n    getUser {\n        id\n        first_name\n        profile_img\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUsersOfChatroom($chatroomId: Float!) {\n    getUsersOfChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"): (typeof documents)["\n  query GetUsersOfChatroom($chatroomId: Float!) {\n    getUsersOfChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsers($first_name: String!) {\n    searchUsers(first_name: $first_name) {\n      id\n      first_name\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($first_name: String!) {\n    searchUsers(first_name: $first_name) {\n      id\n      first_name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription LiveUsersInChatroom($chatroomId: Float!) {\n    liveUsersInChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"): (typeof documents)["\n  subscription LiveUsersInChatroom($chatroomId: Float!) {\n    liveUsersInChatroom(chatroomId: $chatroomId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription MessageDeleted($chatroomId: Int!) {\n    messageDeleted(chatroomId: $chatroomId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  subscription MessageDeleted($chatroomId: Int!) {\n    messageDeleted(chatroomId: $chatroomId) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription NewMessage($chatroomId: Float!) {\n    newMessage(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription NewMessage($chatroomId: Float!) {\n    newMessage(chatroomId: $chatroomId) {\n      id\n      content\n      imageUrl\n      createdAt\n      user {\n        id\n        first_name\n        profile_img\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription UserStartedTyping($chatroomId: Float!, $userId: Float!) {\n    userStartedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"): (typeof documents)["\n  subscription UserStartedTyping($chatroomId: Float!, $userId: Float!) {\n    userStartedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription UserStoppedTyping($chatroomId: Float!, $userId: Float!) {\n    userStoppedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"): (typeof documents)["\n  subscription UserStoppedTyping($chatroomId: Float!, $userId: Float!) {\n    userStoppedTyping(chatroomId: $chatroomId, userId: $userId) {\n      id\n      first_name\n      profile_img\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;