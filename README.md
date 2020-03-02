# power-cli
一款通用脚手架，能基于模版仓库快速创建应用，且能基于模版快速创建页面级或组件级的代码！从此告别 ctrl+c,ctrl+v 后手动改名字的烦恼。
不限于前端，任意端都可以使用

## 使用流程
```
npm i power-cli -g

// 创建项目
power create
// 给项目中新增页面或组件
power new page|component
```

## 使用须知
- 创建项目时，模版仓库配置文件位于 ./template-repo.json，可以提 PR 来加入更多模版
- 创建页面或组件时，为确保灵活性，需自行修改项目中 power-cli.json 与模版文件对应关系
