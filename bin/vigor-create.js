#!/usr/bin/env node

const path = require("path");
const userHome = require("user-home");
const exists = require("fs").existsSync;
const inquirer = require("inquirer");
const download = require("download-git-repo");
const chalk = require("chalk");
const ora = require("ora");
const rm = require("rimraf").sync;
const checkVersion = require("../lib/check-version.js");
const generate = require("../lib/generate-project");
const templateRepoConfig = require("../template-repo.json");

//检测版本并执行Main函数
checkVersion(Main);

/**
 * Main
 */
function Main() {
  //模板仓库存放在本地的地址
  const localRepoPath = path.resolve(userHome, ".vigor-templates");
  const choices = templateRepoConfig.map(template => {
    return {
      name: `${template.name} - ${template.description}`,
      value: template.name
    };
  });
  inquirer
    .prompt([
      {
        type: "list",
        name: "template",
        choices,
        message: "请选择项目模版"
      }
    ])
    .then(answer => {
      //模板名称
      const tmpName = answer.template;
      //远程模板地址
      const tmpUrl = templateRepoConfig.find(
        template => template.name === tmpName
      ).url;
      const tmpDest = path.join(localRepoPath, tmpName);
      if (exists(tmpDest)) {
        inquirer
          .prompt([
            {
              type: "confirm",
              name: "override",
              message: "当前项目模版已存在，是否覆盖?"
            }
          ])
          .then(answer => {
            if (answer.override) {
              rm(tmpDest);
              downloadAndGenerate(localRepoPath, tmpName, tmpUrl);
            } else {
              generate(tmpDest);
            }
          });
      } else {
        downloadAndGenerate(localRepoPath, tmpName, tmpUrl);
      }
    });
}
/**
 *
 * @param {String} localRepoPath
 * @param {String} tmpName
 * @param {String} tmpUrl
 */
function downloadAndGenerate(localRepoPath, tmpName, tmpUrl) {
  const spinner = ora("正在下载项目模版,请稍后...");
  const tmpDest = path.join(localRepoPath, tmpName);
  inquirer
    .prompt([
      {
        type: "input",
        name: "branch",
        message: "请输入分支名称",
        default: "master"
      }
    ])
    .then(answer => {
      spinner.start();
      download(
        `${tmpUrl}#${answer.branch}`,
        tmpDest,
        {
          clone: false
        },
        err => {
          if (err) {
            spinner.fail(chalk.red("模版下载失败,请重试"));
            console.log(err);
          } else {
            spinner.succeed(chalk.green(`模版下载成功,已缓存至${tmpDest}`));
            generate(tmpDest);
          }
        }
      );
    });
}
