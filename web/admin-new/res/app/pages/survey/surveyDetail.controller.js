(function() {
    angular.module('JfjAdmin.pages.survey')
        .filter('to_trusted', ['$sce', function ($sce) {
          return function (text) {
              return $sce.trustAsHtml(text);
          }
        }])
        .controller('SurveyDetailController', [
            '$scope','$rootScope','$sce','adminEvents',
            function($scope, $rootScope,$sce,adminEvents) {
              $scope.itemData = [
                {
                  id : 0,
                  title : '您是否有过装修经历？',
                  item : [
                     'A：有',
                     'B：没有'
                   ]
                },
                {
                  id : 101,
                  title : '1，你是选择哪种方式装修的？',
                  item : [
                     'A：直接找包工头（项目经理）',
                     'B：直接找装修公司',
                     'C：找设计师装修',
                     'D：找互联网装修平台'
                   ]
                },
                {
                  id : 102,
                  title : '2，你选择这种装修方式的主要原因是什么？',
                  item : [
                     'A：品牌影响力',
                     'B：装修价格',
                     'C：施工质量',
                     'D：售后保障',
                     'E：熟人介绍放心',
                     'F：设计效果'
                   ]
                },
                {
                  id : 103,
                  title : '3，在新房装修前，你是通过哪些渠道了解装修相关信息的？',
                  item : [
                       'A：装修、家居相关网站',
                       'B：社交媒体（如微博，微信等）',
                       'C：杂志书籍',
                       'D：亲戚朋友',
                       'E：装修公司或材料商销售人员'
                     ]
                },
                {
                  id : 104,
                  title : '4，装修前你会参考哪些方面的内容？',
                  item : [
                       'A：装修效果图',
                       'B：装修知识及技巧文章',
                       'C：装修公司宣传内容和广告',
                       'D：进入装修论坛看网友分享资讯'
                     ]
                },
                {
                  id : 105,
                  title : '5，你的装修费用是多少（不含家电和家具）',
                  item : [
                       'A：800元/平方米以下',
                       'B：800元/平方米——1500元/平方米',
                       'C：1500元/平方米以上'
                     ]
                },
                {
                  id : 106,
                  title : '6，你觉得设计师重要吗？',
                  item : [
                       'A：设计师并不重要，我完全有自己的想法',
                       'B：设计师并不重要，装修规划参考别人家的就可以了',
                       'C：设计师很重要，但我认为设计效果图应该免费提供，不需要额外支付费用',
                       'D：设计师很重要，我愿意为此支付设计费'
                     ]
                },
                {
                  id : 107,
                  title : '7，你花了多少设计费？',
                  item : [
                       'A：5000元以下',
                       'B：5000元到10000元',
                       'C：10000元以上',
                       'D：没有支付设计费用'
                     ]
                },
                {
                  id : 108,
                  title : '8，在装修或准备装修时，以下哪些环节让你感到头疼？',
                  item : [
                       'A：不知道选择哪个装修公司',
                       'B：最初设计与最后装修结果有一定差异',
                       'C：装修过程无人监管，工人怠工造成延期，施工周期没有保障',
                       'D：主材预算难控制',
                       'E：装修质量难以掌控'
                     ]
                },
                {
                  id : 1009,
                  title : '9，如果马上进行下一次装修，你会有哪些期望？',
                  item : [
                       'A：更快速选择好的装修渠道',
                       'B：得到更专业的装修建议和设计图',
                       'C：能够远程查看装修进度',
                       'D：专业的验房和第三方监理服务',
                       'E：提供可靠的材料采购渠道'
                     ]
                },
                {
                  id : 1010,
                  title : '10，如果要选择一家互联网装修公司，你会更看重哪些要素？',
                  item : [
                     'A：提供的设计图及方案是否令人满意',
                     'B：装修质量和工期',
                     'C：第三方监理服务',
                     'D：报价和材料购买是否透明',
                     'E：价格比传统装修公司更低',
                     'F：坐在家中就能得到装修平面图和预算',
                     'G：实时远程控制管理工地'
                   ]
                },
                {
                  id : 1011,
                  title : '11，以下哪个LOGO最能吸引你？',
                  item : [
                       'A：<img src="/weixin/survey/icon.png" width="120" alt="" />',
                       'B：<img src="/weixin/survey/icon1.png" width="120" alt="" />',
                       'C：<img src="/weixin/survey/icon2.png" width="120" alt="" />',
                       'D：<img src="/weixin/survey/icon3.png" width="120" alt="" />',
                       'E：<img src="/weixin/survey/icon4.png" width="120" alt="" />'
                     ]
                },
                {
                  id : 201,
                  title : '1，你每天上网多长时间？（包括使用手机上网）',
                  item : [
                       'A：1小时以下',
                       'B：1小时——3小时',
                       'C：3小时——5小时',
                       'D：5小时以上'
                     ]
                },
                {
                  id : 202,
                  title : '2，在以下哪个时段，你喜欢用手机上网？',
                  item : [
                       'A：在家休闲时',
                       'B：起床前',
                       'C：上床入睡前',
                       'D：饭后休息时',
                       'E：坐车途中',
                       'F：吃饭时',
                       'G：工作或学习时',
                       'H：无法使用电脑上网时',
                       'I：排队等候时'
                     ]
                },
                {
                  id : 203,
                  title : '3，商品单价在哪个范围时，你更倾向于在网上购买？',
                  item : [
                       'A：1000元以下',
                       'B：1000元到5000元',
                       'C：5000元到1万元',
                       'D：1万元到10万元',
                       'E：10万元以上'
                     ]
                },
                {
                  id : 204,
                  title : '4，购物之前，你会通过哪些方式了解产品相关信息？',
                  item : [
                       'A：网站',
                       'B：社交媒体（如微博，微信等）',
                       'C：杂志书籍',
                       'D：亲戚朋友',
                       'E：销售人员'
                     ]
                },
                {
                  id : 205,
                  title : '5，什么内容会让你看完后立刻收藏或转发到朋友圈？',
                  item : [
                       'A：心理测试及鸡汤',
                       'B：实用性的文章（如生活小技巧）',
                       'C：医疗保健',
                       'D：八卦、娱乐及搞笑',
                       'E：星座、性格分析',
                       'F：有奖促销及活动',
                       'G：新闻资讯'
                     ]
                },
                {
                  id : 206,
                  title : '6，看到了什么商品或服务，你会推荐给亲朋好友？',
                  item : [
                       'A：便宜、好用',
                       'B：设计做工精湛',
                       'C：新颖有趣'
                     ]
                },
                {
                  id : 207,
                  title : '7，你喜欢怎样的家居风格？',
                  item : [
                       'A：现代简约（时尚，干净利落）',
                       'B：欧式田园（重在对自然的体现，以小碎花装饰为主）',
                       'C：时尚混搭（中西式于一体）',
                       'D：中式古典（华丽的装饰，浓烈的色彩，雍容华贵）',
                       'E：新中式（高端，庄重，优雅）',
                       'F：北欧（简约，明亮）',
                       'G：欧式古典（豪华，富丽，复古）',
                       'H：地中海（明快，清新）',
                       'I：美式（豪华，大气）'
                     ]
                },
                {
                  id : 208,
                  title : '8，如果要装修，你最注重哪一部分的设计？',
                  item : [
                       'A：客厅',
                       'B：厨房',
                       'C：书房',
                       'D：卧室',
                       'E：洗手间和浴室',
                       'F：玄关'
                     ]
                },
                {
                  id : 2009,
                  title : '9，如果选择装修公司，你更看重什么因素？',
                  item : [
                       'A：品牌影响力',
                       'B：门店分布广',
                       'C：售后保障',
                       'D：施工质量',
                       'E：价格',
                       'F：可以通过手机APP来享受监理、工地管理等服务'
                     ]
                },
                {
                  id : 2010,
                  title : '10，你希望自己的家是由谁设计的？',
                  item : [
                       'A：自己',
                       'B：专业设计师',
                       'C：家人和朋友，或共同设计',
                       'D：装修人员或公司'
                     ]
                },
                {
                  id : 2011,
                  title : '11，以下哪个LOGO最能吸引你？',
                  item : [
                       'A：<img src="/weixin/survey/icon.png" width="120" alt="" />',
                       'B：<img src="/weixin/survey/icon1.png" width="120" alt="" />',
                       'C：<img src="/weixin/survey/icon2.png" width="120" alt="" />',
                       'D：<img src="/weixin/survey/icon3.png" width="120" alt="" />',
                       'E：<img src="/weixin/survey/icon4.png" width="120" alt="" />'
                     ]
                }
              ];
              adminEvents.answer({"wenjuanid":1}).then(function(resp){
                  angular.forEach(resp.data.data,function(n,v){
                      angular.forEach($scope.itemData,function(m,k){
                          if(n.questionid == m.id){
                            m.count = n.answer_count
                          }
                      })
                  })
              },function(resp){
                  console.log(resp);
              });
        }]);
})();
