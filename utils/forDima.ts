import { Schedule } from "../pages/api/schedules/[userId]"
import fb from "./firebase"

export const USER_ID = "297598650"

export const attemptSchedule = () => USER_ID

export const reschedule = async () => {
  const result = await fb()
    .firestore()
    .collection("schedules")
    .where("userId", "==", USER_ID)
    .where("name", "==", "Laundry")
    .get()

  await fb()
    .firestore()
    .collection("schedules")
    .doc(result.docs[0].id)
    .set({ startTime: "11:00", endTime: "12:00" }, { merge: true })

  //await fb().firestore().collection("schedules").add(schedule)
}
