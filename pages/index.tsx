import type { NextPage } from "next";
import useSwr from "swr";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Schedule } from "./api/schedules";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const { data = [], error }: { data?: Schedule[]; error?: any } = useSwr(
    "/api/schedules",
    fetcher
  );
  return (
    <div className={styles.container}>
      {data.map((schedule) => JSON.stringify(schedule))}
    </div>
  );
};

export default Home;
