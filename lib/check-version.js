const axios = require("axios");
const semver = require("semver");
const chalk = require("chalk");
const exec = require("child_process").execSync;
const packageConfig = require("../package.json");

module.exports = callback => {
  const isNodeVersionValid = checkNodeVersion();
  if (!isNodeVersionValid) return;
  checkCliVersion(callback);
};

// 检测 node 版本
function checkNodeVersion() {
  const neededVersion = "v8.0.0";
  const currentVersion = exec("node -v");
  if (semver.gt(neededVersion, currentVersion.toString())) {
    console.log(chalk.yellow("请更新 node 版本 >= v8.0.0"));
    return false;
  }
  return true;
}

// 检测 cli 版本
async function checkCliVersion(cb) {
  try {
    const result = await axios.get("https://registry.npmjs.org/vigor-cli");
    const { status, data } = result;
    if (status === 200) {
      const latestVersion = data["dist-tags"].latest;
      const localVersion = packageConfig.version;
      if (semver.lt(localVersion, latestVersion)) {
        console.log(
          chalk.yellow(
            "vigor-cli 发布新版啦，运行 npm i -g vigor-cli@latest 来更新"
          )
        );
      }
    }
    cb();
  } catch (error) {
    console.log("vigor-Cli 更新检查失败！\r\n", error);
  }
}
