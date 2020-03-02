# vigor-cli

一款通用脚手架，能基于模版仓库快速创建应用，且能基于模版快速创建页面级或组件级的代码！从此告别 ctrl+c,ctrl+v 后手动改名字的烦恼。
不限于前端，任意端都可以使用

## 使用流程

```
npm i vigor-cli -g

// 创建项目
vigor create
// 给项目中新增页面或组件
vigor new page|component
```

## 使用须知

- 创建项目时，模版仓库配置文件位于 ./template-repo.json，可以提 PR 来加入更多模版
- 创建页面或组件时，为确保灵活性，需自行修改项目中 vigor.config.js 与模版文件对应关系

```
// vigor.config.js example
const path=require('path')

module.exports={
  helpers:{
    toLowercase:function(name) {
      return name.toLocaleLowerCase();
    }
  },
  page: {
    output: path.join(__dirname,'./src/app/routes'),
    templates: [
      {
        name:'Page-List',
        src:path.join(__dirname,'./src/app/common/templates/pages/list'),
        prompts:[]
      },
      {
        name:'Page-List-Batch-Delete',
        src:path.join(__dirname,'./src/app/common/templates/pages/list-batch'),
        prompts:[]
      },
      {
        name:'Page-List-New',
        src:path.join(__dirname,'./src/app/common/templates/pages/list-new'),
        prompts:[]
      }
    ]
  },
  component: {
    output: path.join(__dirname,'components'),
    templates: [
      {
        name:'ComSample',
        src:path.join(__dirname,'./src/app/common/templates/components/test'),
        prompts:[]
      }
    ]
  }
}
```

该配置则需要确保 src/app/common/templates/pages 下有文件，会以此文件创建新文件
