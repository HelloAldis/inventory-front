/**
 * @author Aldis
 */
(function () {
  'use strict';

  function UploadImageClient(obj) {
    this.container = $('#' + obj.id);
    this.queueList = this.container.find('div.queueList');
    this.statusBar = this.container.find('div.statusBar');
    this.placeholder = this.container.find('div.placeholder');
    this.filePicker = this.container.find('div.filePicker');
    // 图片容器
    this.filelist = $('<ul class="filelist"></ul>').appendTo(this.queueList);
    this.filelist.sortable();

    this.uploadedCount = 0;
    this.addedCount = 0;
    this.maxImageCount = obj.maxImageCount;

    // 优化retina, 在retina下这个值是2
    this.ratio = window.devicePixelRatio || 1;
    // 缩略图大小
    this.thumbnailWidth = 110 * this.ratio;
    this.thumbnailHeight = 110 * this.ratio;
    // 所有文件的进度信息，key为file id
    this.percentages = {};
    // 可能有 empty, notEmpty
    this.state = 'empty';
    // 文件总体选择信息。
    this.info = this.statusBar.find('.info');

    var self = this;

    this.webUploader = WebUploader.create({
      pick: {
        id: this.filePicker,
        label: '点击选择图片'
      },
      fileVal: 'Filedata',
      dnd: this.queueList,
      paste: this.queueList,
      chunked: false,
      chunkSize: 512 * 1024,
      server: '/api/v2/web/image/upload',
      auto: true,

      accept: {
        title: 'Images',
        extensions: 'jpg,jpeg,png',
        mimeTypes: 'image/*'
      },

      // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
      disableGlobalDnd: true,
      fileNumLimit: this.maxImageCount,
      fileSizeLimit: 20 * 1024 * 1024, // 30 M
      fileSingleSizeLimit: 3 * 1024 * 1024 // 3 M
    });


    this.webUploader.onFileQueued = function (file) {
      self.addFile(file);
    };

    this.webUploader.onDndAccept = function (items) {
      if (self.maxImageCount === self.getTotalFileCount()) {
        return false;
      } else {
        return true;
      }
    }

    this.webUploader.onBeforeFileQueued = function (file) {
      if (self.maxImageCount === self.getTotalFileCount()) {
        return false;
      } else {
        return true;
      }
    }

    this.webUploader.onFileDequeued = function (file) {
      self.removeFile(file.id);
    };

    this.webUploader.onUploadProgress = function (file, percentage) {
      let $li = $('#' + file.id);
      let $percent = $li.find('.progress span');

      $percent.css('width', percentage * 100 + '%');
      self.percentages[file.id][1] = percentage;
    };

    this.webUploader.on('all', function (type) {
      switch (type) {
        case 'uploadFinished':
          break;

        case 'startUpload':
          break;
      }
    });

    this.webUploader.onError = function (code) {
      console.log('Eroor: ' + code);
    };

    this.webUploader.onUploadAccept = function (obj, res) {
      if (obj.file && res.data) {
        obj.file._id = res.data;
      }
    }

    this.updateState();
    this.updateInfo();
  }

  UploadImageClient.prototype.getTotalFileCount = function () {
    return this.addedCount + this.uploadedCount;
  }

  // 当有文件添加进来时执行，负责view的创建
  UploadImageClient.prototype.addFile = function (file) {
    let $li = $('<li id="' + file.id + '">' +
      '<p class="imgWrap"></p>' +
      '<p class="progress"><span></span></p>' +
      '</li>');
    let $btns = $('<div class="file-panel"><i class="ion-close-circled"></i></div>').appendTo($li);
    let $prgress = $li.find('p.progress span');
    let $wrap = $li.find('p.imgWrap');
    let $info = $('<p class="error"></p>');

    let text = '';
    let showError = function (code) {
      switch (code) {
        case 'exceed_size':
          text = '文件大小超出';
          break;

        case 'interrupt':
          text = '上传暂停';
          break;

        default:
          text = '上传失败，请重试';
          break;
      }

      $info.text(text).appendTo($li);
    };

    if (file.getStatus() === 'invalid') {
      showError(file.statusText);
    } else {
      // @todo lazyload
      $wrap.text('预览中');
      this.webUploader.makeThumb(file, function (error, src) {
        var img;

        if (error) {
          $wrap.text('不能预览');
          return;
        }

        img = $('<img src="' + src + '">');
        $wrap.empty().append(img);
      }, this.thumbnailWidth, this.thumbnailHeight);

      this.percentages[file.id] = [file.size, 0];
    }

    let self = this;
    file.on('statuschange', function (cur, prev) {
      // inited -> queued -> progress -> complete

      // 成功
      if (cur === 'error' || cur === 'invalid') {
        showError(file.statusText);
        self.percentages[file.id][1] = 1;
      } else if (cur === 'interrupt') {
        showError('interrupt');
      } else if (cur === 'queued') {
        $info.remove();
        $prgress.css('display', 'block');
        self.percentages[file.id][1] = 0;
      } else if (cur === 'progress') {
        $info.remove();
        $prgress.css('display', 'block');
      } else if (cur === 'complete') {
        $prgress.hide().width(0);
        $li.find('p.progress').hide().width(0);
        $li.append('<span class="success"></span>');
      }

      $li.removeClass('state-' + prev).addClass('state-' + cur);
    });

    $li.on('mouseenter', function () {
      $btns.stop().animate({
        height: 30
      });
    });

    $li.on('mouseleave', function () {
      $btns.stop().animate({
        height: 0
      });
    });

    $btns.on('click', 'i', function () {
      var index = $(this).index();
      switch (index) {
        case 0:
          self.webUploader.removeFile(file.id);
          return;
      }
    });

    $li.appendTo(this.filelist);
    this.addedCount++;
    this.updateState();
    this.updateInfo();
  }

  UploadImageClient.prototype.addUploadedFile = function (id) {
    let $li = $('<li id="' + id + '"><p class="imgWrap"></p></li>');
    let $btns = $('<div class="file-panel"><i class="ion-close-circled"></i></div>').appendTo($li);
    let $wrap = $li.find('p.imgWrap');
    let img = $('<img src="/api/v2/web/thumbnail2/' + this.thumbnailWidth + '/' + this.thumbnailHeight + '/' + id + '">');
    $wrap.empty().append(img);
    $li.append('<span class="success"></span>');

    $li.on('mouseenter', function () {
      $btns.stop().animate({
        height: 30
      });
    });

    $li.on('mouseleave', function () {
      $btns.stop().animate({
        height: 0
      });
    });

    let self = this;
    $btns.on('click', 'i', function () {
      var index = $(this).index();
      switch (index) {
        case 0:
          self.removeUploadedFile(id);
          return;
      }
    });

    $li.appendTo(this.filelist);
  }

  UploadImageClient.prototype.addUploadedFiles = function (ids) {
    this.uploadedCount += ids.length;
    for (let id of ids) {
      this.addUploadedFile(id);
    }
    this.updateState();
    this.updateInfo();
  }

  // 负责view的销毁
  UploadImageClient.prototype.removeFile = function (id) {
    this.addedCount--;
    var $li = $('#' + id);
    delete this.percentages[id];
    $li.off().find('.file-panel').off().end().remove();
    this.updateState();
    this.updateInfo();
  }

  UploadImageClient.prototype.removeUploadedFile = function (id) {
    this.uploadedCount--;
    var $li = $('#' + id);
    $li.off().find('.file-panel').off().end().remove();
    this.updateState();
    this.updateInfo();
  }

  UploadImageClient.prototype.setState = function (val) {
    if (val === this.state) {
      return;
    }

    this.state = val;
    switch (this.state) {
      case 'empty':
        this.placeholder.removeClass('element-invisible');
        this.filelist.hide();
        this.statusBar.addClass('element-invisible');
        this.webUploader.refresh();
        break;

      case 'notEmpty':
        this.placeholder.addClass('element-invisible');
        this.filelist.show();
        this.statusBar.removeClass('element-invisible');
        this.webUploader.refresh();
        break;
    }
  }

  UploadImageClient.prototype.updateState = function () {
    let stats = this.webUploader.getStats();
    if (this.getTotalFileCount()) {
      this.setState('notEmpty');
    } else {
      this.setState('empty');
    }
  }

  UploadImageClient.prototype.updateInfo = function () {
    let text = '';
    let stats = this.webUploader.getStats();

    let diff = this.maxImageCount - this.getTotalFileCount();

    if (diff > 0) {
      text = '还可以添加' + diff + '张照片（可以拖图片到浏览器直接添加，或者粘贴剪贴板的图片）';
    } else {
      text = '图片上传已满，点击删除可以去掉不想要的。'
    }

    this.info.html(text);
  };

  UploadImageClient.prototype.getAllIds = function () {
    let ids = [];
    let self = this;
    this.filelist.children().each(function (i, li) {
      let id = li.id.toString();
      if (id.startsWith('WU_FILE_')) {
        let file = self.webUploader.getFile(id);
        ids.push(file._id);
      } else {
        ids.push(id);
      }
    });

    return ids;
  };

  angular.module('JfjAdmin.components')
    .directive('uploadImage', uploadImage);

  /** @ngInject */
  function uploadImage() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        maxImageCount: '=',
        ids: '=',
        uploader: '='
      },
      templateUrl: 'app/components/uploadImage/uploadImage.html',
      link: function ($scope, $el, $att) {
        $scope.uploadImageClient = new UploadImageClient({
          id: $att.id,
          maxImageCount: $scope.maxImageCount
        });

        $scope.uploader.uploadImageClient = $scope.uploadImageClient;

        $scope.$watch('ids', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            console.log(newVal);
            $scope.uploadImageClient.addUploadedFiles(newVal);
          }
        });
      }
    };
  }

})();
