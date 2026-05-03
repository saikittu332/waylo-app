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

function addFirebasePodConfig(podfile) {
  let patchedPodfile = podfile.replace(/^\s*use_modular_headers!\s*\n/gm, "");
  const targetLine = /target ['"][^'"]+['"] do\n/;

  if (!patchedPodfile.includes("$RNFirebaseAsStaticFramework = true")) {
    patchedPodfile = patchedPodfile.replace(
      targetLine,
      (match) => `${match}\n  $RNFirebaseAsStaticFramework = true\n`
    );
  }

  const alreadyConfigured = TARGETED_MODULAR_PODS.every((podName) =>
    patchedPodfile.includes(`pod '${podName}', :modular_headers => true`)
  );

  if (!alreadyConfigured) {
    const modularPodLines = TARGETED_MODULAR_PODS.map(
      (podName) => `  pod '${podName}', :modular_headers => true`
    ).join("\n");
    const block = `\n  # Firebase Swift pods need modular headers for static framework integration.\n${modularPodLines}\n`;

    patchedPodfile = patchedPodfile.replace(targetLine, (match) => `${match}${block}`);
  }

  return patchedPodfile;
}

function addNonModularHeaderBuildSetting(podfile) {
  const settingName = "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES";

  if (podfile.includes(settingName)) {
    return podfile;
  }

  const postInstallLine = /post_install do \|installer\|\n/;
  const block = `    installer.pods_project.targets.each do |target|\n      if ['RNFBApp', 'RNFBAuth'].include?(target.name)\n        target.build_configurations.each do |config|\n          config.build_settings['${settingName}'] = 'YES'\n        end\n      end\n    end\n\n`;

  if (postInstallLine.test(podfile)) {
    return podfile.replace(postInstallLine, (match) => `${match}${block}`);
  }

  return `${podfile}\n\npost_install do |installer|\n${block}end\n`;
}

function patchPodfile(podfile) {
  return addNonModularHeaderBuildSetting(addFirebasePodConfig(podfile));
}

module.exports = function withIosModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, "Podfile");

      if (fs.existsSync(podfilePath)) {
        const podfile = fs.readFileSync(podfilePath, "utf8");
        fs.writeFileSync(podfilePath, patchPodfile(podfile));
      }

      return modConfig;
    },
  ]);
};
