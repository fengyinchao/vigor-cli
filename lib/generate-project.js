const Metalsmith = require("metalsmith");
const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const ora = require("ora");
const transformIntoAbsolutePath = require("./local-path")
  .transformIntoAbsolutePath;
const renderTemplateFiles = require("./render-template-files");

module.exports = tmpPath => {
  const metalsmith = Metalsmith(tmpPath);
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "请输入项目名称",
        default: "vigor-project"
      },
      {
        type: "input",
        name: "destination",
        message: "请输入项目存储位置",
        default: process.cwd()
      }
    ])
    .then(answer => {
      //项目生成路径
      const destination = path.join(
        transformIntoAbsolutePath(answer.destination),
        answer.name
      );
      const spinner = ora("正在生成项目,请稍后...").start();
      //加入新的全局变量
      Object.assign(metalsmith.metadata(), answer);
      spinner.start();
      metalsmith
        .source(".")
        .destination(destination)
        .clean(false)
        .build(function(err) {
          spinner.stop();
          if (err) throw err;
          console.log(
            chalk.green(`\n恭喜 🎉,项目生成成功!地址：${destination}\n`)
          );
        });
    });
};
