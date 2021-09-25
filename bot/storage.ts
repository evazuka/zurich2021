import { User } from "pages/api/users/[id]"
import firebase from "utils/firebase"
import admin from "firebase-admin"
import { SocialCircle } from "pages/api/schedules"

const userCollection = firebase().firestore().collection("users")

export const getUsers = async () => {
  const data = await userCollection.get()

  const users: User[] = []
  data.forEach((doc) => {
    users.push({ ...doc.data(), id: doc.id } as User)
  })

  return users
}

export const upsertUser = async (
  user: Partial<User>,
  socialCircle: SocialCircle
) => {
  const userRef = userCollection.doc(user.id!)
  const newUser = await userRef.set(user, { merge: true })

  await userRef.update({
    socialCircles: admin.firestore.FieldValue.arrayUnion(socialCircle),
  })
}
