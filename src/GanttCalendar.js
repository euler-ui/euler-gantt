import moment from "moment";
import { GANTT_MONTH_HEIGHT, GANTT_DAY_WIDTH } from "./Constants";

class GanttCalendarMonth {
  constructor(nthMonth, minDate, maxDate) {
    const curDate = moment(minDate).add(nthMonth, "months");

    this._startDay = 1;
    if (curDate.toString() === minDate.toString()) {
      const firstDayOfNextMonth = moment(minDate).add(1, "months").date(1);
      this._startDay = parseInt(minDate.format("D"));
      this._daysCount = firstDayOfNextMonth.diff(curDate, "days");
    } else if (curDate.format("YYYY-MM") === maxDate.format("YYYY-MM")) {
      const lastDayOfPrevMonth = moment(curDate).date(0);
      this._daysCount = maxDate.diff(lastDayOfPrevMonth, "days");
    } else {
      this._daysCount = curDate.daysInMonth();
    }
    this._month = curDate.format("YYYY.MM");
  }
  getView() {
    const daysHTML = [];
    const daysCount = this._daysCount;
    for (let i = 0; i < daysCount; i++) {
      const weekday = moment(this._month, "YYYY.MM").date(0).add(this._startDay + i, "days").weekday();
      const isWeekend = weekday === 6 || weekday === 0;
      daysHTML.push(`
<div class="gantt-calendar-day ${isWeekend ? "gantt-calendar-day-weekend" : ""}" style="width:${GANTT_DAY_WIDTH}px;">
  <div class="gantt-calendar-day__header" style="height:${GANTT_MONTH_HEIGHT}px;line-height:${GANTT_MONTH_HEIGHT}px">${this._startDay + i}</div>
</div>
      `);
    }
    return `
<div class="gantt-calendar-month" style="width:${this._daysCount * GANTT_DAY_WIDTH}px">
  <div class="gantt-calendar-month__header" style="height:${GANTT_MONTH_HEIGHT}px;line-height:${GANTT_MONTH_HEIGHT}px">${this._month}</div>
  <div class="gantt-calendar-month__days" style="top:${GANTT_MONTH_HEIGHT}px">
  ${daysHTML.join("\n")}
  </div>
</div>
    `;
  }
}

class GanttCalendarView {
  constructor(minDate, maxDate) {
    this._minDate = minDate;
    this._maxDate = maxDate;
    this._initMonths();
  }
  _initMonths() {
    const monthNumber = this._maxDate.diff(this._minDate, "month");
    this._months = [];
    for (let i = 0; i < monthNumber + 1; i++) {
      this._months.push(new GanttCalendarMonth(i, this._minDate, this._maxDate));
    }
  }

  getView() {
    return `
<div class="gantt-body-calendar">
${this._months.map(calendarMonth => calendarMonth.getView()).join("\n")}
</div>
    `;
  }
}

export default GanttCalendarView;
