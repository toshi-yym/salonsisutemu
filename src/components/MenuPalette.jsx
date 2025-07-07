import React, { useEffect, useRef } from 'react';
import { Draggable } from '@fullcalendar/interaction';
import { MENUS } from '../data/menus.js';
import './MenuPalette.css';

export default function MenuPalette() {
  const paletteRef = useRef(null);

  useEffect(() => {
    if (paletteRef.current) {
      // Make the menu items draggable for FullCalendar
      new Draggable(paletteRef.current, {
        itemSelector: '.menu-item',
        eventData: function (el) {
          const id = el.getAttribute('data-id');
          const menu = MENUS.find((m) => m.id === id);
          return {
            title: menu.label,
            backgroundColor: menu.color,
            extendedProps: {
              menu_id: id,
            },
          };
        },
      });
    }
  }, []);

  return (
    <div className="menu-palette" ref={paletteRef}>
      {MENUS.map((m) => (
        <div
          key={m.id}
          className="menu-item"
          data-id={m.id}
          style={{ backgroundColor: m.color }}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
}
