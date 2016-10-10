/**
 * 实现多个ajax同事请求。全部返回后，按顺序回调。
 */
define(['zepto'], function($) {
    function o() {
        this.num = 5; // 同时允许ajax数量
        this.successFnQueue = []; // 成功回调函数
        this.ajaxQueue = []; // 待运行的ajax
        this.ajaxRunPool = []; // 运行中的ajax
    }

    var Ajax1 = function(url, data, success, dataType) {
        this.url = url;
        this.data = data || undefined;
        this.success = success;
        this.dataType = dataType || undefined;

    }
    Ajax1.prototype.run = function(index) {
        this.index = index;
        $.ajax({
            url: this.url,
            data: this.data,
            success: this.success,
            dataType: this.dataType
        });
    }

    o.prototype = {
        startRender: function() {
            if (!this.isAllSuccess()) return;
            for (var i = 0; i < this.successFnQueue.length; i++) {
                this.successFnQueue[i]();
            }
            this.successFnQueue = [];
            this.start();
        },
        isAllSuccess: function() {
            var allSuccess = false;
            if (this.ajaxQueue.length === 0 && this.ajaxRunPool.length === 0) {
                allSuccess = true;
            }
            return allSuccess;
        },
        addAjax: function(array) {
            var that = this;
            if (array && array.length) {

                // 将success函数包装然后存到数组里面备用。
                for (var i = 0; i < array.length; i++) {
                    var ajaxFn = null;
                    (function(i) {
                        ajaxFn = function() {
                            array[i].success.call(null, ajaxFn.data);
                        }

                    })(i);

                    // 包装传入数组
                    this.ajaxQueue.push(new Ajax1(
                        array[i].url,
                        array[i].data,
                        function(data) {
                            // 判断是否全部结束，然后进行渲染html
                            ajaxFn.data = data;
                            that.ajaxRunPool.splice(this.index, 1);

                            that.startRender();
                        },
                        array[i].dataType
                    ));

                    this.successFnQueue.push(ajaxFn);
                }
            }
        },
        start: function(array) {
            this.addAjax(array);
            var nowNum = this.num - this.ajaxRunPool.length; // 得到当前可运行的数量

            for (var i = 0; i < nowNum; i++) {
                if (this.ajaxQueue.length <= 0) return;
                var first = this.ajaxQueue.shift();
                this.ajaxRunPool.push(first);
                var index = this.ajaxRunPool.length;
                console.log('开始第' + index + '个ajax请求');
                first.run(index);
            }
        },




    }
    var obj = null;


    if (!obj) obj = new o();

    return obj;


});
