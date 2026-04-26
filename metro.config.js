const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /backend[\\\/]\.deps[\\\/].*/,
  /backend[\\\/]\.pytest_cache[\\\/].*/,
  /backend[\\\/]\.venv[\\\/].*/,
  /backend[\\\/]deps[\\\/].*/
];

module.exports = config;
