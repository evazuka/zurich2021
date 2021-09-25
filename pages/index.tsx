import type { NextPage } from "next";
import useSwr from "swr";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Schedule } from "./api/schedules";
import { User } from "./api/users/[id]";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const { data = [] }: { data?: Schedule[]; error?: any } = useSwr(
    "/api/schedules",
    fetcher
  );

  const { data: user }: { data?: User; error?: any } = useSwr(
    "/api/users/rkHM2tHhjFAjH20jAf9O",
    fetcher
  );
  return (
    <div className={styles.container}>
      {data.map((schedule) => JSON.stringify(schedule))}
      {JSON.stringify(user)}
    </div>
  );
};

export default Home;
