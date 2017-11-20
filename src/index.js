import moment from "moment";
import "./gantt.css";
import DnD from "./DnD";
import GanttCalendar from "./GanttCalendar";
import GanttItem from "./GanttItem";
import GanttScheduleView from "./GanttScheduleView";
import { GANTT_HEADER_WIDTH, GANTT_ITEM_HEIGHT, GANTT_DAY_WIDTH, GANTT_BODY_BORDER, GANTT_DAY_HEIGHT, GANTT_MONTH_HEIGHT, MIN_DATE_ADVANCE, MAX_DATE_EXTEND, BRAND_SIZE } from "./Constants";


class GanttEditor {
  constructor(options) {
    this._init(options);
    this.render();
    this._initDnD();
  }
  getSchedule(sid) {
    return this._allSchedules.filter(schedule => schedule._meta.id === sid)[0];
  }
  getItem(itemId) {
    return this._allItems.filter(item => item._meta.id === itemId)[0];
  }
  _initDnD() {
    new DnD(this._allSchedules, this._minMaxDate[0]).init();
  }
  _init(options) {
    const data = options.data || [];
    this._el = GanttEditor.genEl(options.el);

    const minMaxDate = GanttEditor.genMinMaxDate(data);
    this._minMaxDate = minMaxDate;

    const items = data.map((item, id) => new GanttItem(item, id, minMaxDate[0]));
    this._items = items;
    this._scheduleView = new GanttScheduleView(items);
    this._calendar = new GanttCalendar(minMaxDate[0], minMaxDate[1]);
    this._allSchedules = this._scheduleView.getItemsWithSchedules()
      .reduce((allSchedules, itemSchedules) => allSchedules.concat(itemSchedules), []);
    this._allItems = items.reduce((allItems, item) => allItems.concat(item).concat(item.getSubItems()), []);
    this._bodyWidth = GANTT_DAY_WIDTH * (minMaxDate[1].diff(minMaxDate[0], "days") + 1);
  }
  static genEl(el) {
    if (typeof el === "string" || el instanceof String) {
      return document.querySelector(el);
    }
    return el;
  }
  static genMinMaxDate(data) {
    let maxDate = moment("0000-01-01");
    let minDate = moment("9999-01-01");
    const calculateMinMax = (items) => {
      items.forEach((item) => {
        item.items && calculateMinMax(item.items);
        item.schedules && item.schedules.forEach((schedule) => {
          const dates = schedule.dates;
          if (dates.length === 2) {
            minDate = moment.min(minDate, moment(dates[0]));
            maxDate = moment.max(maxDate, moment(dates[1]));
          }
        });
      });
    };
    calculateMinMax(data);
    return [minDate.subtract(MIN_DATE_ADVANCE, "days"), maxDate.add(MAX_DATE_EXTEND, "days")];
  }
  getData() {
    return this._items.map(item => item.getData());
  }
  render() {
    const view = this.getView();
    this._el && (this._el.innerHTML = view);
  }
  getView() {
    const innerHeight = GANTT_MONTH_HEIGHT + GANTT_DAY_HEIGHT +
      (this._scheduleView.getItemsWithSchedules().length * GANTT_ITEM_HEIGHT);
    return `
<div class="gantt-editor" style="max-width:${this._bodyWidth + GANTT_HEADER_WIDTH + (GANTT_BODY_BORDER * 2)}px">
  <div class="gantt-editor-header" style="width:${GANTT_HEADER_WIDTH}px">
    <div class="gantt-brand" style="height:${GANTT_MONTH_HEIGHT + GANTT_DAY_HEIGHT}px;background-size:${BRAND_SIZE}px"></div>
    <div class="gantt-item-headers">
    ${this._items.map(item => item.getHeaderView()).join("\n")}
    </div>
  </div>
  <div class="gantt-editor-body" style="border-width: ${GANTT_BODY_BORDER}px">
    <div class="gantt-body-inner" style="width:${this._bodyWidth}px;height:${innerHeight}px">
      ${this._calendar.getView()}
      ${this._scheduleView.getView()}
    </div>
  </div>
</div>
`;
  }
}

class Gantt {
  static init(options = {}) {
    return new GanttEditor(options);
  }
}
export default Gantt;
