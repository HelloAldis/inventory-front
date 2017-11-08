#!/bin/sh
# done: monitor the memory usage for target process by process name
# last modified date: 2007-11-26

pro=$1
SLEEP_TIME=10
MEM_SUM=8058056
S_NAME=`basename $0`
DAY="date +%F"
MEM_LOG=MEM_LOG_$1_`$DAY`.csv
DATE="date +%r"

usage () {
    echo """[Error] Give me the process name!
Usage: $S_NAME %process name%
e.g. $S_NAME logging"""
    exit 1
}
[ $# -ne 1 ] && usage

cal_mem () {
    mems=`ps -eo user,rss,%mem,vsz,comm | grep $pro \
    | awk '{sum+=$2} END{print sum}'`
    ratio=`echo "scale=2; $mems*100/$MEM_SUM" | bc`
    echo "RSS = $mems (kb) (total rss for process $pro)" \
    | tee -a $MEM_LOG
    echo "Ratio = $ratio (%) (MEM_SUM=$MEM_SUM k)" \
    | tee -a $MEM_LOG
}

start () {
    echo "[`$DATE`] START TO LOG FOR $1 >>>" | tee -a $2
}
start $pro $MEM_LOG

stop () {
    echo "[`$DATE`] STOP LOG FOR $1 <<<" | tee -a $2
}

logout () {
    stop $pro $MEM_LOG
    echo >> $MEM_LOG
    exit
}

trap "logout" 2 3 9 15

while true
do
    cal_mem
    echo "[`$DATE`]" >> $MEM_LOG
    sleep $SLEEP_TIME
done

