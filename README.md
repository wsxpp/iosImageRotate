# iosImageRotate
处理移动端ios图片旋转的js

使用方法 

1.引入exif.js

2.代码

param1:input file上传选择的图片文件

param2:图片压缩比例0~1

param3:图片处理完成的回调，返回一个base64的图片url

rotateFileImage.rotate(this.files[0], 0.5, function (baseUrl) {

  console.log(baseUrl)
  
})









