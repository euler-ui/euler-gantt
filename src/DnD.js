import moment from "moment";
import interact from "interactjs";
import { GANTT_DAY_WIDTH } from "./Constants";

class DnD {
  constructor(allSchedules, minDate) {
    this._allSchedules = allSchedules;
    this._minDate = minDate;
  }
  getSchedule(sid) {
    return this._allSchedules.filter(schedule => schedule.getId() === sid)[0];
  }
  onEnd(event) {
    const target = event.target;
    const schedule = this.getSchedule(target.getAttribute("sid"));
    const daysOfWidth = parseInt(target.offsetWidth / GANTT_DAY_WIDTH);
    const daysFromMinDate = parseInt(target.offsetLeft / GANTT_DAY_WIDTH);
    const startDate = moment(this._minDate).add(daysFromMinDate, "days");
    const endDate = moment(startDate).add(daysOfWidth - 1, "days");
    schedule.updateDate(startDate, endDate);
  }
  getScheduleSelector() {
    const selectors = this._allSchedules.map(schedule => `.gantt-item-schedule[sid='${schedule.getId()}']`);
    return selectors.join(",");
  }
  init() {
    const isElementOverlapped = (element, dx, resizeEdges) => {
      const siblings = element.parentElement.children;
      const eleOffsetLeft = element.offsetLeft;
      const eleWidth = element.offsetWidth;
      return Array.prototype.some.call(siblings, (sibling) => {
        if (sibling === element) {
          return false;
        }
        const sibOffsetLeft = sibling.offsetLeft;
        // resize
        if (resizeEdges) {
          if ((resizeEdges.left && sibOffsetLeft < eleOffsetLeft && sibling.offsetWidth + sibOffsetLeft > eleOffsetLeft + dx) || (resizeEdges.right && eleOffsetLeft < sibOffsetLeft && eleWidth + eleOffsetLeft + dx > sibOffsetLeft)) {
            return true;
          }
        // drag
        } else if ((dx < 0 && sibOffsetLeft < eleOffsetLeft && sibling.offsetWidth + sibOffsetLeft > eleOffsetLeft + dx) || (dx > 0 && eleOffsetLeft < sibOffsetLeft && eleWidth + eleOffsetLeft + dx > sibOffsetLeft)) {
          return true;
        }
        return false;
      });
    };
    if (!this._allSchedules.length) {
      return;
    }
    interact(this.getScheduleSelector())
      .draggable({
        snap: {
          targets: [
            interact.createSnapGrid({
              x: GANTT_DAY_WIDTH
            })
          ]
        },
        // enable inertial throwing
        inertia: true,
        onmove(event) {
          const target = event.target;
          const offsetWidth = target.offsetWidth;
          const left = target.offsetLeft;
          const parentClientWidth = target.parentElement.clientWidth;
          if (event.dx === 0 || isElementOverlapped(target, event.dx)) {
            return;
          }
          if (left + offsetWidth + event.dx > parentClientWidth || left + event.dx < 0) {
            return;
          }
          target.style.left = `${parseInt(left) + event.dx}px`;
        },
        onend: this.onEnd.bind(this)
      })
      .resizable({
        snap: {
          targets: [
            interact.createSnapGrid({
              x: GANTT_DAY_WIDTH
            })
          ]
        },
        inertia: true,
        edges: {
          left: true,
          right: true
        },
        onmove(event) {
          const target = event.target;
          const width = target.offsetWidth;
          const left = target.offsetLeft;
          const parentClientWidth = target.parentElement.clientWidth;
          if (event.dx === 0 || isElementOverlapped(target, event.dx, event.edges)) {
            return;
          }
          if (event.edges.left) {
            if (left + event.dx < 0 || width - event.dx < GANTT_DAY_WIDTH) {
              return;
            }
            target.style.width = `${width - event.dx}px`;
            target.style.left = `${left + event.dx}px`;
          } else { // event.edges.right
            if (left + width + event.dx > parentClientWidth || width + event.dx < GANTT_DAY_WIDTH) {
              return;
            }
            target.style.width = `${width + event.dx}px`;
          }
        },
        onend: this.onEnd.bind(this)
      });
  }
}

export default DnD;
