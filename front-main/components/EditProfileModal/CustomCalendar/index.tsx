"use client"

import React, { useState, useEffect } from "react"
import styles from "./CustomCalendar.module.scss"

interface CustomCalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  onClose: () => void
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showYearSelector, setShowYearSelector] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate)
      setCurrentDate(date)
      setSelectedDay(date.getDate())
    }
  }, [selectedDate])

  const monthNames = [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
  ]

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(direction === "prev" ? prev.getMonth() - 1 : prev.getMonth() + 1)
      return newDate
    })
  }

  const handleDayClick = (e: React.MouseEvent, day: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedDay(day)
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = newDate.toISOString().split("T")[0]
    onDateSelect(dateString)
  }

  const handleToday = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const today = new Date()
    setCurrentDate(today)
    setSelectedDay(today.getDate())
    onDateSelect(today.toISOString().split("T")[0])
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedDay(null)
    onDateSelect("")
    onClose()
  }

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (selectedDay !== null) {
      onClose()
    }
  }

  const handleYearClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowYearSelector(!showYearSelector)
  }

  const handleYearSelect = (e: React.MouseEvent, year: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setFullYear(year)
      return newDate
    })
    setShowYearSelector(false)
  }

  const renderYearSelector = () => {
    const currentYear = currentDate.getFullYear()
    const years = []
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
      years.push(
        <button
          key={year}
          type="button"
          className={`${styles.yearOption} ${year === currentYear ? styles.selectedYear : ""}`}
          onClick={(e) => handleYearSelect(e, year)}
        >
          {year}
        </button>
      )
    }
    return <div className={styles.yearSelector}>{years}</div>
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
    const daysInPrevMonth = prevMonth.getDate()

    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i
      days.push(
        <button
          key={`prev-${prevDay}`}
          type="button"
          className={`${styles.day} ${styles.otherMonth}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigateMonth("prev")
          }}
        >
          {prevDay}
        </button>
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDay === day
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

      days.push(
        <button
          key={day}
          type="button"
          className={`${styles.day} ${isSelected ? styles.selected : ""} ${isToday ? styles.today : ""}`}
          onClick={(e) => handleDayClick(e, day)}
        >
          {day}
        </button>
      )
    }

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const remainingCells = totalCells - (firstDay + daysInMonth)

    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <button
          key={`next-${day}`}
          type="button"
          className={`${styles.day} ${styles.otherMonth}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigateMonth("next")
          }}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className={styles.calendarModal}>
      <div className={styles.calendar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.calendarHeader}>
          <div className={styles.monthYear} onClick={handleYearClick}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} г.
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.navigation}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigateMonth("prev")
              }}
              className={styles.navButton}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigateMonth("next")
              }}
              className={styles.navButton}
            >
              ↓
            </button>
          </div>
        </div>

        {showYearSelector ? (
          renderYearSelector()
        ) : (
          <>
            <div className={styles.dayHeaders}>
              {dayNames.map((day) => (
                <div key={day} className={styles.dayHeader}>
                  {day}
                </div>
              ))}
            </div>
            <div className={styles.daysGrid}>{renderCalendarDays()}</div>
          </>
        )}

        <div className={styles.calendarFooter}>
          <button type="button" className={styles.deleteButton} onClick={handleDelete}>
            Удалить
          </button>
          <button type="button" className={styles.todayButton} onClick={handleToday}>
            Сегодня
          </button>
          <button type="button" className={styles.submitButton} onClick={handleConfirm} disabled={selectedDay === null}>
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomCalendar
