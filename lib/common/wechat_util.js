var util = require('util');

var image_text_template =
  '<xml>\
<ToUserName><![CDATA[%s]]></ToUserName>\
<FromUserName><![CDATA[%s]]></FromUserName>\
<CreateTime>%s</CreateTime>\
<MsgType><![CDATA[news]]></MsgType>\
<ArticleCount>1</ArticleCount>\
<Articles>\
<item>\
<Title><![CDATA[%s]]></Title>\
<Description><![CDATA[%s]]></Description>\
<PicUrl><![CDATA[%s]]></PicUrl>\
<Url><![CDATA[%s]]></Url>\
</item>\
</Articles>\
</xml>';

exports.get_image_text_msg = function (to_user, from_user, title, description,
  pic_url, url) {
  var time = parseInt(new Date().getTime() / 1000);
  return util.format(image_text_template, to_user, from_user, time, title,
    description, pic_url, url);
}

var text_template =
  '<xml><ToUserName><![CDATA[%s]]></ToUserName>\
<FromUserName><![CDATA[%s]]></FromUserName>\
<CreateTime>%s</CreateTime>\
<MsgType><![CDATA[text]]></MsgType>\
<Content><![CDATA[%s]]></Content></xml>'

exports.get_text_msg = function (to_user, from_user, content) {
  var time = parseInt(new Date().getTime() / 1000);
  return util.format(text_template, to_user, from_user, time, content);
}
