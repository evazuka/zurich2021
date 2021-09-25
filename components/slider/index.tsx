import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import Meditation from '../illustrations/meditation'
import WorkFromAnywhere from '../illustrations/workFromAnywhere'
import HavingFun from '../illustrations/havingFun'
import styles from './index.module.css'
import classNames from 'classnames'

const MOODS = [
  {
    illustration: Meditation,
    title: 'Focused',
    resilienceRating: 3
  },
  {
    illustration: WorkFromAnywhere,
    title: 'Flexible',
    resilienceRating: 5
  },
  {
    illustration: HavingFun,
    title: 'Expressive',
    resilienceRating: 7
  }
]

const Slider = () => {
  const [active, setActive] = useState<number>(1)

  const handleClick = (index: number) => async () => {
    const userId = new URL(window.location.href).searchParams.get('userId')

    await fetch(`/api/users/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        mindState: MOODS[index].title,
        resilienceRating: MOODS[index].resilienceRating
      })
    })

    window.location.href = `${window.location.origin}/schedule/${userId}`
  }


  const handleSwipedLeft = () => setActive(active => Math.min(MOODS.length - 1, active + 1))
  const handleSwipedRight = () => setActive(active => Math.max(0, active - 1))

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipedLeft,
    onSwipedRight: handleSwipedRight
  })

  const handleMouseEnter = (index: number) => () => setActive(index)

  return (
    <div className={styles.container} {...handlers}>
      <div className={styles.gallery}>
        {MOODS.map(({ illustration: Illustration, title }, index) => {
          const isActive = active === index

          return (
            <div
              key={index}
              className={classNames(styles.item, { [styles.itemActive]: isActive })}
              onMouseEnter={handleMouseEnter(index)}
              onClick={handleClick(index)}
            >
              {isActive && (
                <div className={classNames(styles.titleWrapper, styles[`titleWrapper${index + 1}`])}>
                  <h2 className={classNames(styles.title, styles[`title${index + 1}`])}>
                    {title}
                  </h2>
                </div>
              )}
              <div className={styles.svgContainer}>
                <Illustration active={isActive} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Slider
