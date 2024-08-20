import { CaretLeft, CaretRight } from "phosphor-react";
import { CalendarActions, CalendarBody, CalendarContainer, CalendarDay, CalendarHeader, CalendarTitle } from "./styles";
import { getWeekDays } from "../../utils/get-week-days";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import { useRouter } from "next/router";

interface CalendarWeek {
    week: number
    days: Array<{
        date: dayjs.Dayjs
        disabled: boolean
    }>
}

type CalendarWeeks = CalendarWeek[]

interface BlockedDates {
    blockedWeekDays: number[]
    blockedDates: number[]
}

interface CalendarPrps {
    selectedDate: Date | null
    onDateSelected: (date: Date) => void
}

export function Calendar({ selectedDate, onDateSelected }: CalendarPrps) {
    const shortWeekDays = getWeekDays({ short: true })
    const [currentData, setCurrentDate] = useState(() => {
        return dayjs().set('date', 1)
    })

    const router = useRouter()

    const currentMonth = currentData.format('MMMM')
    const currentYear = currentData.format('YYYY')

    const username = String(router.query.username)

    const { data: blockedDates } = useQuery<BlockedDates>({
        queryKey: ['blocked-dates', currentData.get('year'), currentData.get('month'),],
        queryFn: async () => {
            const response = await api.get(`/users/${username}/blocked-dates`, {
                params: {
                    year: currentData.get('year'),
                    month: String(currentData.get('month') + 1).padStart(2, '0'),
                }
            })
            console.log(response.data)
            return response.data
        }
    })

    function handlePreviousMonth() {
        const previousMonthData = currentData.subtract(1, 'month')

        setCurrentDate(previousMonthData)
    }

    function handleNextMonth() {
        const previousMonthData = currentData.add(1, 'month')

        setCurrentDate(previousMonthData)
    }

    const calendarWeeks = useMemo(() => {
        if(!blockedDates){
            return []
        }

        const daysInMonthArray = Array.from({
            length: currentData.daysInMonth(),
        }).map((_, i) => {
            return currentData.set('date', i + 1)
        })

        const firstWeekDay = currentData.get('day')

        const previousMonthFillArray = Array.from({
            length: firstWeekDay,
        }).map((_, i) => {
            return currentData.subtract(i + 1, 'day')
        }).reverse()

        const lastDayInCurrentMonth = currentData.set('date', currentData.daysInMonth())

        const lastWeekDay = lastDayInCurrentMonth.get('day')

        const nextMonthFillArray = Array.from({
            length: 7 - (lastWeekDay + 1)
        }).map((_, i) => {
            return lastDayInCurrentMonth.add(i + 1, 'day')
        })

        const calendarDays = [
            ...previousMonthFillArray.map((date) => {
                return { date, disabled: true }
            }),
            ...daysInMonthArray.map((date) => {
                // console.log(date.get('date'))
                // console.log(blockedDates.blockedDates.includes(date.get('date')))
                return {
                    date,
                    disabled: date.endOf('day').isBefore(new Date) ||
                    blockedDates.blockedWeekDays.includes(date.get('day')) ||
                    blockedDates.blockedDates.includes(date.get('date'))
                }
            }),
            ...nextMonthFillArray.map((date) => {
                return { date, disabled: true }
            }),
        ]

        const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
            (weeks, _, i, original) => {
                const isNewWeek = i % 7 === 0

                if (isNewWeek) {
                    weeks.push({
                        week: i / 7 + 1,
                        days: original.slice(i, i + 7)
                    })
                }

                return weeks
            },
            [],
        )

        return calendarWeeks
    }, [currentData, blockedDates])

    return (
        <CalendarContainer>
            <CalendarHeader>
                <CalendarTitle>
                    {currentMonth} <span>{currentYear}</span>
                </CalendarTitle>

                <CalendarActions>
                    <button onClick={handlePreviousMonth} title="Previous Month">
                        <CaretLeft />
                    </button>
                    <button onClick={handleNextMonth} title="Next Month">
                        <CaretRight />
                    </button>
                </CalendarActions>
            </CalendarHeader>

            <CalendarBody>
                <thead>
                    <tr>
                        {shortWeekDays.map(weekDay => <th key={weekDay}>{weekDay}.</th>)}
                    </tr>
                </thead>
                <tbody>
                    {calendarWeeks.map(({ week, days }) => {
                        return (
                            <tr key={week}>
                                {days.map(({ date, disabled }) => {
                                    return (
                                        <td key={date.toISOString()}>
                                            <CalendarDay
                                                onClick={() => onDateSelected(date.toDate())}
                                                disabled={disabled}
                                            >
                                                {date.get('date')}
                                            </CalendarDay>
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </CalendarBody>
        </CalendarContainer>
    )
}