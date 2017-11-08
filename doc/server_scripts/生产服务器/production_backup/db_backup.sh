#!/bin/bash

DUMP=/usr/bin/mongodump
OUT_DIR=/xvdb/tools/production_backup
DB_NAME=jianfanjia
DAYS=9
DATE=`date +%Y%m%d%H%M`
OUT_FOLDER="${DB_NAME}_bak_${DATE}"

cd $OUT_DIR
$DUMP -d $DB_NAME -o $OUT_FOLDER 
find $OUT_DIR -maxdepth 1 -name "${DB_NAME}_bak*" -type d -mtime +$DAYS -exec rm -rf {} \;

