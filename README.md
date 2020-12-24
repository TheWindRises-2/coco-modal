# coco-modal
coco-modal是一个简单实用的javascript弹框插件

## Usage

Or, install via npm:

```
npm install coco-modal

import coco from 'coco-modal'

coco.init({
    buttonColor: '#2ea44f'
  });
```

base
  

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
      root.addEventListener("click", () => {
         coco("hello world");
      });
    </script>
```
use input
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
options

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
