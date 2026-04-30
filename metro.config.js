const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.blockList =
  /.*(?:backend[\\\/](?:\.deps|\.pytest_cache|\.venv|deps)|dist-test|dist-web-test|dist-ios-test|dist-android-test)[\\\/].*/;

module.exports = config;
