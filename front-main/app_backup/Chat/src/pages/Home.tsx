import RoomList from "../components/RoomList"
import { useIsMobile } from "@/hooks/UseIsMobile"
import ChatWindow from "../components/Chatwindow"
import { useUserStore } from "../stores/userStore"
import { useQuery } from "@apollo/client"
import { GetUserQuery } from "../gql/graphql"
import { GET_USER } from "../graphql/queries/GetUser"
import { useEffect } from "react"

function Home() {
  const isMobile = useIsMobile()
  const setUser = useUserStore((state) => state.setUser)
  const { data: stateUser } = useQuery<GetUserQuery>(GET_USER)

  useEffect(() => {
    if (stateUser?.getUser) {
      setUser({
        id: stateUser.getUser.id,
        profile_img: stateUser.getUser.profile_img,
        first_name: stateUser.getUser.first_name,
      });
    }
  }, [stateUser, setUser]);

  return (

    <div>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <RoomList />
        <ChatWindow />
      </div>
    </div>

  )
}

export default Home