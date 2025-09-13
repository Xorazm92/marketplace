/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type Chatroom = {
  __typename?: 'Chatroom';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  messages?: Maybe<Array<Message>>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  users?: Maybe<Array<User>>;
};

export type Message = {
  __typename?: 'Message';
  chatroom?: Maybe<Chatroom>;
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addUsersToChatroom: Chatroom;
  createChatroom: Chatroom;
  deleteChatroom: Scalars['String']['output'];
  deleteMessage: Scalars['Float']['output'];
  enterChatroom: Scalars['Boolean']['output'];
  leaveChatroom: Scalars['Boolean']['output'];
  sendMessage: Message;
  updateProfile: User;
  userStartedTypingMutation: User;
  userStoppedTypingMutation: User;
};


export type MutationAddUsersToChatroomArgs = {
  chatroomId: Scalars['Float']['input'];
  userIds: Array<Scalars['Float']['input']>;
};


export type MutationCreateChatroomArgs = {
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};


export type MutationDeleteChatroomArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type MutationDeleteMessageArgs = {
  chatroomId: Scalars['Int']['input'];
  messageId: Scalars['Int']['input'];
};


export type MutationEnterChatroomArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type MutationLeaveChatroomArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type MutationSendMessageArgs = {
  chatroomId: Scalars['Float']['input'];
  content: Scalars['String']['input'];
  image?: InputMaybe<Scalars['Upload']['input']>;
};


export type MutationUpdateProfileArgs = {
  file?: InputMaybe<Scalars['Upload']['input']>;
  first_name: Scalars['String']['input'];
};


export type MutationUserStartedTypingMutationArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type MutationUserStoppedTypingMutationArgs = {
  chatroomId: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  getChatroomsForUser: Array<Chatroom>;
  getMessagesForChatroom: Array<Message>;
  getUser: User;
  getUsersOfChatroom: Array<User>;
  searchUsers: Array<User>;
};


export type QueryGetMessagesForChatroomArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type QueryGetUsersOfChatroomArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type QuerySearchUsersArgs = {
  first_name: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  liveUsersInChatroom?: Maybe<Array<User>>;
  messageDeleted: Message;
  newMessage?: Maybe<Message>;
  userStartedTyping?: Maybe<User>;
  userStoppedTyping?: Maybe<User>;
};


export type SubscriptionLiveUsersInChatroomArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type SubscriptionMessageDeletedArgs = {
  chatroomId: Scalars['Int']['input'];
};


export type SubscriptionNewMessageArgs = {
  chatroomId: Scalars['Float']['input'];
};


export type SubscriptionUserStartedTypingArgs = {
  chatroomId: Scalars['Float']['input'];
  userId: Scalars['Float']['input'];
};


export type SubscriptionUserStoppedTypingArgs = {
  chatroomId: Scalars['Float']['input'];
  userId: Scalars['Float']['input'];
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  first_name: Scalars['String']['output'];
  id?: Maybe<Scalars['Float']['output']>;
  is_active?: Maybe<Scalars['Boolean']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  last_online?: Maybe<Scalars['DateTime']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  phone_number?: Maybe<Scalars['String']['output']>;
  profile_img?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AddUsersToChatroomMutationVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
  userIds: Array<Scalars['Float']['input']> | Scalars['Float']['input'];
}>;


export type AddUsersToChatroomMutation = { __typename?: 'Mutation', addUsersToChatroom: { __typename?: 'Chatroom', name?: string | null, id?: string | null } };

export type CreateChatroomMutationVariables = Exact<{
  name: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
}>;


export type CreateChatroomMutation = { __typename?: 'Mutation', createChatroom: { __typename?: 'Chatroom', name?: string | null, id?: string | null } };

export type DeleteChatroomMutationVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type DeleteChatroomMutation = { __typename?: 'Mutation', deleteChatroom: string };

export type DeleteMessageMutationVariables = Exact<{
  chatroomId: Scalars['Int']['input'];
  messageId: Scalars['Int']['input'];
}>;


export type DeleteMessageMutation = { __typename?: 'Mutation', deleteMessage: number };

export type EnterChatroomMutationVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type EnterChatroomMutation = { __typename?: 'Mutation', enterChatroom: boolean };

export type LeaveChatroomMutationVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type LeaveChatroomMutation = { __typename?: 'Mutation', leaveChatroom: boolean };

export type SendMessageMutationVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
  content: Scalars['String']['input'];
  image?: InputMaybe<Scalars['Upload']['input']>;
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'Message', id?: string | null, content?: string | null, imageUrl?: string | null, user?: { __typename?: 'User', id?: number | null, first_name: string } | null } };

export type UpdateProfileMutationVariables = Exact<{
  first_name: Scalars['String']['input'];
  file?: InputMaybe<Scalars['Upload']['input']>;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null } };

export type UserStartedTypingMutationMutationVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type UserStartedTypingMutationMutation = { __typename?: 'Mutation', userStartedTypingMutation: { __typename?: 'User', id?: number | null, first_name: string } };

export type UserStoppedTypingMutationMutationVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type UserStoppedTypingMutationMutation = { __typename?: 'Mutation', userStoppedTypingMutation: { __typename?: 'User', id?: number | null, first_name: string } };

export type GetChatroomsForUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetChatroomsForUserQuery = { __typename?: 'Query', getChatroomsForUser: Array<{ __typename?: 'Chatroom', id?: string | null, name?: string | null, messages?: Array<{ __typename?: 'Message', id?: string | null, content?: string | null, createdAt?: any | null, user?: { __typename?: 'User', id?: number | null, first_name: string } | null }> | null, users?: Array<{ __typename?: 'User', profile_img?: string | null, id?: number | null, first_name: string }> | null }> };

export type GetMessagesForChatroomQueryVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type GetMessagesForChatroomQuery = { __typename?: 'Query', getMessagesForChatroom: Array<{ __typename?: 'Message', id?: string | null, content?: string | null, imageUrl?: string | null, createdAt?: any | null, user?: { __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null } | null, chatroom?: { __typename?: 'Chatroom', id?: string | null, name?: string | null, users?: Array<{ __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null }> | null } | null }> };

export type GetUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserQuery = { __typename?: 'Query', getUser: { __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null } };

export type GetUsersOfChatroomQueryVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type GetUsersOfChatroomQuery = { __typename?: 'Query', getUsersOfChatroom: Array<{ __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null }> };

export type SearchUsersQueryVariables = Exact<{
  first_name: Scalars['String']['input'];
}>;


export type SearchUsersQuery = { __typename?: 'Query', searchUsers: Array<{ __typename?: 'User', id?: number | null, first_name: string }> };

export type LiveUsersInChatroomSubscriptionVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type LiveUsersInChatroomSubscription = { __typename?: 'Subscription', liveUsersInChatroom?: Array<{ __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null }> | null };

export type MessageDeletedSubscriptionVariables = Exact<{
  chatroomId: Scalars['Int']['input'];
}>;


export type MessageDeletedSubscription = { __typename?: 'Subscription', messageDeleted: { __typename?: 'Message', id?: string | null } };

export type NewMessageSubscriptionVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
}>;


export type NewMessageSubscription = { __typename?: 'Subscription', newMessage?: { __typename?: 'Message', id?: string | null, content?: string | null, imageUrl?: string | null, createdAt?: any | null, user?: { __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null } | null } | null };

export type UserStartedTypingSubscriptionVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
  userId: Scalars['Float']['input'];
}>;


export type UserStartedTypingSubscription = { __typename?: 'Subscription', userStartedTyping?: { __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null } | null };

export type UserStoppedTypingSubscriptionVariables = Exact<{
  chatroomId: Scalars['Float']['input'];
  userId: Scalars['Float']['input'];
}>;


export type UserStoppedTypingSubscription = { __typename?: 'Subscription', userStoppedTyping?: { __typename?: 'User', id?: number | null, first_name: string, profile_img?: string | null } | null };


export const AddUsersToChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddUsersToChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addUsersToChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddUsersToChatroomMutation, AddUsersToChatroomMutationVariables>;
export const CreateChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateChatroomMutation, CreateChatroomMutationVariables>;
export const DeleteChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}]}]}}]} as unknown as DocumentNode<DeleteChatroomMutation, DeleteChatroomMutationVariables>;
export const DeleteMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"messageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"messageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"messageId"}}}]}]}}]} as unknown as DocumentNode<DeleteMessageMutation, DeleteMessageMutationVariables>;
export const EnterChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnterChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enterChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}]}]}}]} as unknown as DocumentNode<EnterChatroomMutation, EnterChatroomMutationVariables>;
export const LeaveChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LeaveChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}]}]}}]} as unknown as DocumentNode<LeaveChatroomMutation, LeaveChatroomMutationVariables>;
export const SendMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"image"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}},{"kind":"Argument","name":{"kind":"Name","value":"image"},"value":{"kind":"Variable","name":{"kind":"Name","value":"image"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]}}]} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first_name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first_name"}}},{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const UserStartedTypingMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserStartedTypingMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userStartedTypingMutation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]} as unknown as DocumentNode<UserStartedTypingMutationMutation, UserStartedTypingMutationMutationVariables>;
export const UserStoppedTypingMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UserStoppedTypingMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userStoppedTypingMutation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]} as unknown as DocumentNode<UserStoppedTypingMutationMutation, UserStoppedTypingMutationMutationVariables>;
export const GetChatroomsForUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetChatroomsForUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getChatroomsForUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profile_img"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]}}]} as unknown as DocumentNode<GetChatroomsForUserQuery, GetChatroomsForUserQueryVariables>;
export const GetMessagesForChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMessagesForChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMessagesForChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chatroom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMessagesForChatroomQuery, GetMessagesForChatroomQueryVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const GetUsersOfChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsersOfChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUsersOfChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]} as unknown as DocumentNode<GetUsersOfChatroomQuery, GetUsersOfChatroomQueryVariables>;
export const SearchUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first_name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first_name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}}]}}]}}]} as unknown as DocumentNode<SearchUsersQuery, SearchUsersQueryVariables>;
export const LiveUsersInChatroomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"LiveUsersInChatroom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"liveUsersInChatroom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]} as unknown as DocumentNode<LiveUsersInChatroomSubscription, LiveUsersInChatroomSubscriptionVariables>;
export const MessageDeletedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"MessageDeleted"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messageDeleted"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<MessageDeletedSubscription, MessageDeletedSubscriptionVariables>;
export const NewMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"NewMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]}}]} as unknown as DocumentNode<NewMessageSubscription, NewMessageSubscriptionVariables>;
export const UserStartedTypingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"UserStartedTyping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userStartedTyping"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]} as unknown as DocumentNode<UserStartedTypingSubscription, UserStartedTypingSubscriptionVariables>;
export const UserStoppedTypingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"UserStoppedTyping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userStoppedTyping"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chatroomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chatroomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"profile_img"}}]}}]}}]} as unknown as DocumentNode<UserStoppedTypingSubscription, UserStoppedTypingSubscriptionVariables>;