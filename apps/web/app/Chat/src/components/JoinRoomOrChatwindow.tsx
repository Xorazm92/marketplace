import { useRouter } from "next/router"
import ChatWindow from "./Chatwindow"
import styles from "./JoinRoomOrChatwindow.module.scss"

export default function JoinRoomOrChatwindow() {
  const router = useRouter()
  const id = router.query.chatroom
  return (
    <div className={styles.container}>
      <ChatWindow />
    </div>
  )
}
