/* components/RoomList.tsx */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHATROOMS_FOR_USER } from "../graphql/queries/GetChatroomsForUser";
import { DELETE_CHATROOM } from "../graphql/mutations/DeleteChatroom";
import { GetChatroomsForUserQuery } from "../gql/graphql";
import { useUserStore } from "../stores/userStore";
import styles from "./RoomList.module.scss";
import Image from "next/image";

const RoomList: React.FC = () => {
  const router = useRouter();
  const { id: routeId } = router.query;
  const userId = useUserStore((state) => state.id);

  const { data, loading, error } = useQuery<GetChatroomsForUserQuery>(
    GET_CHATROOMS_FOR_USER,
    {
      variables: { userId: userId },
      skip: !userId,
    }
  );

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (routeId) {
      const idStr = Array.isArray(routeId) ? routeId[0] : routeId;
      setActiveRoomId(idStr);
    } else {
      setActiveRoomId(null);
    }
  }, [routeId]);

  const [deleteChatroom] = useMutation(DELETE_CHATROOM, {
    refetchQueries: [
      {
        query: GET_CHATROOMS_FOR_USER,
        variables: { userId: userId },
      },
    ],
    onCompleted: () => {
      router.push("/");
    },
    onError: (deleteError) => {
      console.error("Failed to delete chatroom:", deleteError);
    },
  });

  const handleDelete = (chatroomId: string) => {
    if (confirm("Are you sure you want to delete this chat?")) {
      deleteChatroom({ variables: { chatroomId } });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    if (process.env.NODE_ENV === "development") console.log(error)
    return <div className={styles.error}>Error loading chats.</div>;
  }

  const chatrooms = data?.getChatroomsForUser || [];

  // Filter out any chatrooms with null id
  const validChatrooms = chatrooms.filter((chat) => chat.id);

  if (validChatrooms.length === 0) {
    return <div className={styles.empty}>У вас еще нет чатов</div>;
  }

  return (
    <div className={styles.roomWindow}>
      <div className={styles.header}>
        <div className={styles.title}>Чаты</div>
      </div>
      <ul className={styles.roomList}>
        {validChatrooms.map((chat) => {
          const chatId = chat.id!;
          const isActive = activeRoomId === chatId;

          // Determine the other user(s) in this chatroom
          const otherUsers = (chat.users || []).filter(
            (u) => u?.id != null && u.id !== userId
          );
          const otherUser = otherUsers[0] || null;
          const displayName = otherUser?.first_name || chat.name || 'Unknown';
          const avatarUrl = otherUser?.profile_img || null;

          // Get last message by sorting by createdAt
          const messages = chat.messages || [];
          let lastMessage = null;
          if (messages.length > 0) {
            lastMessage = [...messages]
              .filter((m) => m?.createdAt)
              .sort((a, b) => new Date(b!.createdAt as string).getTime() - new Date(a!.createdAt as string).getTime())[0];
          }
          const subtitle = lastMessage?.content || '';
          const timestamp = lastMessage?.createdAt
            ? new Date(lastMessage.createdAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <li
              key={chatId}
              className={`${styles.roomItem} ${isActive ? styles.active : ''}`}
            >
              <Link href={{ pathname: '/Profile', query: {tab: "Сообщения", chatroom: chatId } }} className={styles.linkWrapper}>
                <div className={styles.avatarWrapper}>
                  {avatarUrl ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${avatarUrl}`}
                      alt={displayName}
                      width={40}
                      height={40}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{displayName}</div>
                  <div className={styles.lastMessage}>{subtitle}</div>
                </div>
                <div className={styles.timestamp}>{timestamp}</div>
              </Link>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(chatId)}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RoomList;
