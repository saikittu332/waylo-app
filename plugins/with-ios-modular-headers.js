const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const TARGETED_MODULAR_PODS = [
  "FirebaseAppCheckInterop",
  "FirebaseAuthInterop",
  "FirebaseCoreExtension",
  "FirebaseCoreInternal",
  "GoogleUtilities",
  "RecaptchaInterop",
];

function addModularHeaders(podfile) {
  const cleanedPodfile = podfile.replace(/^\s*use_modular_headers!\s*\n/gm, "");
  const alreadyConfigured = TARGETED_MODULAR_PODS.every((podName) =>
    cleanedPodfile.includes(`pod '${podName}', :modular_headers => true`)
  );

  if (alreadyConfigured) {
    return cleanedPodfile;
  }

  const modularPodLines = TARGETED_MODULAR_PODS.map(
    (podName) => `  pod '${podName}', :modular_headers => true`
  ).join("\n");
  const block = `\n  # Firebase Swift pods need modular headers for static library integration.\n${modularPodLines}\n`;
  const targetLine = /target ['"][^'"]+['"] do\n/;

  if (targetLine.test(cleanedPodfile)) {
    return cleanedPodfile.replace(targetLine, (match) => `${match}${block}`);
  }

  return cleanedPodfile;
}

function patchRNFBAppFirebaseImport(projectRoot) {
  const modulePath = path.join(
    projectRoot,
    "node_modules",
    "@react-native-firebase",
    "app",
    "ios",
    "RNFBApp",
    "RNFBAppModule.m"
  );

  if (!fs.existsSync(modulePath)) {
    return;
  }

  const source = fs.readFileSync(modulePath, "utf8");
  const broadFirebaseImport = "#import <Firebase/Firebase.h>";

  if (source.includes(broadFirebaseImport)) {
    fs.writeFileSync(
      modulePath,
      source.replace(broadFirebaseImport, "#import <FirebaseCore/FirebaseCore.h>")
    );
  }
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

      patchRNFBAppFirebaseImport(modConfig.modRequest.projectRoot);

      return modConfig;
    },
  ]);
};
