#!/bin/sh
# done: monitor the memory usage for service process by process ID
# last modified date: 2007-11-26

pid=$1
SLEEP_TIME=10
MEM_SUM=8058056
S_NAME=`basename $0`
now=`date +%F`
MEM_LOG=MEM_LOG_$1_$now.csv
DATE="date +%r"

usage () {
    echo """[Error] Give me the process ID!
Usage: $S_NAME %process ID%
e.g. $S_NAME logging"""
    exit 1
}
[ $# -ne 1 ] && usage

cal_mem () {
    mems=`ps -eo user,rss,%mem,vsz,pid | grep $pid \
    | awk '{sum+=$2} END{print sum}'`
    ratio=`echo "scale=2; $mems*100/$MEM_SUM" | bc`
    echo "RSS = $mems (kb) (total rss for process $pid)" \
    | tee -a $MEM_LOG
    echo "Ratio = $ratio (%) (MEM_SUM=$MEM_SUM k)" \
    | tee -a $MEM_LOG
}

start () {
    echo "[`$DATE`] START TO LOG FOR $1 >>>" | tee -a $2
}
start $pid $MEM_LOG

stop () {
    echo "[`$DATE`] STOP LOG FOR $1 <<<" | tee -a $2
}

logout () {
    stop $pid $MEM_LOG
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

