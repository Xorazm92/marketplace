/* components/ChatWindow.tsx */
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  GetMessagesForChatroomQuery,
  GetUsersOfChatroomQuery,
  LiveUsersInChatroomSubscription,
  NewMessageSubscription,
  SendMessageMutation,
  UserStartedTypingSubscription,
  UserStoppedTypingSubscription,
  Message,
  User,
} from "../gql/graphql";
import { GET_MESSAGES_FOR_CHATROOM } from "../graphql/queries/GetMessagesForChatroom";
import { GET_USERS_OF_CHATROOM } from "../graphql/queries/GetUsersOfChatroom";
import { LIVE_USERS_SUBSCRIPTION } from "../graphql/subscriptions/LiveUsers";
import { NEW_MESSAGE_SUBSCRIPTION } from "../graphql/subscriptions/NewMessage";
import { USER_STARTED_TYPING_SUBSCRIPTION } from "../graphql/subscriptions/UserStartedTyping";
import { USER_STOPPED_TYPING_SUBSCRIPTION } from "../graphql/subscriptions/UserStoppedTyping";
import { SEND_MESSAGE } from "../graphql/mutations/SendMessage";
import { ENTER_CHATROOM } from "../graphql/mutations/EnterChatroom";
import { LEAVE_CHATROOM } from "../graphql/mutations/LeaveChatroom";
import { USER_STARTED_TYPING_MUTATION } from "../graphql/mutations/UserStartedTypingMutation";
import { USER_STOPPED_TYPING_MUTATION } from "../graphql/mutations/UserStoppedTypingMutation";
import { DELETE_MESSAGE } from "../graphql/mutations/DeleteMessage";
import { DeleteMessageMutation } from "../gql/graphql";
import { MESSAGE_DELETED } from "../graphql/subscriptions/MessageDeleted";
import { MessageDeletedSubscription } from "../gql/graphql";

import { useUserStore } from "../stores/userStore";
import styles from "./Chatwindow.module.scss";

