import moment from "moment";
import Colors from "./Colors";
import { GANTT_DAY_WIDTH, GANTT_SCHEDULE_MARGIN, GANTT_HEADER_WIDTH, GANTT_ITEM_HEIGHT } from "./Constants";

class GanttItemSchedule {
  constructor(conf) {
    const startEndDate = conf.startEndDate;
    const startDate = moment(startEndDate[0]);
    const endDate = moment(startEndDate[1]);
    this._meta = conf.meta;
    this._name = conf.name;
    this._minDate = conf.minDate;
    this._left = startDate.diff(conf.minDate, "days") * GANTT_DAY_WIDTH;
    this._width = (endDate.diff(startDate, "days") + 1) * GANTT_DAY_WIDTH;
    this._bgColor = conf.bgColor;
    this._borderColor = conf.borderColor;
    this._startDate = startDate;
    this._endDate = endDate;
    this._id = conf.id;
  }
  getData() {
    const result = {};
    if (this._meta.id) {
      result.id = this._meta.id;
    }
    result.name = this._name;
    result.dates = [this._startDate.format("YYYY-MM-DD"), this._endDate.format("YYYY-MM-DD")];
    return result;
  }
  getId() {
    return this._id;
  }
  getStartEndDate() {
    return [this._startDate, this._endDate];
  }
  updateDate(startDate, endDate) {
    this._startDate = startDate;
    this._endDate = endDate;
    this._left = startDate.diff(this._minDate, "days") * GANTT_DAY_WIDTH;
    this._width = (endDate.diff(startDate, "days") + 1) * GANTT_DAY_WIDTH;
    document.querySelector(`.gantt-item-schedule[sid='${this._id}']`).outerHTML = this.getView();
  }
  static genStyle(style) {
    let result = "";
    Object.keys(style).forEach((key) => {
      result += `${key}:${style[key]};`;
    });
    return result;
  }
  getView() {
    const scheduleHeight = GANTT_ITEM_HEIGHT / 2;
    const scheduleStyle = GanttItemSchedule.genStyle({
      "padding-left": `${GANTT_SCHEDULE_MARGIN}px`,
      "padding-right": `${GANTT_SCHEDULE_MARGIN}px`,
      top: `${scheduleHeight / 2}px`,
      width: `${this._width}px`,
      left: `${this._left}px`
    });
    const schdeulBarStyle = GanttItemSchedule.genStyle({
      height: `${scheduleHeight}px`,
      "line-height": `${scheduleHeight}px`,
      "background-color": `${this._bgColor}`,
      border: `1px solid ${this._borderColor}`
    });
    return `
<div class="gantt-item-schedule" sid="${this._id}" style="${scheduleStyle}">
  <div class="gantt-item-schedule-resizer-l"><div class="gantt-item-schedule-pointer" style="background-color:${this._borderColor}"></div></div>
  <div class="gantt-item-schedule-bar" aria-label="${this._name}&#10;${this._startDate.format("YYYY.MM.DD")} - ${this._endDate.format("YYYY.MM.DD")}" style="${schdeulBarStyle}">${this._name}</div>
  <div class="gantt-item-schedule-resizer-r"><div class="gantt-item-schedule-pointer" style="background-color:${this._borderColor}"></div></div>
</div>
`;
  }
}
class GanttItem {
  constructor(conf, id, minDate) {
    this._meta = conf;
    this._name = conf.name;
    this._id = `${id}`;

    const bgColor = Colors.get(this.getId(), "A100");
    const borderColor = Colors.get(this.getId(), "A400");
    const schedules = conf.schedules || [];
    this._schedules = schedules.map((schedule, index) => new GanttItemSchedule({
      id: `${this.getId()}_${index}`,
      meta: schedule,
      name: schedule.name,
      startEndDate: schedule.dates,
      minDate,
      bgColor,
      borderColor
    }));

    const items = conf.items || [];
    this._subItems = items.map((item, sid) => new GanttItem(item, `${id}_${sid}`, minDate));
  }
  getId() {
    return this._id;
  }
  getData() {
    const result = {};
    if (this._meta.id) {
      result.id = this._meta.id;
    }
    result.name = this._name;
    result.schedules = this._schedules.map(schedule => schedule.getData());
    result.items = this._subItems.map(subItem => subItem.getData());
    return result;
  }
  getSubItems() {
    return this._subItems;
  }
  getSchedules() {
    return this._schedules;
  }
  renderSubHeaderViews() {
    if (!this._subItems.length) {
      return "";
    }
    return `<div class="gantt-item-sub-headers" style="position:absolute;top:0px;left:50%;width:${GANTT_HEADER_WIDTH / 2}px;">
${this._subItems.map(item => item.getHeaderView()).join("\n")}
</div>`;
  }
  getHeaderView() {
    const subItems = this._subItems;
    const itemWidth = (subItems.length && (subItems.length * GANTT_ITEM_HEIGHT)) || GANTT_ITEM_HEIGHT;
    const itemHeight = (this._id.indexOf("_") !== -1 || subItems.length) ? GANTT_HEADER_WIDTH / 2 : GANTT_HEADER_WIDTH;
    return `
<div class="gantt-item-header" itemId="${this._id}" style="height:${itemWidth}px;">
<div class="gantt-item-header__title" style="width:${itemWidth}px;background-color:${Colors.get(this._id)};height:${itemHeight}px;transform:translate(0, ${itemWidth}px) rotate(-90deg)">
${this._name}
</div>
${this.renderSubHeaderViews()}
</div>
`;
  }
}

export default GanttItem;
