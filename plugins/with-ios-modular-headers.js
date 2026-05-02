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

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const patchedSource = replacements.reduce(
    (contents, [from, to]) => contents.split(from).join(to),
    source
  );

  if (patchedSource !== source) {
    fs.writeFileSync(filePath, patchedSource);
  }
}

function patchReactNativeFirebaseImports(projectRoot) {
  const rnfbRoot = path.join(projectRoot, "node_modules", "@react-native-firebase");
  const broadFirebaseImport = "#import <Firebase/Firebase.h>";

  patchFile(path.join(rnfbRoot, "app", "ios", "RNFBApp", "RNFBAppModule.m"), [
    [broadFirebaseImport, "#import <FirebaseCore/FirebaseCore.h>"],
  ]);
  patchFile(path.join(rnfbRoot, "auth", "ios", "RNFBAuth", "RNFBAuthModule.h"), [
    [
      broadFirebaseImport,
      "#import <FirebaseCore/FirebaseCore.h>\n#import <FirebaseAuth/FirebaseAuth.h>",
    ],
  ]);
  patchFile(path.join(rnfbRoot, "auth", "ios", "RNFBAuth", "RNFBAuthModule.m"), [
    [
      broadFirebaseImport,
      "#import <FirebaseCore/FirebaseCore.h>\n#import <FirebaseAuth/FirebaseAuth.h>",
    ],
  ]);
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

      patchReactNativeFirebaseImports(modConfig.modRequest.projectRoot);

      return modConfig;
    },
  ]);
};
