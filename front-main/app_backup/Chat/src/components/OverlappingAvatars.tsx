import React from "react"
import { User } from "../gql/graphql"
import { Avatar, Tooltip } from "@mantine/core"
import styles from "./OverlappingAvatars.module.scss"

type Props = {
  users: User[]
  maxVisible?: number
}

function OverlappingAvatars({ users, maxVisible = 3 }: Props) {
  const visibleUsers = users.slice(0, maxVisible)
  const remainingUsers = users.slice(maxVisible)
  const remainingNames = remainingUsers.map((u) => u.first_name || "Unknown").join(", ")

  return (
    <div className={styles.avatarGroup}>
      <Tooltip.Group openDelay={300} closeDelay={100}>
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className={styles.avatarWrapper}
            style={{ left: `${index * 24}px`, zIndex: 10 - index }}
          >
            <Tooltip label={user.first_name || "Unknown"}>
              <Avatar
              className={styles.roundAvatar}
                src={user.profile_img || undefined}
                alt={user.first_name || "Unknown"}
                radius="xl"
                size="lg"
              />
            </Tooltip>
          </div>
        ))}

        {remainingUsers.length > 0 && (
          <div
            className={styles.avatarWrapper}
            style={{ left: `${visibleUsers.length * 24}px`, zIndex: 10 - visibleUsers.length }}
          >
            <Tooltip label={remainingNames}>
              <Avatar className={styles.roundAvatar} radius="xl" size="lg" aria-label={`+${remainingUsers.length} more users`}>
                +{remainingUsers.length}
              </Avatar>
            </Tooltip>
          </div>
        )}
      </Tooltip.Group>
    </div>
  )
}

export default OverlappingAvatars
