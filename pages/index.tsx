import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Slider from '../components/slider'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Crushed&family=Finger+Paint&family=Passion+One&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00aba9" />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div className={styles.container}>
        {/* {data.map((schedule) => JSON.stringify(schedule))}
        {JSON.stringify(user)} */}
        <Slider />
      </div>
    </>
  );
};

export default Home;
