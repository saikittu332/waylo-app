const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function addModularHeaders(podfile) {
  if (podfile.includes("use_modular_headers!")) {
    return podfile;
  }

  const platformLine = /platform :ios, ['"][^'"]+['"]\n/;

  if (platformLine.test(podfile)) {
    return podfile.replace(platformLine, (match) => `${match}use_modular_headers!\n`);
  }

  return `use_modular_headers!\n${podfile}`;
}

module.exports = function withIosModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, "Podfile");

      if (fs.existsSync(podfilePath)) {
        const podfile = fs.readFileSync(podfilePath, "utf8");
        fs.writeFileSync(podfilePath, addModularHeaders(podfile));
      }

      return modConfig;
    },
  ]);
};
