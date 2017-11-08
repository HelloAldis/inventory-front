#!/usr/bin/python
# -*- coding: UTF-8 -*-

import smtplib, sys, os
from email.mime.text import MIMEText

mailto_list=['hank.zhang@myjyz.com', 'aldis.zhan@myjyz.com', 'sunny.hu@myjyz.com']
mail_host="smtp.exmail.qq.com"
mail_user="hank.zhang@myjyz.com"
mail_pass="Zh3231519_"

def send(subject, content, to_list=mailto_list):
    me = "Hank<" + mail_user + ">"
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

if __name__ == '__main__':
    if(len(sys.argv) != 3):
        print "ERROR: 2 parameters are required: %email subject% %email content file%"
        sys.exit(1)

    subject = sys.argv[1]
    content_file = sys.argv[2]

    if(subject == ""):
        subject = "No subject"

    if(os.path.isfile(content_file)):
        with open(content_file, 'r') as f:
            email_content = f.read()
        send(subject, email_content)
    else:
        print "ERROR: Mail content file (" + content_file + ") doesn't exist!"
        sys.exit(1)