const ChatWindow: React.FC = () => {
  const router = useRouter();
  const { chatroom } = router.query;
  const chatroomId = typeof chatroom === "string" ? parseInt(chatroom, 10) : null;
  const userId = useUserStore((state) => state.id);
  const userName = useUserStore((state) => state.first_name);
  const userAvatar = useUserStore((state) => state.profile_img);

  // State
  const [messageContent, setMessageContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const typingTimeoutsRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [liveUsers, setLiveUsers] = useState<User[]>([]);
  const [deleteMessage] = useMutation<DeleteMessageMutation>(DELETE_MESSAGE);
  const { data: deletedData } = useSubscription<MessageDeletedSubscription>(
    MESSAGE_DELETED,
    { skip: !chatroomId, variables: { chatroomId } }
  );

  useEffect(() => {
    if (deletedData?.messageDeleted?.id) {
      const deletedId = deletedData.messageDeleted.id;
      setMessages((prev) => prev.filter((m) => {
        console.log(m.id)
        if(m.id !== deletedId)
          return m.id
      }));
    }
  }, [deletedData]);

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Queries
  const { data: dataUsersOfChatroom } = useQuery<GetUsersOfChatroomQuery>(
    GET_USERS_OF_CHATROOM,
    { skip: !chatroomId, variables: { chatroomId: chatroomId! } }
  );

  const { data, loading: loadingMessages } = useQuery<GetMessagesForChatroomQuery>(
    GET_MESSAGES_FOR_CHATROOM,
    { skip: !chatroomId, variables: { chatroomId: chatroomId! } }
  );

  // Subscriptions
  const { data: liveUsersData } = useSubscription<LiveUsersInChatroomSubscription>(
    LIVE_USERS_SUBSCRIPTION,
    { skip: !chatroomId, variables: { chatroomId: chatroomId! } }
  );

  const { data: newMessageData } = useSubscription<NewMessageSubscription>(
    NEW_MESSAGE_SUBSCRIPTION,
    { skip: !chatroomId, variables: { chatroomId: chatroomId! } }
  );

  const { data: typingStartedData } = useSubscription<UserStartedTypingSubscription>(
    USER_STARTED_TYPING_SUBSCRIPTION,
    { skip: !chatroomId || !userId, variables: { chatroomId: chatroomId!, userId: userId! } }
  );
  const { data: typingStoppedData } = useSubscription<UserStoppedTypingSubscription>(
    USER_STOPPED_TYPING_SUBSCRIPTION,
    { skip: !chatroomId || !userId, variables: { chatroomId: chatroomId!, userId: userId! } }
  );

  // Mutations
  const [sendMessage] = useMutation<SendMessageMutation>(SEND_MESSAGE);
  const [enterChatroom] = useMutation(ENTER_CHATROOM);
  const [leaveChatroom] = useMutation(LEAVE_CHATROOM);
  const [userStartedTypingMutation] = useMutation(USER_STARTED_TYPING_MUTATION);
  const [userStoppedTypingMutation] = useMutation(USER_STOPPED_TYPING_MUTATION);

  // Dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    multiple: false,
  });

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  // Effects
  // Load initial messages
  useEffect(() => {
    if (data?.getMessagesForChatroom) {
      setMessages(data.getMessagesForChatroom as Message[]);
      scrollToBottom();
    }
  }, [data?.getMessagesForChatroom]);

  // Handle new message subscription
  useEffect(() => {
    if (newMessageData?.newMessage) {
      const newMsg = newMessageData.newMessage;
      setMessages((prev) => {
        if (!prev.find((m) => m.id === newMsg.id)) {
          return [...prev, newMsg];
        }
        return prev;
      });
      scrollToBottom();
    }
  }, [newMessageData]);

  // Handle live users subscription
  useEffect(() => {
    if (liveUsersData?.liveUsersInChatroom) {
      setLiveUsers(liveUsersData.liveUsersInChatroom as User[]);
    }
  }, [liveUsersData?.liveUsersInChatroom]);

  // Handle typing started
  useEffect(() => {
    const u = typingStartedData?.userStartedTyping;
    if (u && u.id != null) {
      setTypingUsers((prev) => {
        if (!prev.find((user) => user.id === u.id)) {
          return [...prev, u];
        }
        return prev;
      });
      // clear any existing timeout for this user
      if (u.id && typingTimeoutsRef.current[u.id]) {
        clearTimeout(typingTimeoutsRef.current[u.id]);
      }
    }
  }, [typingStartedData]);

  // Handle typing stopped
  useEffect(() => {
    const u = typingStoppedData?.userStoppedTyping;
    if (u && u.id != null) {
      if (u.id && typingTimeoutsRef.current[u.id]) {
        clearTimeout(typingTimeoutsRef.current[u.id]);
      }
      setTypingUsers((prev) => prev.filter((user) => user.id !== u.id));
    }
  }, [typingStoppedData]);

  // Enter/leave chatroom on mount/unmount or id change
  useEffect(() => {
    if (chatroomId) {
      enterChatroom({ variables: { chatroomId } }).catch((e) => console.error(e));
      return () => {
        leaveChatroom({ variables: { chatroomId } }).catch((e) => console.error(e));
      };
    }
  }, [chatroomId]);

  // Before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (chatroomId) {
        leaveChatroom({ variables: { chatroomId } });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [chatroomId]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const el = scrollAreaRef.current;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  };

  // Typing indicator for current user
  const handleUserStartedTyping = async () => {
    if (chatroomId) {
      await userStartedTypingMutation({ variables: { chatroomId } }).catch((e) => console.error(e));
      if (userId) {
        if (typingTimeoutsRef.current[userId]) {
          clearTimeout(typingTimeoutsRef.current[userId]);
        }
        typingTimeoutsRef.current[userId] = setTimeout(async () => {
          setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
          await userStoppedTypingMutation({ variables: { chatroomId } }).catch((e) => console.error(e));
        }, 2000);
      }
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!chatroomId) return;
    if (messageContent.trim() === "" && !selectedFile) return;
    try {
      await sendMessage({
        variables: {
          chatroomId,
          content: messageContent,
          image: selectedFile,
        },
        refetchQueries: [],
      });
      setMessageContent("");
      setSelectedFile(null);
      scrollToBottom()
    } catch (e) {
      console.error("Send message error:", e);
    }
  };

  const handleDelete = async (messageId: string) => {
    const messageIdNum = parseInt(messageId, 10);
    if (isNaN(messageIdNum)) return;

    await deleteMessage({
      variables: { chatroomId: chatroomId!, messageId: messageIdNum },
      update: (cache) => {
        cache.modify({
          fields: {
            getMessagesForChatroom(existingRefs = [], { readField }) {
              // compare string-to-string
              return existingRefs.filter(
                (ref: any) => readField("id", ref) !== messageId
              );
            },
          },
        });
      },
    });
  };




  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(e.target.value);
    handleUserStartedTyping();
  };

  // Initial guard
  if (!chatroomId) {
    return <div className={styles.placeholder}>Выберите чат</div>;
  }

  return (
    <div className={styles.chatWindow}>
      {/* Header showing live users */}
      <div className={styles.header}>
        <div className={styles.liveUsers}>
          {liveUsers.map((u) => (
            u.id !== userId && (
              <div key={u.id} className={styles.liveUser}>
                {u.profile_img ? (
                  <>
                    <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${u.profile_img}`} alt={u.first_name} width={24} height={24} className={styles.liveAvatar} />
                    <div>
                      <div className={styles.liveUserName}>{u.first_name}</div>
                      <p>last online: {u.last_online}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.avatarPlaceholder} />
                    <div>
                      <div className={styles.liveUserName}>{u.first_name}</div>
                      <p>last online: {u.last_online}</p>
                    </div>
                  </>
                )}
              </div>
            )
          ))}

        </div>
      </div>

      {/* Messages area */}
      <div className={styles.messagesContainer} ref={scrollAreaRef}>
        {loadingMessages && <div className={styles.loading}>Loading messages...</div>}
        {!loadingMessages && messages.map((msg) => {
          const isOwn = msg.user?.id === userId;
          return (
            <div
              key={msg.id}
              className={`${styles.messageItem} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
            >
              {!isOwn && (
                <div className={styles.avatarWrapper}>
                  {msg.user?.profile_img ? (
                    <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${msg.user.profile_img}`} alt={msg.user.first_name} width={32} height={32} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                </div>
              )}
              <div className={styles.messageContent}>
                {msg.content && <div className={styles.text}>{msg.content}</div>}
                {msg.imageUrl && (
                  <div className={styles.imageWrapper}>
                    <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}${msg.imageUrl}`} alt="attachment" width={200} height={200} className={styles.imageMsg} />
                  </div>
                )}
                <div className={styles.messageMeta}>
                  <span className={styles.metaName}>{msg.user?.first_name}</span>
                  {msg.createdAt && (
                    <span className={styles.metaTime}>
                      {new Date(msg.createdAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              {isOwn && (
                <div className={styles.avatarWrapperOwn}>
                  {userAvatar ? (
                    <Image src={`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${userAvatar}`} alt={userName} width={32} height={32} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => msg.id && handleDelete(msg.id)}
                    aria-label="Delete message"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className={styles.typingIndicator}>
            <em>{typingUsers.map((u) => u.first_name).join(', ')} печатает...</em>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <div {...getRootProps()} className={styles.dropzone}>
          <input {...getInputProps()} />
          <span>Прикрепить</span>
        </div>
        {previewUrl && (
          <div className={styles.preview}>
            <Image src={previewUrl} alt="preview" width={80} height={80} className={styles.previewImg} />
            <button className={styles.removePreview} onClick={() => setSelectedFile(null)}>×</button>
          </div>
        )}
        <textarea
          className={styles.textarea}
          placeholder="Введите сообщение..."
          value={messageContent}
          onChange={onInputChange}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button className={styles.sendButton} onClick={handleSendMessage} disabled={!messageContent.trim() && !selectedFile}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
