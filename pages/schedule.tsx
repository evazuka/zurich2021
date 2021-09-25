import type { NextPage } from "next";
import styles from '../styles/schedule.module.css'

const Schedule: NextPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Today</h1>
      <div className={styles.content}>
        {[...Array(50)].map((_, index) => (
          <section key={index} className={styles.period}>
            <h3 className={styles.time}>
              <time className={styles.timeText} role="text">
                <span className={styles.timeStart}>10:30</span>
                <span className={styles.visuallyHidden}> — </span>
                <span className={styles.timeEnd}>10:45</span>
              </time>
            </h3>
            <div className={styles.event}>
              <h3 className={styles.eventTitle}>
                Grand opening
              </h3>
              <div className={styles.meta}>
                Hujņa
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Schedule
