const Promise = require('es6-promise').Promise;

class RotateFileImage {
  constructor() { }
  rotate(fileImage, compressRatio, cb) {
    this.getOrientation(fileImage)
      .then(() => {
        return this.compress(fileImage, compressRatio)
      })
      .then((compressImage) => {
        cb(this.rotateImage(compressImage, this.orientation))
      })
  }
  //  获取旋转角度
  getOrientation(image) {
    return new Promise((resolve) => {
      let _self = this;
      EXIF.getData(image, function () {
        let orientation = EXIF.getTag(this, 'Orientation');
        console.log('orientation:' + orientation);
        _self.orientation = orientation;
        resolve();
      })
    })
  }
  // 图片旋转
  rotateImage(image, orientation) {
    let width = image.width;
    let height = image.height;
    let canvas = document.createElement("canvas")
    let ctx = canvas.getContext('2d');
    let imageDate;
    switch (orientation) {
      //正常状态
      case 1:
        console.log('旋转0°');
        imageDate = image.src;
        break;
      //旋转90度
      case 6:
        console.log('旋转90°');
        canvas.height = width;
        canvas.width = height;
        ctx.rotate(Math.PI / 2);
        ctx.translate(0, -height);
        ctx.drawImage(image, 0, 0)
        imageDate = canvas.toDataURL('Image/jpeg', 1)
        break;
      //旋转180°
      case 3:
        console.log('旋转180°');
        canvas.height = height;
        canvas.width = width;
        ctx.rotate(Math.PI);
        ctx.translate(-width, -height);
        ctx.drawImage(image, 0, 0)
        imageDate = canvas.toDataURL('Image/jpeg', 1)
        break;
      //旋转270°
      case 8:
        console.log('旋转270°');
        canvas.height = width;
        canvas.width = height;
        ctx.rotate(-Math.PI / 2);
        ctx.translate(-height, 0);
        ctx.drawImage(image, 0, 0)
        imageDate = canvas.toDataURL('Image/jpeg', 1)
        break;
      //undefined时不旋转
      case undefined:
        console.log('undefined  不旋转');
        imageDate = image.src;
        break;
    }
    return imageDate;
  }
  compress(fileImage, compressRatio) {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.readAsDataURL(fileImage);
      reader.onload = (e) => {
        let img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let initSize = img.src.length;
          let width = img.width;
          let height = img.height;
          // 用于压缩图片的canvas
          let canvas = document.createElement("canvas");
          let ctx = canvas.getContext('2d')
          // 瓦片canvas
          let tCanvas = document.createElement("canvas");
          let tctx = tCanvas.getContext("2d");
          // 如果图片大于四百万像素，计算压缩比并将大小压至400万以下
          let ratio;
          if ((ratio = width * height / 4000000) > 1) {
            ratio = Math.sqrt(ratio);
            width /= ratio;
            height /= ratio;
          } else {
            ratio = 1;
          }
          canvas.width = width;
          canvas.height = height;
          // 铺底色
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // 如果图片像素大于100万则使用瓦片绘制
          let count;
          if ((count = width * height / 1000000) > 1) {
            count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
            // 计算每块瓦片的宽和高
            let nw = ~~(width / count);
            let nh = ~~(height / count);
            tCanvas.width = nw;
            tCanvas.height = nh;
            for (let i = 0; i < count; i++) {
              for (let j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
              }
            }
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }
          // 进行最小压缩
          let ndata = canvas.toDataURL("image/jpeg", compressRatio);
          console.log("压缩前：" + initSize);
          console.log("压缩后：" + ndata.length);
          console.log("压缩率：" + ~~(100 * (initSize - ndata.length) / initSize) + "%");
          tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
          let image = new Image();
          image.src = ndata;
          image.onload = () => {
            resolve(image);
          }
        }
      }
    })
  }
}

window['rotateFileImage'] = new RotateFileImage();
