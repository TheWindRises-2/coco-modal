# coco-modal
coco-modal是一个简单实用的javascript弹框插件 兼容主流浏览器 ie兼容到ie9 (ie9没有动画效果)

## Usage

install via npm:

```
npm install coco-modal

import coco from 'coco-modal'

coco.init({
    buttonColor: '#2ea44f'
  });
```

基本用法 （必须先运行 coco.init 方法, 再使用弹框方法）
  

```html
    <style>
        body{
            margin:0
        }
        .root {
          width: 1000px;
          height: 2000px;
          background-color: #f1f1f2;
          margin: 0 auto;
        }
      </style>
    <div class="root"></div>
    <script src="https://unpkg.com/coco-modal/coco-modal.min.js"></script>
    <script>
      // init coco modal
      coco.init({
          buttonColor:'#e71e63'
      });
      let root = document.body.querySelector(".root");
      let count = 0;
      root.addEventListener("click", () => {
         let n = count++ % 3;
         n === 0 && coco("hello world");
         n === 1 && coco.alert("alert");
         n === 2 && coco.confirm("confirm");
      });
    </script>
```

显示一个输入框

```html
    <style>
        body{
            margin:0
        }
        .root {
          width: 1000px;
          height: 2000px;
          background-color: #f1f1f2;
          margin: 0 auto;
        }
      </style>
    <div class="root"></div>
    <script src="https://unpkg.com/coco-modal/coco-modal.min.js"></script>
    <script>
      // init coco modal
      coco.init();
      let root = document.body.querySelector(".root");
      root.addEventListener("click", () => {
        coco({
          title: "验证输入",
          inputAttrs: {
            placeholder: "your name",
          },
        }).onClose((cc, isOk, done) => {
          console.log(cc.closeType);
          if (isOk) {
            if (cc.inputValue.trim() === "") {
              cc.setErrorText("输入不能为空！");
            } else {
              cc.setErrorText("");
              cc.inputEl.value = "";
              done();
            }
          } else {
            done();
          }
        });
      });
    </script>
```
coco.init 方法接收的参数作用所有的modal，单个modal的参数会覆盖全局参数

```
  let initOptions = {
        el: null, // 一个dom节点或者选择器  el: '#login'
        maskClose: true,
        header: true,
        footer: true,
        title: '提示',
        text: '',
        width: '500px',
        top: '15vh',
        inputAttrs: false,
        escClose: true,
        okButton: true,
        cancelButton: true,
        okText: '确定',
        cancelText: '取消',
        closeButton: true,
        html: '',
        zIndexOfModal: 1995,
        zIndexOfMask: 2008,
        zIndexOfActiveModal: 2020,
        autoFocusOkButton: true,
        autoFocusInput: true,
        fullScreen: false,
        borderRadius: '6px',
        blur: false,
        buttonColor: '#4285ff',
        onMount(){},
        hooks: {
          open(){},
          opened(){},
          close(){},
          closed(){}
        },
        destroy: false,
        animation: true
    }

```
