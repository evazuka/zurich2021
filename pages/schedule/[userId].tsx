import classNames from "classnames";
import Head from 'next/head'
import type { NextPage } from "next";
import { useRouter } from 'next/router'
import { Schedule as ScheduleType } from "pages/api/schedules/[userId]";
import useSwr from "swr";
import styles from '../../styles/schedule.module.css'

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Schedule: NextPage = () => {
  const router = useRouter()
  console.log(router.query)
  const { userId, mindState } = router.query

  const headStyle = `
    html, body {
      background-color: ${mindState === 'Focused' ? 'rgb(238, 252, 238)' : mindState === 'Flexible' ? 'rgb(241, 241, 255)' : 'rgb(255, 255, 197)'} !important;
    }
  `

  const renderHead = () => (
    <Head>
      <style>
        {headStyle}
      </style>
    </Head>
  )

  const { data } = useSwr(
    `/api/schedules/${userId}`,
    fetcher
  )

  if (!data) return null

  return (
    <>
      {renderHead()}
      <div className={styles.container}>
        <h1 className={styles.title}>Today</h1>
        <div className={styles.content}>
          {data.map((item: ScheduleType, index: number) => (
            <section key={index} className={styles.period}>
              <h3 className={styles.time}>
                <time className={styles.timeText} role="text">
                  <span className={styles.timeStart}>{item.startTime}</span>
                  <span className={styles.visuallyHidden}> — </span>
                  <span className={styles.timeEnd}>{item.endTime}</span>
                </time>
              </h3>
              <div
                className={styles.event}
              >
                <h3 className={styles.eventTitle}>
                  {item.name}
                </h3>
                <div className={styles.meta}>
                  {item.socialCircle ?? 'Personal'}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

export default Schedule
