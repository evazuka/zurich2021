// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fb from "../../../utils/firebase";

export type User = {
  mindState: string;
  name: string;
  resilienceRating: number;
  socialCircles: { id: string; name: string }[];
  id?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  const dataSnapshot = await fb()
    .firestore()
    .collection("users")
    .doc(req.query.id as string)
    .get();

  res.status(200).json(dataSnapshot.data() as User);
}
