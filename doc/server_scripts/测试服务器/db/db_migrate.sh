#!/bin/bash
## Last update: 2015-12-21

DEBUG=0

##### -- Config Start -- #####
PROD_LAN_IP=10.44.163.108
PROD_USER=root
PROD_DB_BACKUP_PATH=/xvdb/tools/production_backup
PROD_DB_NAME=jianfanjia

IMPORT_BATCH_SIZE=5
DEST_DB_NAME=phase2-testing
POST_JS=postscript.js
SETUP_JS=setupscript.js
##### -- Config End -- #####


##### functions #####
usage() {
    echo
    echo "Usage: ./`basename $0` [Option1] [Option2 VAR]"
    echo '''
Default(no Options): Display this help and exit
Option1:
[-h | --help]: Display this help and exit
[-b | --backup]: Import the latest daily backup data dump from Production to Staging
[-r | --realtime]: Real-time dump database from Production to Staging
Option2:
[-d | --database] VAR: Define the destination database
'''
    exit 0
}

## dump Production database remotely
prod_dump() {
    NOW=`date +%Y%m%d%H%M%S`
    REALTIME_DUMP_FOLDER="${PROD_DB_NAME}_bak_${NOW}"
    echo "start to dump db(${PROD_DB_NAME}) on Production server..."
    ssh ${PROD_USER}@${PROD_LAN_IP} "mongodump -d ${PROD_DB_NAME} -o /root/$REALTIME_DUMP_FOLDER"
    [[ $? -eq 0 ]] && {
        echo "INFO: dump Production db succeed."
    } || {
        echo "ERROR: dump Production db failed!"
        exit 1
    }
}

## remotely copy Production database dump into current directory
## usage: scp_dump %path_to_dump%
scp_dump() {
    # must be absolute path to dump folder
    path_to_dump=$1
    echo "start to copy db dump($path_to_dump) from Production server to current directory..."
    scp -r ${PROD_USER}@${PROD_LAN_IP}:${path_to_dump} . >/dev/null
    [[ $? -eq 0 ]] && {
        echo "INFO: scp -r $path_to_dump from Production server succeed."
    } || {
        echo "ERROR: scp -r $path_to_dump from Production server failed!"
        exit 1
    }

#    [[ $DEBUG -eq 1 ]] && {
#        echo "ssh ${PROD_USER}@${PROD_LAN_IP} 'rm -rf $path_to_dump'"
#    } || {
#        ssh ${PROD_USER}@${PROD_LAN_IP} 'rm -rf $path_to_dump'
#    }
}

## import dump file into given database on staging server
## usage: import_dump %db_name% %path_to_dump%
import_dump() {
    db_name=$1
    path_to_dump=$2
    echo "start to import dump file ($path_to_dump) into db: $db_name"
    [[ $DEBUG -eq 1 ]] && {
        echo "mongorestore -d $db_name --dir=$path_to_dump --batchSize=$IMPORT_BATCH_SIZE --drop"
    } || {
        mongorestore -d $db_name --dir=$path_to_dump --batchSize=$IMPORT_BATCH_SIZE --drop
    }
    [[ $? -eq 0 ]] && {
        echo "INFO: import dump file succeed."
    } || {
        echo "ERROR: import dump file failed!"
        exit 1
    }
}

setup_script() {
    db_name=$1
    mongo $db_name $SETUP_JS
    [[ $? -eq 0 ]] && {
        echo "INFO: execute setup script on db: $db_name succeed."
    } || {
        echo "ERROR: execute setup script on db: $db_name failed!"
        exit 1
    }
}

## some update statements run on db, e.g. update designers password to welcome
post_script() {
    db_name=$1
    mongo $db_name $POST_JS
    [[ $? -eq 0 ]] && {
        echo "INFO: execute post script on db: $db_name succeed."
    } || {
        echo "ERROR: execute post script on db: $db_name failed!"
        exit 1
    }
}

realtime_import() {
    setup_script $DEST_DB_NAME
    prod_dump
    scp_dump /root/$REALTIME_DUMP_FOLDER
    import_dump $DEST_DB_NAME ./$REALTIME_DUMP_FOLDER/$PROD_DB_NAME
    rm -rf ./$REALTIME_DUMP_FOLDER
    post_script $DEST_DB_NAME
    exit 0
}

daily_dump_import() {
    setup_script $DEST_DB_NAME
    DAILY_DUMP_FOLDER=`ssh ${PROD_USER}@${PROD_LAN_IP} "ls -t ${PROD_DB_BACKUP_PATH} | grep "${PROD_DB_NAME}_bak" | head -1"`
    scp_dump $PROD_DB_BACKUP_PATH/$DAILY_DUMP_FOLDER
    import_dump $DEST_DB_NAME ./$DAILY_DUMP_FOLDER/$PROD_DB_NAME
    rm -rf ./$DAILY_DUMP_FOLDER
    post_script $DEST_DB_NAME
    exit 0
}


##### Main Entry #####
OPTION=$1
OPTION2=$2

[[ $OPTION == "-h" || $OPTION == "--help" || $OPTION == '' ]] && usage
if [[ $OPTION2 == "-d" || $OPTION2 == "--database" ]]; then
    if [[ "x$3" == "x" ]]; then
        echo "ERROR: a database name is required for '-d' parameter!"
        exit 1
    else
        DEST_DB_NAME=$3
    fi
fi
[[ "x$POST_JS" == "x" || ! -e $POST_JS ]] && echo "WARN: Post DB script is not defined or the file doesn't exist."
[[ $OPTION == "-b" || $OPTION == "--backup" ]] && daily_dump_import
[[ $OPTION == "-r" || $OPTION == "--realtime" ]] && realtime_import

echo "ERROR: Invalid parameter!" && exit 1

