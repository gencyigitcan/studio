'use client';

import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { updateClassTimeAction } from '@/app/actions/schedule';
import { bookClassAction, cancelBookingAction } from '@/app/actions/booking';
import { useRouter } from 'next/navigation';

moment.locale('tr');
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

interface AdvancedCalendarProps {
    classes: any[];
    role: string;
    userId: string;
    myBookings?: any[]; // For students to know what they booked
}

export default function AdvancedCalendar({ classes, role, userId, myBookings = [] }: AdvancedCalendarProps) {
    const router = useRouter();

    // Transform Prisma data to RBC events
    // Assuming 'classes' has { id, name, startTime, endTime, trainer, capacity, _count: { bookings } }

    // Helper to check if user booked a class
    const isBooked = (classId: string) => myBookings.some(b => b.classId === classId && b.status === 'CONFIRMED');

    const [events, setEvents] = useState(classes.map(c => ({
        id: c.id,
        title: c.name + (c.trainer ? ` (${c.trainer.name})` : ''),
        start: new Date(c.startTime),
        end: new Date(c.endTime),
        resource: c, // Store full object to access capacity etc.
    })));

    // --- ADMIN: Drag and Drop ---
    const onEventDrop = useCallback(async ({ event, start, end }: any) => {
        if (role !== 'ADMIN') return;

        // Optimistic UI Update
        const updatedEvents = events.map(existing =>
            existing.id === event.id ? { ...existing, start, end } : existing
        );
        setEvents(updatedEvents);

        // Server Action
        const res = await updateClassTimeAction(event.id, start, end);
        if (!res.success) {
            alert('Hata: ' + res.message);
            router.refresh(); // Revert
        }
    }, [events, role, router]);


    // --- STUDENT: Click to Book ---
    const onSelectEvent = useCallback(async (event: any) => {
        const cls = event.resource;

        if (role === 'ADMIN') {
            alert(`Ders: ${cls.name}\nEğitmen: ${cls.trainer?.name}\nKayıtlı: ${cls._count.bookings}/${cls.capacity}`);
            return;
        }

        if (role === 'CUSTOMER') {
            const booked = isBooked(cls.id);
            if (booked) {
                // Cancel logic (This assumes we can get bookingId efficiently, effectively complex in this simplified view unless we preload it)
                // For now, let's just show info or ask to cancel if we find the booking.
                const booking = myBookings.find(b => b.classId === cls.id && b.status === "CONFIRMED");
                if (!booking) return;

                if (confirm(`${cls.name} dersini iptal etmek istiyor musunuz?`)) {
                    const res = await cancelBookingAction(booking.id);
                    alert(res.message);
                    router.refresh();
                }
            } else {
                // Book logic
                if (cls._count.bookings >= cls.capacity) {
                    if (!confirm('Kontenjan dolu. Yedek listeye yazılmak ister misiniz?')) return;
                } else {
                    if (!confirm(`${cls.name} dersine kayıt olmak istiyor musunuz?`)) return;
                }

                const res = await bookClassAction(cls.id);
                alert(res.message);
                router.refresh();
            }
        }
    }, [role, myBookings, router]);

    // Custom coloring
    const eventPropGetter = (event: any) => {
        const cls = event.resource;
        const booked = isBooked(cls.id);
        const isFull = cls._count.bookings >= cls.capacity;

        let backgroundColor = '#3174ad'; // default blue
        if (role === 'CUSTOMER') {
            if (booked) backgroundColor = '#10b981'; // Green if booked
            else if (isFull) backgroundColor = '#ef4444'; // Red if full
            else backgroundColor = '#3b82f6'; // Blue available
        } else if (role === 'ADMIN') {
            if (isFull) backgroundColor = '#ef4444';
        }

        return { style: { backgroundColor } };
    };

    return (
        <div style={{ height: '600px', background: 'white', padding: '1rem', borderRadius: '8px' }}>
            <DnDCalendar
                localizer={localizer}
                events={events}
                defaultView={Views.WEEK}
                views={['month', 'week', 'day']}
                step={30}
                showMultiDayTimes
                selectable
                resizable={role === 'ADMIN'}
                onEventDrop={onEventDrop}
                onSelectEvent={onSelectEvent}
                eventPropGetter={eventPropGetter}
                messages={{
                    next: "İleri",
                    previous: "Geri",
                    today: "Bugün",
                    month: "Ay",
                    week: "Hafta",
                    day: "Gün",
                    agenda: "Ajanda"
                }}
            />
        </div>
    );
}
