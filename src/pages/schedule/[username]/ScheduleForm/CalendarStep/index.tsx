import { useEffect, useState } from "react";
import { Calendar } from "../../../../../components/Calendar";
import { Container, TimePicker, TimePickerHeader, TimePickerItem, TimePickerList } from "./style";
import dayjs from "dayjs";
import { api } from "../../../../../lib/axios";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

interface Availability {
    possibleTimes: number[],
    availableTimes: number[]
}

interface CalendarStepProps {
    onSelectDateTime: (date: Date) => void
}

export function CalendarStep({ onSelectDateTime }: CalendarStepProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const router = useRouter()

    const isDateSelected = !!selectedDate
    const username = String(router.query.username)

    const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
    const describedDate = selectedDate ? dayjs(selectedDate).format('DD[ de ]MMMM') : null

    const selectedDateWithoutTime = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null


    const { data: availability } = useQuery({
        queryKey: ['availability', selectedDateWithoutTime],
        queryFn: async () => {
            const response = await api.get(`/users/${username}/availability`, {
                params: {
                    date: selectedDateWithoutTime
                }
            })
            return response.data
        },
        enabled: !!selectedDateWithoutTime // Garante que a query só será feita quando houver uma data selecionada
    })

    function handleSlectTime(hour: number) {
        const dateWithTime = dayjs(selectedDate).set('hour', hour).startOf('hour').toDate()

        onSelectDateTime(dateWithTime)
    }

    return (
        <Container isTimePickerOpen={isDateSelected}>
            <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

            {isDateSelected && (
                <TimePicker>
                    <TimePickerHeader>
                        {weekDay} <span>{describedDate}</span>
                    </TimePickerHeader>

                    <TimePickerList>
                        {availability?.possibleTimes.map((hour: any) => {
                            return (
                                <TimePickerItem
                                    key={hour}
                                    onClick={() => handleSlectTime(hour)}
                                    disabled={!availability.availableTimes.includes(hour)}
                                >
                                    {String(hour).padStart(2, '0')}:00h
                                </TimePickerItem>
                            )
                        })}
                    </TimePickerList>
                </TimePicker>
            )}
        </Container>
    )
}