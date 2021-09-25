import firebase from "firebase-admin";
const app = (): any => {
  if (!firebase.apps.length) {
    return firebase.initializeApp({
      credential: firebase.credential.cert(
        require("./hackzurich2021-firebase-adminsdk-6nrxc-6b545d2df5.json")
      ),
    });
  } else {
    return firebase.app(); // if already initialized, use that one
  }
};
export default app;
