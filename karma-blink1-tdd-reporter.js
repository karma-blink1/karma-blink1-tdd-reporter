const Blink1 = require('node-blink1');

const BlinkReporter = function(baseReporterDecorator, config, logger) {
  const log = logger.create('reporter.blink');
  const blinkConfig = config.blink || {};

  let blink1 = null;

  let initializingColor;
  let testFailesColor;
  let testPassedColor;
  let refactColor;

  let currentState = 'compile';

  baseReporterDecorator(this);

  this.adapters = [function(msg) {
    process.stdout.write.bind(process.stdout)(msg + 'rn');
  }];

  setResponseColor();

  try {
    initializeBlink1();
  } catch (e) {
    log.info('\n');
    log.warn('Unable to initialize Blink reporter:', e);
    return;
  }

  this.onRunComplete = function(browsersCollection, results) {
    if (results.failed === 0) {
      sendTestSucceededResponse();
      wait(10000);
      sendRefactorResponse();
    } else {
      sendTestFailedResponse();
    }
  };

  function initializeBlink1() {
    blink1 = new Blink1();
    setColor(initializingColor.r, initializingColor.g, initializingColor.b);
  }

  function setColor(r, b, g) {
    blink1.setRGB(r, b, g);
  }

  function setResponseColor() {
    setDefaultResponseColor();
    fetchColorFromConfig();
  }

  function setDefaultResponseColor() {
    initializingColor = { r: 255, b: 255, g: 255 };
    testFailesColor = { r: 255, b: 0, g: 0 };
    testPassedColor = { r: 0, b: 0, g: 255 };
    refactColor = { r: 0, b: 255, g: 0 };
  }

  function fetchColorFromConfig() {
    if (blinkConfig.initializingColor) {
      initializingColor = blinkConfig.initializingColor;
    }
    if (blinkConfig.testFailesColor) {
      testFailesColor = blinkConfig.testFailesColor;
    }
    if (blinkConfig.testPassedColor) {
      testPassedColor = blinkConfig.testPassedColor;
    }
    if (blinkConfig.refactColor) {
      refactColor = blinkConfig.refactColor;
    }
  }

  function sendTestSucceededResponse() {
    if (currentState !== 'refact') {
      setColor(testPassedColor.r, testPassedColor.g, testPassedColor.b);
      currentState = 'succeeded';
    }
  }

  function sendRefactorResponse() {
    setColor(refactColor.r, refactColor.g, refactColor.b);
    currentState = 'refact';
  }

  function sendTestFailedResponse() {
    setColor(testFailesColor.r, testFailesColor.g, testFailesColor.b);
    currentState = 'failed';
  }

  function wait(millis) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + millis) {
    }
  }
};

BlinkReporter.$inject = ['baseReporterDecorator', 'config', 'logger'];

module.exports = {
  'reporter:blink': ['type', BlinkReporter],
};
