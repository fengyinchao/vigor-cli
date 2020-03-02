#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const exists = require("fs").existsSync;
const chalk = require("chalk");
const inquirer = require("inquirer");
const Metalsmith = require("metalsmith");
const ora = require("ora");
const Handlebars = require("handlebars");
const rm = require("rimraf").sync;
const checkVersion = require("../lib/check-version.js");
const renderTemplateFiles = require("../lib/render-template-files");
const transformIntoAbsolutePath = require("../lib/local-path")
  .transformIntoAbsolutePath;

program
  .usage("<component|page>")
  .option("-c, --config [config]", "指定配置文件")
  .option("-d, --dest [dest]", "指定生成页面或组件的目的地址");

//保证输入new的类型
program.parse(process.argv);
if (program.args.length < 1) return program.help();

//检验new的类型是否合法
const newType = program.args[0];

if (newType !== "component" && newType !== "page") {
  console.log(chalk.red(`不支持类型 ${newType},请输入 component 或者 page`));
  process.exit();
}

//检测版本，并执行主函数
checkVersion(Main);

function Main() {
  //获取 vigor.config.js的位置
  let configPath = path.join(process.cwd(), "vigor.config.js");
  if (program.config) {
    configPath = path.isAbsolute(program.config)
      ? program.config
      : path.join(process.cwd(), program.config);
  }
  if (!exists(configPath)) {
    console.log(chalk.red("请确保 vigor.config.js 文件存在"));
    process.exit();
  }
  const vigorConfig = require(configPath);
  const templates = vigorConfig[`${newType}`].templates;
  const defaultDest = vigorConfig[`${newType}`].output;
  const helpers = vigorConfig.helpers;
  //注册helpers
  helpers &&
    Object.keys(helpers).map(key => {
      Handlebars.registerHelper(key, helpers[key]);
    });
  //选择模板文件
  chooseedTemplate(templates, function(choosedTemplate) {
    inquirer
      .prompt(
        [
          {
            type: "input",
            name: "name",
            message: `输入新 ${newType} 的名称`,
            default: choosedTemplate.name
          }
        ].concat(choosedTemplate.prompts)
      )
      .then(answers => {
        //最终构建路径
        const finalDestination = path.join(
          program.dest ? transformIntoAbsolutePath(program.dest) : defaultDest,
          answers.name
        );
        //判断生成目录下是否存在同名
        if (exists(finalDestination)) {
          confirmOverride(newType, answers.name, function(override) {
            if (override) {
              rm(finalDestination);
              newPageOrComponent(
                choosedTemplate.src,
                finalDestination,
                answers
              );
            } else {
              process.exit();
            }
          });
        } else {
          newPageOrComponent(choosedTemplate.src, finalDestination, answers);
        }
      });
  });
}

/**
 *
 * @param templates
 * @param callback
 */
function chooseedTemplate(templates, callback) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "name",
        choices: templates.map(template => template.name),
        message: `选择你需要的模版`
      }
    ])
    .then(answers => {
      const { name } = answers;
      const choosedTemplate = templates.find(
        template => template.name === name
      );
      if (typeof callback === "function") {
        callback(choosedTemplate);
      }
    });
}
/**
 *
 * @param newType
 * @param name
 * @param callback
 */
function confirmOverride(newType, name, callback) {
  inquirer
    .prompt([
      {
        type: "confirm",
        name: "override",
        message: `已存在名为${name}的${newType},是否覆盖?`
      }
    ])
    .then(answers => {
      const { override } = answers;
      if (typeof callback === "function") {
        callback(override);
      }
    });
}

/**
 *
 * @param {String}source
 * @param {String}destination
 */
function newPageOrComponent(source, destination, otherMetadata) {
  const spinner = ora(`正在创建 ${newType}...`).start();
  try {
    const metalsmith = Metalsmith(source);
    //加入新的全局变量
    Object.assign(metalsmith.metadata(), otherMetadata);
    //使用中间件
    metalsmith.use(renderTemplateFiles());
    //最后生成
    metalsmith
      .source(".")
      .destination(destination)
      .clean(false)
      .build(function(err) {
        spinner.stop();
        if (err) throw err;
        console.log(chalk.green(`\n${newType}创建成功!\n`));
      });
  } catch (err) {
    spinner.stop();
    console.log(err);
  }
}
