// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import fb from "../../../utils/firebase"
import { User } from "../users/[id]"
import {
  getStartTime,
  getTotalFreeTime,
  addMinutesTotime,
} from "../../../utils/scheduler"

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
  socialCircle?: string
  isPending?: boolean
  id?: string
}

export type ScheduleReq = {
  isPersonal: boolean
  isGranular: boolean
  duration: number
  name: string
  socialCircle: string
}

export const createScheduleIfPossible = async (
  userId: string,
  body: ScheduleReq
) => {
  const usersSnapshot = body.socialCircle
    ? await fb().firestore().collection("users").get()
    : await fb().firestore().collection("users").where("id", "==", userId).get()
  const involvedUsers: User[] = []
  usersSnapshot.forEach((doc: any) => {
    const user = doc.data() as User
    body.socialCircle
      ? user.socialCircles?.find(({ name }) => name === body.socialCircle) &&
        involvedUsers.push({ ...user, id: doc.id } as User)
      : involvedUsers.push({ ...user, id: doc.id } as User)
  })
  console.log(involvedUsers)
  const schedulesPerUser = await Promise.all(
    involvedUsers.map(async ({ socialCircles, id }) => {
      const schedules: Schedule[] = []

      const socialCirclesSchedules = await fb()
        .firestore()
        .collection("schedules")
        .where(
          "socialCircle",
          "in",
          socialCircles.map(({ name }) => name)
        )
        .get()
      const personalSchedules = await fb()
        .firestore()
        .collection("schedules")
        .where("userId", "==", id)
        .where("isPersonal", "==", true)
        .get()
      socialCirclesSchedules.forEach((doc: any) => {
        schedules.push({ ...doc.data(), id: doc.id } as Schedule)
      })
      personalSchedules.forEach((doc: any) => {
        schedules.push({ ...doc.data(), id: doc.id } as Schedule)
      })
      return schedules
        .map(({ startTime, endTime }) => [startTime, endTime])
        .sort(([startTime1], [startTime2]) =>
          Number(startTime1.split(":").join("")) >
          Number(startTime2.split(":").join(""))
            ? 1
            : -1
        )
    })
  )
  const potentialStartWindow =
    involvedUsers.length > 0
      ? getStartTime(schedulesPerUser, body.duration)
      : null
  if (potentialStartWindow) {
    await fb()
      .firestore()
      .collection("schedules")
      .add({
        userId: userId,
        socialCircle: body.socialCircle,
        name: body.name,
        isGranular: body.isGranular,
        isPersonal: body.isPersonal,
        isPending: false,
        startTime: potentialStartWindow,
        endTime: addMinutesTotime(potentialStartWindow, body.duration),
      })
  }
  return {
    duration: body.duration,
    startTime: potentialStartWindow,
    endTime:
      potentialStartWindow &&
      addMinutesTotime(potentialStartWindow, body.duration),
    schedulesPerUser,
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Schedule[] | any>
) {
  const { body }: { body: ScheduleReq } = req
  const userId = req.query.userId

  if (req.method === "GET") {
    const dataSnapshot = await fb()
      .firestore()
      .collection("schedules")
      .where("userId", "==", userId || "cheevers@zg.gz")
      .get()
    const data: Schedule[] = []
    dataSnapshot.forEach((doc: any) => {
      data.push(doc.data() as Schedule)
    })

    res.status(200).json(data)
  } else if (req.method === "POST") {
    const result = await createScheduleIfPossible(userId as string, body)
    res.status(200).json(result)
  }
}
