#!/usr/bin/python
# -*- coding: utf-8 -*-

from pymongo import MongoClient, DESCENDING
import time, os, sys
from datetime import datetime
import send_email

reload(sys)
sys.setdefaultencoding('utf8')

def main():
    database = 'jianfanjia'
    current_dir = os.path.split(os.path.realpath(__file__))[0]
    data_dir = current_dir + '/data'
    if not os.path.isdir(data_dir):
        os.mkdir(data_dir)

    users_data_file = data_dir + '/users.data'
    designers_data_file = data_dir + '/designers.data'
    requirements_data_file = data_dir + '/requirements.data'
    products_data_file = data_dir + '/products.data'
    plans_data_file = data_dir + '/plans.data'
    bidding_plans_data_file = data_dir + '/bidding_plans.data'

    client = MongoClient('localhost', 27017, serverSelectionTimeoutMS=10000)
    db_handler = None
    if database in client.database_names():
        db_handler = client[database]
    else:
        print "Database %s doesn't exists." % database
        sys.exit()
    users = db_handler['users']
    designers = db_handler['designers']
    requirements = db_handler['requirements']
    products = db_handler['products']
    plans = db_handler['plans']

    timestamp_data_file = data_dir + '/last_timestamp.log'
    current_timestamp = int(time.time() * 1000)
    if not os.path.exists(timestamp_data_file):
        with open(timestamp_data_file, 'w') as fp:
            fp.write(str(current_timestamp))
    with open(timestamp_data_file, 'rb') as fp:
        previous_timestamp = int(fp.readline())

    print "previous_timestamp = %d (%s)" % (previous_timestamp, time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(previous_timestamp/1000)))
    print " current_timestamp = %d (%s)" % (current_timestamp, time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(current_timestamp/1000)))

    # for users
    # .sort("create_at", DESCENDING)
    new_users_data = users.find({"create_at":{'$gt':previous_timestamp}}, {"phone":1, "username":1, "create_at":1})
    new_users_count = new_users_data.count()
    if (new_users_count > 0):
        print '%d个新业主' % new_users_count
        mailcontent = ''
        with open(users_data_file, 'w') as fp:
            for data in new_users_data:
                if not data.has_key('username'):
                    data['username'] = ''
                if not data.has_key('phone'):
                    data['phone'] = '微信登录用户，尚未绑定手机号'
                user_register_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(data['create_at']/1000))

                datastr = u'用户名：%s，手机号：%s， 注册时间：%s\n' % (data['username'], data['phone'], user_register_time)
                mailcontent += datastr
                print datastr
                fp.write(datastr)

        if send_email.send(u"新注册业主", mailcontent):
            print "邮件发送成功"
        else:
            print "邮件发送失败"
    else:
        print '没有新注册业主'

    # for designers
    new_designers_data = designers.find({"create_at":{'$gt':previous_timestamp}}, {"phone":1, "username":1, "create_at":1})
    new_designers_count = new_designers_data.count()
    if (new_designers_count > 0):
        print '%d个新设计师' % new_designers_count
        mailcontent = ''
        with open(designers_data_file, 'w') as fp:
            for data in new_designers_data:
                if not data.has_key('username'):
                    data['username'] = ''
                if not data.has_key('phone'):
                    data['phone'] = ''
                designer_register_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(data['create_at']/1000))

                datastr = u'用户名：%s，手机号：%s，注册时间：%s\n' % (data['username'], data['phone'], designer_register_time)
                mailcontent += datastr
                print datastr
                fp.write(datastr)

        if send_email.send(u"新注册设计师", mailcontent):
            print "邮件发送成功"
        else:
            print "邮件发送失败"
    else:
        print '没有新注册设计师'

    # for requirements
    new_requirements_data = requirements.find({"create_at":{'$gt':previous_timestamp}}, {"userid":1, "city":1, "district":1, "basic_address":1, "detail_address":1, "create_at":1, "dec_type":1})
    new_requirements_count = new_requirements_data.count()
    if (new_requirements_count > 0):
        print '%d个新需求' % new_requirements_count
        mailcontent = ''
        req_dec_type = ''
        with open(requirements_data_file, 'w') as fp:
            for data in new_requirements_data:
                if not data.has_key('city'):
                    data['city'] = ''
                if not data.has_key('district'):
                    data['district'] = ''
                if not data.has_key('basic_address'):
                    data['basic_address'] = ''
                if not data.has_key('detail_address'):
                    data['detail_address'] = ''
                if data['dec_type'] == 0:
                    req_dec_type = '家装'
                elif data['dec_type'] == 1:
                    req_dec_type = '商装'
                req_create_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(data['create_at']/1000))

                userdata = users.find({"_id":data['userid']}, {"username":1, "phone":1})
                for userdata_item in userdata:
                    ### HERE: if...else... here in case there is no username for that user
                    if not userdata_item.has_key('username'):
                        userdata_item['username'] = ''
                    if not userdata_item.has_key('phone'):
                        userdata_item['phone'] = ''
                    datastr = u'用户名：%s，手机号：%s，城市：%s，辖区：%s，基本地址：%s，详细地址：%s， 装修类型：%s，需求提交时间：%s\n' % (userdata_item['username'], userdata_item['phone'], data['city'], data['district'], data['basic_address'], data['detail_address'], req_dec_type, req_create_time)
                mailcontent += datastr
                print datastr
                fp.write(datastr)

        if send_email.send(u"新提交的需求", mailcontent):
            print "邮件发送成功"
        else:
            print "邮件发送失败"
    else:
        print '没有新需求'

    # for products
    new_products_data = products.find({"create_at":{'$gt':previous_timestamp}}, {"province":1, "city":1, "district":1, "cell":1, "designerid":1, "create_at":1})
    new_products_count = new_products_data.count()
    if (new_products_count > 0):
        print '%d个新作品' % new_products_count
        mailcontent = ''
        with open(products_data_file, 'w') as fp:
            for data in new_products_data:
                if not data.has_key('province'):
                    data['province'] = ''
                if not data.has_key('city'):
                    data['city'] = ''
                if not data.has_key('district'):
                    data['district'] = ''
                if not data.has_key('cell'):
                    data['cell'] = ''
                product_create_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(data['create_at']/1000))

                designerdata = designers.find({"_id":data['designerid']}, {"username":1, "phone":1})
                for designerdata_item in designerdata:
                    if not designerdata_item.has_key('username'):
                        designerdata_item['username'] = ''
                    if not designerdata_item.has_key('phone'):
                        designerdata_item['phone'] = ''
                    datastr = u'用户名：%s，手机号：%s，省：%s，城市：%s，辖区：%s，小区：%s，作品提交时间：%s\n' % (designerdata_item['username'], designerdata_item['phone'], data['province'], data['city'], data['district'], data['cell'], product_create_time)
                mailcontent += datastr
                print datastr
                fp.write(datastr)

        if send_email.send(u"新上传的作品", mailcontent):
            print "邮件发送成功"
        else:
            print "邮件发送失败"
    else:
        print '没有新上传的作品'

    # for plans 提交
    new_plans_data = plans.find({"last_status_update_time":{'$gt':previous_timestamp}, "status":"3"}, {"designerid":1, "userid":1, "requirementid":1, "last_status_update_time":1})
    new_plans_count = new_plans_data.count()
    if (new_plans_count > 0):
        print '%d个新提交的方案' % new_plans_count
        mailcontent = ''
        with open(plans_data_file, 'w') as fp:
            for data in new_plans_data:
                designerdata = designers.find({"_id":data['designerid']}, {"username":1, "phone":1})
                userdata = users.find({"_id":data['userid']}, {"username":1, "phone":1})
                requirementdata = requirements.find({"_id":data['requirementid']}, {"city":1, "district":1, "basic_address":1, "detail_address":1})
                plan_upload_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(data['last_status_update_time']/1000))
                datastr = u'方案提交时间：%s，' % (plan_upload_time)

                for designerdata_item in designerdata:
                    if not designerdata_item.has_key('username'):
                        designerdata_item['username'] = ''
                    if not designerdata_item.has_key('phone'):
                        designerdata_item['phone'] = ''
                    datastr += u'设计师：%s，手机号：%s，' % (designerdata_item['username'], designerdata_item['phone'])
                for userdata_item in userdata:
                    if not userdata_item.has_key('username'):
                        userdata_item['username'] = ''
                    if not userdata_item.has_key('phone'):
                        userdata_item['phone'] = ''
                    datastr += u'业主：%s，手机号：%s，' % (userdata_item['username'], userdata_item['phone'])
                for requirementdata_item in requirementdata:
                    if not requirementdata_item.has_key('city'):
                        requirementdata_item['city'] = ''
                    if not requirementdata_item.has_key('district'):
                        requirementdata_item['district'] = ''
                    if not requirementdata_item.has_key('basic_address'):
                        requirementdata_item['basic_address'] = ''
                    if not requirementdata_item.has_key('detail_address'):
                        requirementdata_item['detail_address'] = ''
                    datastr += u'需求-城市：%s，需求-辖区：%s，需求-基本地址：%s，需求-详细地址：%s\n' % (requirementdata_item['city'], requirementdata_item['district'], requirementdata_item['basic_address'], requirementdata_item['detail_address'])
                mailcontent += datastr
                print datastr
                fp.write(datastr)

        if send_email.send(u"新提交的方案", mailcontent):
            print "邮件发送成功"
        else:
            print "邮件发送失败"
    else:
        print '没有新提交的方案'

    # for plans 中标
    new_bidding_plans_data = plans.find({"last_status_update_time":{'$gt':previous_timestamp}, "status":"5"}, {"designerid":1, "userid":1, "requirementid":1, "last_status_update_time":1})
    new_bidding_plans_count = new_bidding_plans_data.count()
    if (new_bidding_plans_count > 0):
        print '%d个中标的方案！！' % new_bidding_plans_count
        mailcontent = ''
        with open(bidding_plans_data_file, 'w') as fp:
            for data in new_bidding_plans_data:
                designerdata = designers.find({"_id":data['designerid']}, {"username":1, "phone":1})
                userdata = users.find({"_id":data['userid']}, {"username":1, "phone":1})
                requirementdata = requirements.find({"_id":data['requirementid']}, {"city":1, "district":1, "basic_address":1, "detail_address":1})
                plan_bidding_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(data['last_status_update_time']/1000))
                datastr = u'方案中标时间：%s，' % (plan_bidding_time)

                for designerdata_item in designerdata:
                    if not designerdata_item.has_key('username'):
                        designerdata_item['username'] = ''
                    if not designerdata_item.has_key('phone'):
                        designerdata_item['phone'] = ''
                    datastr += u'设计师：%s，手机号：%s，' % (designerdata_item['username'], designerdata_item['phone'])
                for userdata_item in userdata:
                    if not userdata_item.has_key('username'):
                        userdata_item['username'] = ''
                    if not userdata_item.has_key('phone'):
                        userdata_item['phone'] = ''
                    datastr += u'业主：%s，手机号：%s，' % (userdata_item['username'], userdata_item['phone'])
                for requirementdata_item in requirementdata:
                    if not requirementdata_item.has_key('city'):
                        requirementdata_item['city'] = ''
                    if not requirementdata_item.has_key('district'):
                        requirementdata_item['district'] = ''
                    if not requirementdata_item.has_key('basic_address'):
                        requirementdata_item['basic_address'] = ''
                    if not requirementdata_item.has_key('detail_address'):
                        requirementdata_item['detail_address'] = ''
                    datastr += u'需求-城市：%s，需求-辖区：%s，需求-基本地址：%s，需求-详细地址：%s\n' % (requirementdata_item['city'], requirementdata_item['district'], requirementdata_item['basic_address'], requirementdata_item['detail_address'])
                mailcontent += datastr
                print datastr
                fp.write(datastr)

        if send_email.send(u"新中标的方案", mailcontent):
            print "邮件发送成功"
        else:
            print "邮件发送失败"
    else:
        print '没有新中标的方案'

    client.close()

    with open(timestamp_data_file, 'w') as fp:
        fp.write(str(current_timestamp))

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt, e:
        print "The program is interrupted."
        sys.exit()


