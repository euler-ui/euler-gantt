import { GANTT_MONTH_HEIGHT, GANTT_DAY_HEIGHT, GANTT_ITEM_HEIGHT } from "./Constants";

class GanttScheduleView {
  constructor(items) {
    this._items = items;
    this._init();
  }
  _init() {
    this._itemsWithSchedules = this._items.reduce((itemsWithSchedules, item) => {
      if (item.getSubItems().length) {
        item.getSubItems().forEach((subItem) => {
          itemsWithSchedules.push(subItem.getSchedules());
        });
      } else {
        itemsWithSchedules.push(item.getSchedules());
      }
      return itemsWithSchedules;
    }, []);
  }
  getItemsWithSchedules() {
    return this._itemsWithSchedules;
  }
  getView() {
    return `
<div class="gantt-body-schedules" style="padding-top:${GANTT_MONTH_HEIGHT + GANTT_DAY_HEIGHT}px">
${this._itemsWithSchedules.map(itemSchedules => `
<div class="gantt-item-schedules" style="height:${GANTT_ITEM_HEIGHT}px">
${itemSchedules.map(schedule => schedule.getView()).join("\n")}
</div>
    `).join("\n")}
</div>
    `;
  }
}
export default GanttScheduleView;
