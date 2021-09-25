import { User } from "pages/api/users/[id]"
import firebase from "utils/firebase"

const userCollection = firebase().firestore().collection("users")

export const getUsers = async () => {
  const data = await userCollection.get()

  const users: User[] = []
  data.forEach((doc) => {
    users.push({ ...doc.data(), id: doc.id } as User)
  })

  return users
}

export const upsertUsers = async (users: Partial<User>[]) => {
  for (const user of users) {
    const newUser = await userCollection
      .doc(user.id!)
      .set(user, { merge: true })
  }
}
