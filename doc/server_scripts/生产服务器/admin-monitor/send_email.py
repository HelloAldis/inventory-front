#!/usr/bin/python
# -*- coding: UTF-8 -*-

import smtplib
from email.mime.text import MIMEText

#mailto_list=['hank.zhang@myjyz.com', 'sunny.hu@myjyz.com']
mailto_list=['sunny.hu@myjyz.com']
mail_host="smtp.exmail.qq.com"
mail_user="hank.zhang@myjyz.com"
mail_pass="Zh3231519_"
mail_postfix="myjyz.com"

def send(subject, content, to_list=mailto_list):
    me = "jianfanjia-monitor<" + mail_user + ">"
    msg = MIMEText(content, _subtype='plain', _charset='utf-8')
    msg['Subject'] = subject
    msg['From'] = me
    msg['To'] = ";".join(to_list)
    try:
        server = smtplib.SMTP()
        server.connect(mail_host)
        server.login(mail_user, mail_pass)
        server.sendmail(me, to_list, msg.as_string())
        server.close()
        return True
    except Exception, e:
        print str(e)
        return False
