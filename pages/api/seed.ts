import type { NextApiRequest, NextApiResponse } from "next"
import fb from "../../utils/firebase"

const seeds = [
  {
    name: "Daily Stand Up",
    startTime: "09:30",
    endTime: "10:00",
    socialCircle: "Work",
    isGranular: false,
    isPending: false,
    isPersonal: false,
    userId: null
  },
  {
    name: "Laundry",
    startTime: "10:00",
    endTime: "11:00",
    socialCircle: null,
    isGranular: false,
    isPending: false,
    isPersonal: true,
    userId: "297598650"
  },
  {
    name: "Lunch",
    startTime: "12:00",
    endTime: "13:00",
    socialCircle: null,
    isGranular: false,
    isPending: false,
    isPersonal: true,
    userId: "297598650"
  },
  {
    name: "Development time",
    startTime: "13:00",
    endTime: "17:00",
    socialCircle: null,
    isGranular: false,
    isPending: false,
    isPersonal: true,
    userId: "297598650"
  },
  {
    name: "Lunch",
    startTime: "11:00",
    endTime: "12:00",
    socialCircle: null,
    isGranular: false,
    isPending: false,
    isPersonal: true,
    userId: "487108387"
  },
  {
    name: "Development time",
    startTime: "12:00",
    endTime: "17:00",
    socialCircle: null,
    isGranular: false,
    isPending: false,
    isPersonal: true,
    userId: "487108387"
  },
  {
    name: "Report making",
    startTime: "13:00",
    endTime: "17:00",
    socialCircle: null,
    isGranular: false,
    isPending: false,
    isPersonal: true,
    userId: "698080776"
  }
]

async function deleteCollection(db: any, collectionPath: any, batchSize: any) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db: any, query: any, resolve: any) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc: any) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await deleteCollection(fb().firestore(), "schedules", 100)
  await Promise.all(seeds.map((seed) => fb().firestore().collection("schedules").add(seed)))

  res.status(200).end()
}
