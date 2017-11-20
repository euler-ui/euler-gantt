import Gantt from '../src';
import TestHelper from './utility/TestHelper';
import Events from './utility/Events';
import Colors from 'Colors';
import moment from "moment";
import Promise from 'bluebird';
describe('Gantt', () => {
  after(function() {
    Colors.get.restore && Colors.get.restore();
  });
  let ganttView = "";
  const givenGanttView = () => {
    ganttView = Gantt.init({
      el: TestHelper.addDivToBody(),
      data: [{
        name: "M1",
        id: "m1",
        items: [{
          name: "M1-1",
          id: "m1_1",
          schedules: [{
            id: "m1_1_s1",
            name: "M1-1 Schedule 1",
            dates: ["2017-02-01", "2017-02-05"]
          }, {
            id: "m1_1_s2",
            name: "M1-1 Schedule 2",
            dates: ["2017-02-06", "2017-02-09"]
          }, {
            id: "m1_1_s3",
            name: "M1-1 Schedule 3",
            dates: ["2017-02-11", "2017-02-21"]
          }]
        }, {
          name: "M1-2",
          id: "m1_2",
          schedules: [{
            id: "m1_2_s1",
            name: "M1-2 Schedule 1",
            dates: ["2017-02-01", "2017-02-11"]
          }]
        }]
      }, {
        name: "M2",
        id: "m2",
        schedules: [{
          id: "m2_s1",
          name: "M2 Schedule 1",
          dates: ["2017-02-01", "2017-02-05"]
        }, {
          id: "m2_s2",
          name: "M2 Schedule 2",
          dates: ["2017-02-06", "2017-02-09"]
        }, {
          id: "m2_s3",
          name: "M2 Schedule 3",
          dates: ["2017-02-11", "2017-02-21"]
        }]
      }, {
        name: "M3",
        id: "m3",
        schedules: [{
          id: "m3_s1",
          name: "M3 Schedule 1",
          dates: ["2017-02-06", "2017-03-21"]
        }]
      }]
    });
  };
  it('#init Gantt should be created correctly', () => {
    const colorGetSpy = sinon.spy(Colors, "get");

    const assertGanttBasic = () => {
      const minMaxDate = ganttView._minMaxDate;
      assert.equal(minMaxDate[0].format("YYYY-MM-DD"), "2017-02-01");
      assert.equal(minMaxDate[1].format("YYYY-MM-DD"), "2017-03-21");
      assert.ok($(".gantt-editor")[0], "Gantt editor should be found.");
      assert.equal($(".gantt-editor-body").length, 1, "Gantt Editor should have body.");
      assert.equal($(".gantt-editor-body").css("margin-left"), "60px", "The gantt-editor-body's margin-left should be 60px");

      assert.equal($(".gantt-body-inner").outerHeight(true), 296, "gantt-body-inner height should be 296px.");
      assert.equal(parseInt($(".gantt-editor").css("max-width")), $(".gantt-editor-body").outerWidth() + $(".gantt-editor-header").outerWidth(), "gantt-editor's max-width should be the same as the width of gantt-body-inner.");
      assert.ok(ganttView._scheduleView);
    }

    const assertGanttItems = () => {
      const ganttItems = ganttView._items;
      assert.ok(ganttItems);
      assert.equal(ganttItems.length, 3, "It should have 3 gantt items.");

      const ganttItem = ganttItems[0];
      assert.ok(ganttItem);
      assert.equal(ganttItem && ganttItem._subItems && ganttItem._subItems.length, 2, "The first gantt item should have two sub items.");
      assert.equal(ganttItem.getId(), 0, "ganttItem should has its id 0");
      assert.ok($(`[itemId=${ganttItem.getId()}]`)[0], "ganttItem should be found by its id");

      const ganttItem_subItem = ganttItem._subItems[0];
      assert.equal(ganttItem_subItem._schedules.length, 3);
    }

    const assertGanttHeader = () => {
      assert.equal($(".gantt-editor-header").length, 1, "Gantt Editor should have header.");
      assert.equal($(".gantt-editor-header").outerWidth(), 60, "Gantt Header width should be 60px.");
      assert.equal($(".gantt-editor-header").css("border-top"), "1px solid rgb(238, 238, 238)", "gantt-editor-header border top should be 1px solid rgb(238, 238, 238).");
      assert.equal($(".gantt-editor-header").css("border-left"), "1px solid rgb(238, 238, 238)", "gantt-editor-header border left should be 1px solid rgb(238, 238, 238).");
      assert.ok($(".gantt-editor-header .gantt-brand")[0], "Gantt brand should be found at gantt-editor-header");
      assert.ok($(".gantt-editor-header .gantt-brand").css("background-image"), "Gantt brand should have background-image");
      assert.equal($(".gantt-editor-header .gantt-brand").css("background-size"), "45px", "Gantt brand's size should be 45px");
      assert.equal($(".gantt-editor-header .gantt-brand").outerHeight(), 56, "Gantt brand's height should be 56.");
      assert.equal($(".gantt-item-header").length, 5, "Editor item number should be 4.");
      assert.equal($(".gantt-item-headers > .gantt-item-header").css("border-top"), "1px solid rgb(255, 255, 255)", "border-top of first layer gantt item header should be 1px solid rgb(255, 255, 255)");
      assert.equal($(".gantt-item-headers > .gantt-item-header").css("border-bottom"), "1px solid rgb(255, 255, 255)", "border-bottom of first layer gantt item header should be 1px solid rgb(255, 255, 255)");
      assert.equal($(".gantt-item-headers > .gantt-item-header").css("position"), "relative", "position of first layer gantt item header should be relative");
      assert.equal($(".gantt-item-header__title").length, 5, "Editor item title number should be 4.");
    }

    const assertGanttCalendar = () => {
      const calendar = ganttView._calendar;
      assert.ok(calendar, "Calendar not found");
      assert.ok(calendar._months, "Calendar month not found");
      assert.equal(calendar._months.length, 2, "Calendar should have 2 months");
      assert.ok($(".gantt-body-calendar")[0], "gantt-body-calendar should be found.");
      const expectedWidth = $(".gantt-calendar-month").toArray().reduce((count, month) => {
        return count + $(month).outerWidth();
      }, 0)
      assert.equal($(".gantt-body-calendar").width(), expectedWidth, "gantt-body-calendar its width should be the width sum of its months");
      assert.equal($(".gantt-editor-header").height(), $(".gantt-body-calendar").height(), "gantt-body-calendar its height should be the same as gantt-editor-header's height.");
      assert.equal($(".gantt-calendar-month").length, 2, "Each Calendar month should have one gantt-calendar-month.");
      assert.equal($(".gantt-calendar-month__header").length, 2, "Each Calendar month should have one gantt-calendar-month__header.");
      assert.equal($(".gantt-calendar-month__header").outerHeight(), 28, "Each Calendar month header height should be 28px.");
      assert.equal($(".gantt-calendar-month__header").css("border-right"), "1px solid rgb(221, 221, 221)", "Each Calendar month header right border should be 1px solid rgb(221, 221, 221).");
      assert.equal($(".gantt-calendar-month:last .gantt-calendar-month__header").css("border-right"), "0px none rgb(221, 221, 221)", "Last Calendar month header's right border should not have border-right.");
      assert.equal($(".gantt-calendar-month:last .gantt-calendar-day:last").css("border-right"), "0px none rgb(221, 221, 221)", "Last Calendar day's right border should not have border-right.");

      assert.equal($(".gantt-calendar-month__days").length, 2, "Each Calendar month should have one gantt-calendar-month__days.");
      assert.equal($(".gantt-calendar-day").css("border-right"), "1px solid rgb(221, 221, 221)", "Each Calendar day right border should be 1px solid rgb(221, 221, 221).");
      assert.equal($(".gantt-body-calendar").position().top, 0, "The gantt-body-calendar's top should be 0 relative to gantt-editor-body");
      assert.equal($(".gantt-calendar-month__days:first .gantt-calendar-day").length, 28, "It should have 28 days at month 2017.02");
      assert.equal($(".gantt-calendar-month__days:first .gantt-calendar-day__header").length, 28, "It should have 28 day headers at month 2017.02");
      assert.equal($(".gantt-calendar-day__header").outerHeight(), 28, "Each gantt-calendar-day__header height should be 28px");
      assert.equal($(".gantt-calendar-day__header").css("border-bottom"), "1px solid rgb(221, 221, 221)", "gantt-calendar-day__header's border should be 1px solid rgb(221, 221, 221).");
      assert.equal($(".gantt-calendar-day").outerWidth(), 24, "Each gantt-calendar-day__header width should be 24px");
      assert.equal($(".gantt-calendar-month:first").outerWidth(), 24 * 28, "First month width should be [the width of a day * the numbers of its days]");
      assert.equal($(".gantt-calendar-month:last").outerWidth(), 24 * $(".gantt-calendar-month__days:last .gantt-calendar-day").length, "Second month width should be [the width of a day * the numbers of its days]");
      assert.equal($(".gantt-calendar-month:first .gantt-calendar-day__header:eq(0)").text(), "1", "the first day of the first month is day 1");
      assert.equal($(".gantt-calendar-month:first .gantt-calendar-day__header:last").text(), "28", "the last day of the first month is day 28");
      assert.equal($(".gantt-calendar-month:last .gantt-calendar-day__header:last").text(), "21", "the last day of the second month is day 1");
      assert.equal($(".gantt-calendar-day__header").css("text-align"), "center", "gantt-calendar-day__header's text-align should be middle");
      assert.equal($(".gantt-calendar-day__header").css("line-height"), $(".gantt-calendar-day__header").css("height"), "gantt-calendar-day__header's line height should be the same as its height");
      assert.equal($(".gantt-calendar-month:first .gantt-calendar-month__header").text(), "2017.02", "the first month is 2017.02");
      assert.equal($(".gantt-calendar-month__header").css("text-align"), "center", "the month header should be text-align");
      assert.equal($(".gantt-calendar-month__header").css("line-height"), $(".gantt-calendar-month__header").css("height"), "the month header's line height should be the same as its height.'");
      assert.equal($(".gantt-calendar-month:last .gantt-calendar-month__header").text(), "2017.03", "the second month is 2017.03");
      assert.equal($(".gantt-calendar-day-weekend").length, 14, "There should be 14 gantt-calendar-day which are at weekends.");
      assert.equal($(".gantt-calendar-day-weekend").css("background-color"), "rgba(221, 221, 221, 0.2)", "gantt-calendar-day-weekend's background color should be rgba(221, 221, 221, 0.2)");
    }

    const assertGanttSchedules = () => {
      assert.equal(colorGetSpy.callCount, 15, "random color should be called 15 times");
      assert.ok($(".gantt-body-schedules")[0], "gantt-body-schedules should be found.");
      assert.equal($(".gantt-item-schedules").length, 4, "The number of gantt schedules should be 4.");
      assert.equal($(".gantt-item-schedule").length, 8, "It totally has 8 schedules.");
      assert.equal($(".gantt-item-schedules:eq(0)").position().top, 56, "The first gantt-item-schedules's top should be 0 relative to its parent");
      assert.equal($(".gantt-item-schedules:eq(1)").position().top, 116, "The second gantt-item-schedules's top should be 60 relative to its parent");
      assert.equal($(".gantt-item-schedules:eq(2)").position().top, 176, "The third gantt-item-schedules's top should be 120 relative to its parent");
      assert.equal($(".gantt-item-schedules").css("border-bottom"), "1px solid rgb(221, 221, 221)", "border bottom of gantt-item-schedules should be 1px");
      assert.equal($(".gantt-item-schedules:last").css("border-bottom"), "0px none rgb(221, 221, 221)", "border bottom of gantt-item-schedules should be 1px");

      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(0)").position().top, 15, "the top of the first gantt-item-schedule of the first gantt-item-schedules should be 15px.");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(0)").outerWidth(true), 120, "the width of the first gantt-item-schedule of the first gantt-item-schedules should be 120px.");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(0)").outerHeight(), 30, "the height of the first gantt-item-schedule of the first gantt-item-schedules should be 30px.");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(2)").position().left, 240, "the left of the third gantt-item-schedule of the first gantt-item-schedules should be 240px.");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(2)").position().top, 15, "the top of the third gantt-item-schedule of the first gantt-item-schedules should be 15px.");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(2)").outerHeight(), 30, "the height of the third gantt-item-schedule of the first gantt-item-schedules should be 30px.");
      assert.equal($(".gantt-item-schedules:eq(1) .gantt-item-schedule:eq(0)").position().top, 15, "the top of the first gantt-item-schedule of the second gantt-item-schedules should be 15px.");
      assert.equal($(".gantt-item-schedules:eq(1) .gantt-item-schedule:eq(0)").outerHeight(), 30, "the height of the first gantt-item-schedule of the second gantt-item-schedules should be 30px.");
      assert.notEqual($(".gantt-item-schedule-bar:first").css("background-color"), "rgba(0, 0, 0, 0)", "the first gantt-item-schedule-bar should be colored.");
      assert.notEqual($(".gantt-item-schedule-bar:last").css("background-color"), "rgba(0, 0, 0, 0)", "the last gantt-item-schedule-bar should be colored.");
      assert.equal($(".gantt-item-schedule").css("padding-left"), "4px", "the padding-left of gantt-item-schedule should be 4px.");
      assert.equal($(".gantt-item-schedule-bar").css("border-radius"), "4px", "the border raidus of gantt-item-schedule-bar should be 4px.");
      assert.equal($(".gantt-item-schedule-bar").css("overflow"), "hidden", "the overflow of gantt-item-schedule-bar should be hidden.");
      assert.equal($(".gantt-item-schedule-bar").css("text-overflow"), "ellipsis", "the text-overflow of gantt-item-schedule-bar should be ellipsis.");
      assert.equal($(".gantt-item-schedule-bar").css("white-space"), "nowrap", "the white-space of gantt-item-schedule-bar should be nowrap.");
      assert.equal($(".gantt-item-schedule-bar:eq(0)").html(), "M1-1 Schedule 1", "The first gantt-item-schedule-bar's html should be M1-1 Schedule 1");

      assert.equal(ganttView._allSchedules.length, 8, "Gantt Body #getAllSchedules should be correct");
      const thirdSchedule = ganttView._allSchedules[2];
      assert.equal(thirdSchedule.getStartEndDate()[0].format("YYYY-MM-DD"), "2017-02-11", "The third gantt schedule's start date should be 2017-02-11");
      assert.equal(thirdSchedule.getStartEndDate()[1].format("YYYY-MM-DD"), "2017-02-21", "The third gantt schedule's end date should be 2017-02-21");
      thirdSchedule.updateDate(moment("2017-02-13"), moment("2017-02-24"));
      assert.equal(thirdSchedule.getStartEndDate()[0].format("YYYY-MM-DD"), "2017-02-13", "The third gantt schedule's start date should be 2017-02-13");
      assert.equal(thirdSchedule.getStartEndDate()[1].format("YYYY-MM-DD"), "2017-02-24", "The third gantt schedule's end date should be 2017-02-24");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(2)").outerWidth(true), 288, "the width of the third gantt-item-schedule of the first gantt-item-schedules should be 288px.");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(2)").outerHeight(), 30, "the height of the third gantt-item-schedule of the first gantt-item-schedules should be 30px.");
      assert.equal($(".gantt-item-schedules:eq(0) .gantt-item-schedule:eq(2)").position().left, 288, "the left of the third gantt-item-schedule of the first gantt-item-schedules should be 288px.");
    }
    const assertGanttTooltips = () => {
      assert.equal($("[aria-label]").length, 8, "Gantt should have 8 tooltips");
      assert.equal($("[aria-label]:eq(0)").attr("aria-label"), "M1-1 Schedule 1\n2017.02.01 - 2017.02.05", "The first gantt schedule's tooltip should be correct.");
    }
    const assertGanttData = () => {
      const ganttData = ganttView.getData();
      assert.ok(ganttData, "Gantt data should not be null");
      assert.equal(ganttData.length, 3, "ganttData.length should be 3");
      assert.equal(ganttData[0].items.length, "2", "ganttData[0].items.length should be 2");
      assert.equal(ganttData[0].items[0].id, "m1_1", "ganttData[0].items[0].id should be m1_1");
      assert.equal(ganttData[0].items[0].name, "M1-1", "ganttData[0].items[0].id should be M1-1");
      assert.equal(ganttData[0].items[0].schedules[1].id, "m1_1_s2", "ganttData[0].items[0].schedules[1].id should be m1_1_s2");
      assert.equal(ganttData[0].items[0].schedules[1].name, "M1-1 Schedule 2", "ganttData[0].items[0].schedules[1].name should be M1-1 Schedule 2");
      assert.equal(ganttData[0].items[0].schedules[1].dates[0], "2017-02-06", "ganttData[0].items[0].schedules[1].dates[0] should be 2017-02-06");
      assert.equal(ganttData[0].items[0].schedules[1].dates[1], "2017-02-09", "ganttData[0].items[0].schedules[1].dates[1] should be 2017-02-09");
      assert.equal(ganttData[1].id, "m2", "ganttData[1].id should be m2");

      const scheduleData = ganttView.getSchedule("m1_1_s2").getData();
      assert.ok(scheduleData, "Schedule data should not be null");
      assert.equal(scheduleData.id, "m1_1_s2", "scheduleData.id should be m1_1_s2");
      assert.equal(scheduleData.name, "M1-1 Schedule 2", "scheduleData.name should be M1-1 Schedule 2");
      assert.equal(scheduleData.dates[0], "2017-02-06", "scheduleData.dates[0] should be 2017-02-06");
      assert.equal(scheduleData.dates[1], "2017-02-09", "scheduleData.dates[1] should be 2017-02-09");

      const itemData = ganttView.getItem("m1_1").getData();
      assert.ok(itemData, "Item data should not be null");
      assert.equal(itemData.id, "m1_1", "itemData.id should be m1_1");
      assert.equal(itemData.name, "M1-1", "itemData.id should be M1-1");
      assert.equal(itemData.schedules[1].id, "m1_1_s2", "itemData.schedules[1].id should be m1_1_s2");
      assert.equal(itemData.schedules[1].name, "M1-1 Schedule 2", "itemData.schedules[1].name should be M1-1 Schedule 2");
      assert.equal(itemData.schedules[1].dates[0], "2017-02-06", "itemData.schedules[1].dates[0] should be 2017-02-06");
      assert.equal(itemData.schedules[1].dates[1], "2017-02-09", "itemData.schedules[1].dates[1] should be 2017-02-09");
    }
    givenGanttView();
    assertGanttBasic();
    assertGanttItems();
    assertGanttTooltips();
    assertGanttHeader();
    assertGanttCalendar();
    assertGanttSchedules();
    assertGanttData();
  });
  it("Gantt schedules should be dragged correctly", function() {
    this.timeout(7000);
    TestHelper.clean();
    givenGanttView();
    debugger;

    const assertThirdGanttDates = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s3").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-12", "After drag, the third gantt schedule's start date should be 2017-02-12");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-22", "After drag, the third gantt schedule's end date should be 2017-02-22");
      resolve();
    }
    const assertFirstGanttDatesNotChanged = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s1").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-01", "After invliad darg, the second gantt schedule's start date should still be 2017-02-01");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-05", "After invliad darg, the second gantt schedule's end date should still be 2017-02-05");
      resolve();
    }
    const assertSecondGanttDatesAfterInvalidOperation = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s2").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-06", "After invalid resize, the second gantt schedule's start date should be 2017-02-06");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-09", "After invalid resize, the second gantt schedule's end date should be 2017-02-09");
      resolve();
    }
    const dragFirstGanttScheduleToIllegalNextDay1 = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule:eq(0)")[0], 24, 0, resolve);
    }

    const dragFirstGanttScheduleToIllegalNextDay2 = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule:eq(0)")[0], -24, 0, resolve);
    }

    const dragSecondGanttScheduleToIllegalPrevDay1 = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule:eq(1)")[0], -24, 0, resolve);
    }

    const dragThirdGanttScheduleToNextDay = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule:eq(2)")[0], 24, 0, resolve);
    }

    const promisedTest = TestHelper.execFn(dragThirdGanttScheduleToNextDay).delay(800).execFn(assertThirdGanttDates)
      .execFn(dragFirstGanttScheduleToIllegalNextDay1).delay(800).execFn(assertFirstGanttDatesNotChanged)
      .execFn(dragFirstGanttScheduleToIllegalNextDay2).delay(800).execFn(assertFirstGanttDatesNotChanged)
      .execFn(dragSecondGanttScheduleToIllegalPrevDay1).delay(800).execFn(assertSecondGanttDatesAfterInvalidOperation)
    return promisedTest.should.be.fulfilled;
  })
  it("Gantt schedules should be resized correctly", function() {
    this.timeout(12000);
    TestHelper.clean();
    givenGanttView();

    const assertSecondGanttDatesAfterAddingNextDay = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s2").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-06", "assertSecondGanttDatesAfterAddingNextDay, the second gantt schedule's start date should be 2017-02-06");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-09", "assertSecondGanttDatesAfterAddingNextDay, the second gantt schedule's end date should be 2017-02-10");
      resolve();
    }

    const assertThirdGanttDatesAfterAddingPrevDayAtLeftEdges = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s3").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-10", "assertThirdGanttDatesAfterAddingPrevDayAtLeftEdges, the third gantt schedule's start date should be 2017-02-10");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-21", "assertThirdGanttDatesAfterAddingPrevDayAtLeftEdges, the third gantt schedule's end date should be 2017-02-21");
      resolve();
    }
    const assertSecondGanttDatesAfterSubstractPrevDayAtRightEdges = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s2").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-06", "assertSecondGanttDatesAfterSubstractPrevDayAtRightEdges , the second gantt schedule's start date should be 2017-02-06");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-08", "assertSecondGanttDatesAfterSubstractPrevDayAtRightEdges, the second gantt schedule's end date should be 2017-02-08");
      resolve();
    }
    const assertSecondGanttDatesAfterSubstract3DaysAtRightEdges = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s2").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-06", "AfterSubstract3DaysAtRightEdges, the second schedule's start date should be 2017-02-06");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-06", "AfterSubstract3DaysAtRightEdges, the second schedule's end date should be 2017-02-06");
      resolve();
    }
    const assertThirdGanttDatesAfterInvalidSubstract = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s3").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-10", "After invalid Substract, the third gantt schedule's start date should be 2017-02-10");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-21", "After invalid Substract, the third gantt schedule's end date should be 2017-02-21");
      resolve();
    }
    const assertFirstGanttDatesAfterInvalidSubstract = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m1_1_s1").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-01", "After invalid Substract, the first gantt schedule's start date should be 2017-02-01");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-02-05", "After invalid Substract, the first gantt schedule's end date should be 2017-02-05");
      resolve();
    }
    const assertLastGanttDatesAfterAddingInvalid1DayAtRightEdges = (response, resolve, reject) => {
      const startEndDate = ganttView.getSchedule("m3_s1").getStartEndDate();
      assert.equal(startEndDate[0].format("YYYY-MM-DD"), "2017-02-06", "AfterAddingInvalid1DayAtRightEdges, the last gantt schedule's start date should be 2017-02-06");
      assert.equal(startEndDate[1].format("YYYY-MM-DD"), "2017-03-21", "AfterAddingInvalid1DayAtRightEdges, the last gantt schedule's end date should be 2017-03-21");
      resolve();
    }
    const resizeSecondGanttScheduleBySubstractPrevDayAtRightEdges = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule-resizer-r:eq(1)")[0], -24, 0, resolve);
    }
    const resizeSecondGanttScheduleBySubstract3DaysAtRightEdges = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule-resizer-r:eq(1)")[0], -24 * 3, 0, resolve);
    }
    const resizeThirdGanttScheduleByAddingPrevDayAtLeftEdges = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule-resizer-l:eq(2)")[0], -24, 0, resolve);
    }
    const resizeThirdGanttScheduleBySubstractInvalid3DaysAtLeftEdges = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule-resizer-l:eq(2)")[0], -24 * 3, 0, resolve);
    }
    const resizeLastGanttScheduleByAddingInvalid1DayAtRightEdges = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule-resizer-r:eq(2)")[0], 24, 0, resolve);
    }
    const resizeSecondGanttScheduleByAddingNextDayAtRightEdges = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule-resizer-r:eq(1)")[0], 20, 0, resolve);
    }
    const resizeFirstGanttScheduleBySubstractInvalid1DaysAtLeftEdges = (response, resolve, reject) => {
      Events.drag($(".gantt-item-schedule-resizer-l:eq(0)")[0], -24, 0, resolve);
    }
    const promisedTest = TestHelper.execFn(resizeThirdGanttScheduleByAddingPrevDayAtLeftEdges).delay(800).execFn(assertThirdGanttDatesAfterAddingPrevDayAtLeftEdges)
      .execFn(resizeThirdGanttScheduleBySubstractInvalid3DaysAtLeftEdges).delay(800).execFn(assertThirdGanttDatesAfterInvalidSubstract)
      .execFn(resizeSecondGanttScheduleBySubstractPrevDayAtRightEdges).delay(800).execFn(assertSecondGanttDatesAfterSubstractPrevDayAtRightEdges)
      .execFn(resizeSecondGanttScheduleByAddingNextDayAtRightEdges).delay(800).execFn(assertSecondGanttDatesAfterAddingNextDay)
      .execFn(resizeSecondGanttScheduleBySubstract3DaysAtRightEdges).delay(800).execFn(assertSecondGanttDatesAfterSubstract3DaysAtRightEdges)
      .execFn(resizeFirstGanttScheduleBySubstractInvalid1DaysAtLeftEdges).delay(800).execFn(assertFirstGanttDatesAfterInvalidSubstract)
      .execFn(resizeLastGanttScheduleByAddingInvalid1DayAtRightEdges).delay(800).execFn(assertLastGanttDatesAfterAddingInvalid1DayAtRightEdges)
    return promisedTest.should.be.fulfilled;
  })
  it('#init Gantt with id', () => {
    TestHelper.addDivToBody({
      id: "simple-gantt"
    });
    const gv = Gantt.init({
      el: "#simple-gantt"
    })
    assert.ok(gv);
  })
  it('#init Gantt with default settings', () => {
    let gv = Gantt.init()
    assert.ok(gv);

    gv = Gantt.init({
      el: TestHelper.addDivToBody(),
      data: [{
        name: "M1-1",
        schedules: [{
          name: "M1-1 Schedule 1",
          dates: ["2017-02-01"]
        }]
      }, {
        name: "M2-1",
        schedules: [{
          name: "M2-1 Schedule 1",
          dates: ["2017-02-01", "2017-05-01"]
        }]
      }]
    })
    assert.ok(gv.getData());
  })
})