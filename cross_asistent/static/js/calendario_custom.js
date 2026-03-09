/**
 * VigIA — Custom Calendar
 * Renders a month grid with a day-detail side panel.
 * Fetches events from the Django endpoint.
 */
(function () {
    'use strict';

    const MONTH_NAMES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    let currentYear, currentMonth; // 0-indexed month
    let selectedDate = null;
    let allEvents = [];
    let eventsUrl = '';

    // ===== DOM references =====
    const container = document.getElementById('calendarApp');
    if (!container) return;

    eventsUrl = container.dataset.events || '';

    // Build DOM structure
    container.innerHTML = `
        <div class="cal-day-panel">
            <div class="cal-day-number" id="calDayNum">--</div>
            <div class="cal-day-month" id="calDayMonth">---</div>
            <div class="cal-day-divider"></div>
            <div class="cal-day-events" id="calDayEvents">
                <div class="cal-day-events-title">EVENTOS</div>
                <div class="cal-day-no-events">Selecciona un día</div>
            </div>
        </div>
        <div class="cal-grid-panel">
            <div class="cal-header">
                <button class="cal-nav-btn" id="calPrev" aria-label="Mes anterior">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <div class="cal-header-title">
                    <div class="cal-header-year" id="calYear"></div>
                    <div class="cal-header-month" id="calMonth"></div>
                </div>
                <button class="cal-nav-btn" id="calNext" aria-label="Siguiente mes">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
            <div class="cal-weekdays" id="calWeekdays"></div>
            <div class="cal-days" id="calDays"></div>
        </div>
    `;

    const $dayNum = document.getElementById('calDayNum');
    const $dayMonth = document.getElementById('calDayMonth');
    const $dayEvents = document.getElementById('calDayEvents');
    const $year = document.getElementById('calYear');
    const $month = document.getElementById('calMonth');
    const $weekdays = document.getElementById('calWeekdays');
    const $days = document.getElementById('calDays');

    // ===== Init =====
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();

    renderWeekdays();
    fetchEvents().then(() => {
        renderGrid();
        selectDate(today);
    });

    document.getElementById('calPrev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderGrid();
        clearSelection();
    });

    document.getElementById('calNext').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderGrid();
        clearSelection();
    });

    // ===== Render weekdays =====
    function renderWeekdays() {
        $weekdays.innerHTML = WEEKDAYS.map(d =>
            `<div class="cal-weekday">${d}</div>`
        ).join('');
    }

    // ===== Render monthly grid =====
    function renderGrid() {
        $year.textContent = currentYear;
        $month.textContent = MONTH_NAMES[currentMonth];

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const totalDays = lastDay.getDate();

        // Day of week for the 1st (0=Sun → convert to Mon-based: Mon=0)
        let startDow = firstDay.getDay() - 1;
        if (startDow < 0) startDow = 6; // Sunday becomes 6

        // Previous month padding
        const prevMonthLast = new Date(currentYear, currentMonth, 0).getDate();

        let html = '';

        // Previous month trailing days
        for (let i = startDow - 1; i >= 0; i--) {
            const d = prevMonthLast - i;
            const dateStr = formatDateStr(currentYear, currentMonth - 1, d);
            html += makeDayCell(d, 'other-month', dateStr, currentYear, currentMonth - 1);
        }

        // Current month days
        const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = formatDateStr(currentYear, currentMonth, d);
            let cls = '';
            if (dateStr === todayStr) cls += ' is-today';
            if (selectedDate && dateStr === formatDateStr(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())) {
                cls += ' is-selected';
            }
            html += makeDayCell(d, cls, dateStr, currentYear, currentMonth);
        }

        // Next month padding — fill to complete the grid (6 rows max)
        const totalCells = startDow + totalDays;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= remaining; d++) {
            const dateStr = formatDateStr(currentYear, currentMonth + 1, d);
            html += makeDayCell(d, 'other-month', dateStr, currentYear, currentMonth + 1);
        }

        $days.innerHTML = html;

        // Attach click handlers
        $days.querySelectorAll('.cal-day-cell:not(.empty)').forEach(cell => {
            cell.addEventListener('click', function () {
                const date = new Date(this.dataset.date + 'T00:00:00');
                if (!isNaN(date)) {
                    // Navigate to month if different
                    if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) {
                        currentYear = date.getFullYear();
                        currentMonth = date.getMonth();
                        selectedDate = date;
                        renderGrid();
                    } else {
                        selectDate(date);
                    }
                }
            });
        });
    }

    function makeDayCell(day, extraClass, dateStr, year, month) {
        const evts = getEventsForDate(dateStr);
        let dotsHtml = '';
        let eventClass = '';
        if (evts.length > 0) {
            eventClass = ' has-events';
            const dotCount = Math.min(evts.length, 3);
            dotsHtml = '<div class="cal-day-bar"></div>'
                + '<div class="cal-day-dot">' + '<span></span>'.repeat(dotCount) + '</div>';
        }
        return `<div class="cal-day-cell ${extraClass}${eventClass}" data-date="${dateStr}">
                    <span>${day}</span>${dotsHtml}
                </div>`;
    }

    // ===== Select a day =====
    function selectDate(date) {
        selectedDate = date;
        // Update selection visuals
        $days.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('is-selected'));
        const dateStr = formatDateStr(date.getFullYear(), date.getMonth(), date.getDate());
        const cell = $days.querySelector(`[data-date="${dateStr}"]`);
        if (cell) cell.classList.add('is-selected');

        // Update left panel
        const d = date.getDate();
        $dayNum.textContent = d < 10 ? '0' + d : d;
        $dayMonth.textContent = MONTH_NAMES[date.getMonth()] + '  ' + date.getFullYear();

        // Show events for this day
        renderDayEvents(dateStr);
    }

    function clearSelection() {
        selectedDate = null;
        $dayNum.textContent = '--';
        $dayMonth.textContent = MONTH_NAMES[currentMonth] + '  ' + currentYear;
        $dayEvents.innerHTML = `
            <div class="cal-day-events-title">EVENTOS</div>
            <div class="cal-day-no-events">Selecciona un día</div>`;
    }

    // ===== Day events list =====
    function renderDayEvents(dateStr) {
        const evts = getEventsForDate(dateStr);
        let html = '<div class="cal-day-events-title">EVENTOS</div>';

        if (evts.length === 0) {
            html += '<div class="cal-day-no-events">Sin eventos este día</div>';
        } else {
            evts.forEach(evt => {
                const timeStr = formatEventTime(evt);
                const locHtml = evt.location
                    ? `<div class="cal-event-card-location"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(evt.location)}</div>`
                    : '';
                html += `
                    <div class="cal-event-card" data-event-id="${evt.id}">
                        <div class="cal-event-card-title">${escapeHtml(evt.title)}</div>
                        ${timeStr ? `<div class="cal-event-card-time"><i class="fa-regular fa-clock"></i> ${timeStr}</div>` : ''}
                        ${locHtml}
                    </div>`;
            });
        }

        $dayEvents.innerHTML = html;

        // Click on event card → open modal
        $dayEvents.querySelectorAll('.cal-event-card').forEach(card => {
            card.addEventListener('click', function () {
                const evtId = parseInt(this.dataset.eventId);
                const evt = allEvents.find(e => e.id === evtId);
                if (evt) openEventModal(evt);
            });
        });
    }

    // ===== Event modal =====
    function openEventModal(evt) {
        const $modal = document.getElementById('eventModal');
        if (!$modal) return;

        document.getElementById('eventModalLabel').textContent = evt.title || 'Evento';
        document.getElementById('eventDesc').textContent = evt.description || '';

        // Image
        const $img = document.getElementById('eventImg');
        if (evt.imagen) {
            $img.src = evt.imagen;
            $img.classList.remove('none');
        } else {
            $img.classList.add('none');
        }

        // Dates
        const startDate = evt.start ? new Date(evt.start) : null;
        const endDate = evt.end ? new Date(evt.end) : null;

        const $startDate = document.getElementById('eventStartDate');
        const $startTime = document.getElementById('eventStartTime');
        const $endDate = document.getElementById('eventEndDate');
        const $endTime = document.getElementById('eventEndTime');
        const $separator = document.getElementById('dateSeparator');

        if (startDate) {
            $startDate.textContent = startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
            $startTime.textContent = evt.allDay ? 'Todo el día' : startDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        } else {
            $startDate.textContent = '';
            $startTime.textContent = '';
        }

        if (endDate && evt.end !== evt.start) {
            $endDate.textContent = endDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
            $endTime.textContent = evt.allDay ? '' : endDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            $separator.style.display = '';
        } else {
            $endDate.textContent = '';
            $endTime.textContent = '';
            $separator.style.display = 'none';
        }

        // Location
        document.getElementById('eventLoc').textContent = evt.location || 'No especificada';

        // Button
        const $btnDiv = document.getElementById('eventBtnDiv');
        const $btn = document.getElementById('eventBtn');
        if (evt.button) {
            $btn.href = evt.button;
            $btnDiv.classList.remove('none');
        } else {
            $btnDiv.classList.add('none');
        }

        // Show modal (MDB)
        if (typeof mdb !== 'undefined' && mdb.Modal) {
            const modal = new mdb.Modal($modal);
            modal.show();
        } else {
            // Fallback: manual toggle
            $modal.classList.add('show');
            $modal.style.display = 'block';
            document.body.classList.add('modal-open');
            const closeBtn = $modal.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    $modal.classList.remove('show');
                    $modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                };
            }
        }
    }

    // ===== Fetch events =====
    function fetchEvents() {
        if (!eventsUrl) return Promise.resolve();
        return fetch(eventsUrl)
            .then(r => r.json())
            .then(data => {
                allEvents = data.map(e => ({
                    id: e.id,
                    title: e.title || '',
                    description: e.description || '',
                    location: e.location || '',
                    imagen: e.imagen || '',
                    button: e.button || '',
                    start: e.start || '',
                    end: e.end || '',
                    allDay: e.allDay || false,
                    classNames: e.classNames || ''
                }));
            })
            .catch(err => {
                console.warn('Error loading calendar events:', err);
                allEvents = [];
            });
    }

    // ===== Helpers =====
    function getEventsForDate(dateStr) {
        return allEvents.filter(evt => {
            if (!evt.start) return false;
            const evtStart = evt.start.substring(0, 10);
            const evtEnd = evt.end ? evt.end.substring(0, 10) : evtStart;
            return dateStr >= evtStart && dateStr <= evtEnd;
        });
    }

    function formatDateStr(year, month, day) {
        // Handle month overflow
        const d = new Date(year, month, day);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }

    function formatEventTime(evt) {
        if (evt.allDay) return 'Todo el día';
        if (!evt.start) return '';
        const s = new Date(evt.start);
        const timeStr = s.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        if (evt.end) {
            const e = new Date(evt.end);
            const endStr = e.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            return timeStr + ' – ' + endStr;
        }
        return timeStr;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

})();
