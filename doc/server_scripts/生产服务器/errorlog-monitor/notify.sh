#!/bin/bash

### Config start ###
#TARGET_MONITOR_FILE=/xvdb/tools/errorlog-monitor/error.log
#TARGET_MONITOR_FILE=/xvdb/jianfanjia-server/log/error.log
#TARGET_MONITOR_FILE=/xvdb/tools/testing-server/log/error.log
TARGET_MONITOR_FILE=/xvdb/release/error.log
EMAIL_SUBJECT=""
SCRIPT_ABS_DIR=$(cd "$(dirname "$0")"; pwd)
###  Config end  ###

### functions ###
## check error in target monitor file, if grabbed error,
## save post-processing content into file and define email subject
analyze_error() {
    (( from_line = last_line + 1 ))
    #error_type=`sed -n "${from_line},\$ {/error/p}" $TARGET_MONITOR_FILE | awk '{print $4}' | sort | uniq`
    EMAIL_SUBJECT="error detected."
    sed -n "${from_line},${current_line} p" $TARGET_MONITOR_FILE | sed '/^    at/d' >> $EMAIL_CONTENT_FILE
}

reset_checkline() {
    echo 0 > $LAST_LINE_DATA
}

setup() {
    DATA_DIR=${SCRIPT_ABS_DIR}/data
    LAST_LINE_DATA=${DATA_DIR}/last_line.data
    SEND_EMAIL=${SCRIPT_ABS_DIR}/send_email.py
    EMAIL_CONTENT_FILE=${DATA_DIR}/email_content.data

    [[ ! -e $DATA_DIR ]] && mkdir -p $DATA_DIR

    if [[ ! -e $TARGET_MONITOR_FILE ]]; then
        echo "No error detected [error file is not generated: $TARGET_MONITOR_FILE]"
        exit 0
    fi

    [[ ! -e $LAST_LINE_DATA || ! -s $LAST_LINE_DATA ]] && reset_checkline
}

##### Main Entry #####
setup

last_line=$(cat $LAST_LINE_DATA)
current_line=$(wc -l $TARGET_MONITOR_FILE | awk '{print $1}')
(( new_line = current_line - last_line ))

if [[ $new_line -gt 0 ]]; then
    echo "Start to check if has error..."
    analyze_error
    if [[ -e $EMAIL_CONTENT_FILE && -s $EMAIL_CONTENT_FILE ]]; then
        echo "Error detected, sending alert email..."
        $SEND_EMAIL "$EMAIL_SUBJECT" $EMAIL_CONTENT_FILE
        if [[ $? -eq 0 ]]; then
            echo "Sending alert email succeed..."
            rm -rf $EMAIL_CONTENT_FILE
        else
            echo "Alert email doesn't send successfully."
        fi
    else
        echo "No error detected [analyze_error doesn't output any alert file]"
    fi
    echo $current_line > $LAST_LINE_DATA
elif [[ $new_line -lt 0 ]]; then
    echo "May be the error log content is cleared, reset check lines to 0"
    reset_checkline
    exit 0
else
    echo "No need check error, exit... [error file growth is 0: $TARGET_MONITOR_FILE]"
    exit 0
fi

exit 0

