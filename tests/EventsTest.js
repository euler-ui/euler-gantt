import Events from './utility/Events';
import TestHelper from './utility/TestHelper';
describe('Events', () => {
  afterEach(function() {
    Event.prototype.initEvent.restore && Event.prototype.initEvent.restore();
    MouseEvent.prototype.initMouseEvent.restore && MouseEvent.prototype.initMouseEvent.restore();
  });
  it('#simulate', () => {
    const initEventSpy = sinon.spy(Event.prototype, "initEvent");
    const initMouseEventSpy = sinon.spy(MouseEvent.prototype, "initMouseEvent");
    Events.simulate(document.body, "click");
    assert.ok(initMouseEventSpy.calledOnce, "initMouseEvent has called once");

    Events.simulate(document.body, "scroll");
    assert.ok(initEventSpy.calledOnce, "initEventSpy has called once");
  });
  it("#simulate exception", () => {
    assert.throws(() => {
      Events.simulate(document.body, "wrong event");
    }, "Only HTMLEvents and MouseEvents interfaces are supported")
  })
})