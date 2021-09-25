// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import fb from "../../utils/firebase"
import { User } from "./users/[id]"

export type SocialCircle = {
  id: string
  name: string
}

export type Schedule = {
  userId: string
  isPersonal: boolean
  isGranular: boolean
  startTime: string
  endTime: string
  name: string
  socialCircle: string
  isPending?: boolean
}

export type ScheduleReq = {
  userId: string
  isPersonal: boolean
  isGranular: boolean
  duration: number
  name: string
  socialCircle: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Schedule[] | any>
) {
  const { body }: { body: ScheduleReq } = req
  if (req.method === "GET") {
    const dataSnapshot = await fb()
      .firestore()
      .collection("schedules")
      .where("userEmail", "==", req.body.userId || "cheevers@zg.gz")
      .get()
    const data: Schedule[] = []
    dataSnapshot.forEach((doc: any) => {
      console.log(doc.id, "=>", doc.data())
      data.push(doc.data() as Schedule)
    })
    res.status(200).json(data)
  } else if (req.method === "POST") {
    const dataSnapshot = await fb()
      .firestore()
      .collection("users")
      .where("socialCircles", "array-contains-any", [body.socialCircle])
      .get()
    const involvedUsers: User[] = []
    dataSnapshot.forEach((doc: any) => {
      console.log(doc.id, "=>", doc.data())
      involvedUsers.push({ ...doc.data(), id: doc.id } as User)
    })
    res.status(200).json(involvedUsers)
  }
}
