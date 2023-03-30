require('babel-core/register');
const chromedriver = require('chromedriver');

module.exports = (settings => {
  settings.test_workers = false;
  settings.webdriver.server_path = chromedriver.path; // https://github.com/nightwatchjs/nightwatch/issues/1992
  return settings;
})(require('./nightwatch.json'));
