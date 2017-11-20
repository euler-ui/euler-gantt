import TestHelper from './utility/TestHelper'
import Promise from 'bluebird'

describe('TestHelper', () => {
  // var Spinner;
  afterEach(function() {
    $.fn.html.restore && $.fn.html.restore();
    Promise.prototype.catch.restore && Promise.prototype.catch.restore();
  });
  it("#addDivToBody", () => {
    assert.ok(TestHelper.addDivToBody());
  })
  it('#create Element success', () => {
    TestHelper.createElement({
      "tag": "div",
      "attrs": {
        "id": "test-div",
        "classNames": ["clazzA", "clazzB"],
        "attr1": "val1",
        "attr2": "val2"
      },
      "children": [
        {
          "tag": "span",
          "attrs": {
            "id": "test-span-1",
            "classNames": "clazzA",
            "attr1": "val1",
            "attr2": "val2"
          }
        },
        {
          "tag": "span",
          "attrs": {
            "id": "test-span-2",
            "classNames": ["clazzA", "clazzB"],
            "attr1": "val1",
            "attr2": "val2"
          }
        }]
    }, TestHelper.addDivToBody());
    const testDiv = $("div#test-div");
    assert.ok(testDiv[0], "should find test-div");
    assert.ok(testDiv.select("> [attr1=val1][attr2=val2]")[0], "test-div attrs should be set correctly");

    const testSpan1 = $("span#test-span-1");
    assert.ok(testSpan1[0], "should find test-span-1");
    assert.ok(testSpan1.select("> [attr1=val1][attr2=val2]")[0], "test-span-1 attrs should be set correctly");

    const testSpan2 = $("span#test-span-2");
    assert.ok(testSpan2[0], "should find test-span-2");
    assert.ok(testSpan2.select("> [attr1=val1][attr2=val2]")[0], "test-span-2 attrs should be set correctly");
  })
  it('#create Element with wrong arguments', () => {
    const jqueryHTMLMethod = sinon.spy($.fn, "html");
    TestHelper.createElement({});
    assert.ok(jqueryHTMLMethod.notCalled, "target should be defined");
    TestHelper.createElement("2", "wrongTarget");
    assert.ok(jqueryHTMLMethod.notCalled, "target should be defined correctly");
    TestHelper.createElement("", TestHelper.addDivToBody());
    assert.ok(jqueryHTMLMethod.notCalled, "html tag should be defined");
    TestHelper.createElement(undefined, TestHelper.addDivToBody());
  });

  it('#delay', () => {
    assert.ok(TestHelper.delay(1000) instanceof Promise, "The return of TestHelper.delay(1000) should be a Promise");
  });
  it('#execFn', function(done) {
    this.timeout(2000);
    TestHelper.execFn((response, resolve, reject) => {
      setTimeout(() => {
        resolve("First Result");
      }, 500)
    }).execFn((response, resolve, reject) => {
      assert.equal(response, "First Result", "response should be First Result");
      resolve("Second Result");
    }).execFn((response, resolve, reject) => {
      assert.equal(response, "Second Result", "response should be Second Result");
      resolve();
    }).done(done);
  });
  it("#execFn sync", function(done) {
    let result = "";
    // all syncs.
    TestHelper.execFn((response, resolve, reject) => {
      setTimeout(() => {
        result = "First Result";
      }, 500)
    }, true).execFn((response, resolve, reject) => {
      assert.equal(response, null, "response should be empty string");
      assert.equal(result, "", "result should be empty string");
    }, true);

    let firstAsyncSecondSyncResponse = "";
    // first async, second, sync
    TestHelper.execFn((response, resolve, reject) => {
      resolve(1);
    }).execFn((response, resolve, reject) => {
      firstAsyncSecondSyncResponse = response;
    }, true);

    setTimeout(() => {
      assert.equal(firstAsyncSecondSyncResponse, 1, "firstAsyncSecondSyncResponse should be 1");
      assert.equal(result, "First Result", "Result should be First Result ");
      done();
    }, 600)
  })
  it("#execFn timeout Catch", function(done) {
    this.timeout(11000);
    const promiseWillRejectedWithError = TestHelper.execFn((response, resolve, reject) => {
    }).execFn(() => {
      done();
    });
  })
  it("#execFn OtherErrors Catch", function() {
    const promiseWillRejectedWithError = TestHelper.execFn((response, resolve, reject) => {
      throw "error"
    });
    return promiseWillRejectedWithError.should.be.rejectedWith("error");
  })
})