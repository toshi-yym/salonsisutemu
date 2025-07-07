import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../supabaseClient.js';
import MenuPalette from './MenuPalette.jsx';
import './CalendarView.css';

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    setLoading(true);
    const { data, error } = await supabase.from('reservations').select('*');
    if (error) {
      console.error(error);
      return;
    }
    setEvents(
      data.map((r) => ({
        id: r.id,
        title: r.customer_name,
        start: r.start_time,
        end: r.end_time,
        extendedProps: { status: r.status, staff_id: r.staff_id },
      }))
    );
    setLoading(false);
  }

  async function handleEventDrop(info) {
    const { id, startStr, endStr } = info.event;

    const { error } = await supabase
      .from('reservations')
      .update({ start_time: startStr, end_time: endStr })
      .eq('id', id);

    if (error) {
      alert('更新に失敗しました');
      info.revert();
    } else {
      fetchReservations();
    }
  }

  async function handleEventReceive(info) {
    // create reservation in DB
    const menuId = info.event.extendedProps.menu_id;
    const { start, end } = info.event;
    const { data, error } = await supabase.from('reservations').insert({
      menu_id: menuId,
      start_time: start.toISOString(),
      end_time: end ? end.toISOString() : null,
      status: '仮予約',
    }).select().single();

    if (error) {
      alert('予約作成に失敗しました');
      info.revert();
    } else {
      // update event with id
      info.event.setProp('id', data.id);
      fetchReservations();
    }
  }

  return (
    <div className="calendar-wrapper">
      <MenuPalette />
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ start: 'prev,next today', center: 'title', end: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={events}
        editable
        droppable
        eventDrop={handleEventDrop}
        eventReceive={handleEventReceive}
        height="auto"
        locale="ja"
      />
      {loading && <p>読み込み中...</p>}
    </div>
  );
}
