const {logger} = require("firebase-functions");
const test = require("firebase-functions-test");
const {assert} = require("chai");
const {spy} = require("sinon");
const {receiveRaceActivities} = require("../index");

const {wrap} = test();

describe("firebase-functions-test", () => {
  describe("#logstore", () => {
    it("will log when the v2 cloud function is invoked", () => {
      const logSpy = spy(logger, "log");

      const wrappedFunction = wrap(receiveRaceActivities);
      wrappedFunction();
      assert.isTrue(logSpy.calledOnce);
    });
  });
});