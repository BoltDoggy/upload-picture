    /**
     * 获得base64
     * @param {Object} obj
     * @param {Number} [obj.width] 图片需要压缩的宽度，高度会跟随调整
     * @param {Number} [obj.quality=0.8] 压缩质量，不压缩为1
     * @param {Function} [obj.before(this, blob, file)] 处理前函数,this指向的是input:file
     * @param {Function} obj.success(obj) 处理后函数
     * @example
     *
     */
    $.fn.localResizeIMG = function(obj) {
        this.on('change', function() {
            var file = this.files[0];
            console.log(file)
            var URL = window.URL || window.webkitURL;
            var blob = URL.createObjectURL(file);
			var Orientation = null; 
            if(file){
                // var URL = URL || webkitURL; 
                //获取照片方向角属性，用户旋转控制 
                EXIF.getData(file, function() { 
                    EXIF.getAllTags(this);  
                    Orientation = EXIF.getTag(this, 'Orientation'); 
                    //return; 
                }); 
                // 执行前函数
                if ($.isFunction(obj.before)) {
                    obj.before(this, blob, file)
                };
               
                setTimeout(function(){  
                    _create(blob,Orientation);
                },100)
              
                    
                this.value = ''; // 清空临时数据
            }
            
        });
		
	
        /**
         * 生成base64
         * @param blob 通过file获得的二进制
         */
        function _create(blob,Orientation) {
            var img = new Image();
            img.src = blob;
            img.onload = function() {
                var that = this;

                //生成比例
                var w = that.width,
                    h = that.height,
                    scale = w / h;
                w = obj.width || w;
                h = w / scale;

                //生成canvas
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                $(canvas).attr({
                    width: w,
                    height: h
                });
                ctx.drawImage(that, 0, 0, w, h);

                /**
                 * 生成base64
                 * 兼容修复移动设备需要引入mobileBUGFix.js
                 */
                var base64 = canvas.toDataURL('image/jpeg', obj.quality || 0.8);



                // 修复IOS
                if (navigator.userAgent.match(/iphone/i)) {
                    var mpImg = new MegaPixImage(img);
                    mpImg.render(canvas, {
                        maxWidth: w,
                        maxHeight: h,
                        quality: obj.quality || 0.8
                    });
                    if(Orientation==6){
                        rotateImg(that,'left',canvas); 
                    }
                    base64 = canvas.toDataURL('image/jpeg', obj.quality || 0.8);
                }

                // 修复android
                if (navigator.userAgent.match(/Android/i)) {
                    var encoder = new JPEGEncoder();
                    base64 = encoder.encode(ctx.getImageData(0, 0, w, h), obj.quality * 100 || 80);
                }

                // 生成结果
                var result = {
                    base64: base64,
                    clearBase64: base64.substr(base64.indexOf(',') + 1)
                };

                // 执行后函数
                obj.success(result);
            };
        }


        //对图片旋转处理 added by lzk www.bcty365.com 
        function rotateImg(img, direction,canvas) {   
            //alert(img); 
            //最小与最大旋转方向，图片旋转4次后回到原方向   
            var min_step = 0;   
            var max_step = 3;   
            //var img = document.getElementById(pid);   
            if (img == null)return;   
            //img的高度和宽度不能在img元素隐藏后获取，否则会出错   
            var height = img.height;   
            var width = img.width;   
            //var step = img.getAttribute('step');   
            var step = 2;   
            if (step == null) {   
                step = min_step;   
            }   
            if (direction == 'right') {   
                step++;   
                //旋转到原位置，即超过最大值   
                step > max_step && (step = min_step);   
            } else {   
                step--;   
                step < min_step && (step = max_step);   
            }   
            //img.setAttribute('step', step);   
            /*var canvas = document.getElementById('pic_' + pid);   
            if (canvas == null) {   
                img.style.display = 'none';   
                canvas = document.createElement('canvas');   
                canvas.setAttribute('id', 'pic_' + pid);   
                img.parentNode.appendChild(canvas);   
            }  */ 
            //旋转角度以弧度值为参数   
            var degree = step * 90 * Math.PI / 180;   
            var ctx = canvas.getContext('2d');   
            switch (step) {   
                case 0:   
                    canvas.width = width;   
                    canvas.height = height;   
                    ctx.drawImage(img, 0, 0);   
                    break;   
                case 1:   
                    canvas.width = height;   
                    canvas.height = width;   
                    ctx.rotate(degree);   
                    ctx.drawImage(img, 0, -height);   
                    break;   
                case 2:   
                    canvas.width = width;   
                    canvas.height = height;   
                    ctx.rotate(degree);   
                    ctx.drawImage(img, -width, -height);   
                    break;   
                case 3:   
                    canvas.width = height;   
                    canvas.height = width;   
                    ctx.rotate(degree);   
                    ctx.drawImage(img, -width, 0);   
                    break;   
            }   
        }   
    };


    // 例子
    /*
    $('input:file').localResizeIMG({
        width: 100,
        quality: 0.1,
        //before: function (that, blob) {},
        success: function (result) {
            var img = new Image();
            img.src = result.base64;

            $('body').append(img);
            console.log(result);
        }
    });
*/