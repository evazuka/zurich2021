// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fb from "../../utils/firebase";

export type Schedule = {
  userEmail: string;
  isPersonal: boolean;
  isGranular: boolean;
  startTime: string;
  endTime: string;
  name: string;
  socialCircle: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Schedule[]>
) {
  const dataSnapshot = await fb()
    .firestore()
    .collection("schedules")
    .where("userEmail", "==", req.body.userEmail || 'cheevers@zg.gz')
    .get();
  const data: Schedule[] = [];
  dataSnapshot.forEach((doc: any) => {
    console.log(doc.id, "=>", doc.data());
    data.push(doc.data() as Schedule);
  });
  res.status(200).json(data);
}
