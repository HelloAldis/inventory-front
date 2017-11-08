#!/bin/bash
## Date: 2016-04-26
## Target: kill the "gm convert" processes which 
##         in Interruptible sleep state AND elapsed time > 30 minutes

## elapsed time > 1 day
## ps -eo etime,s,pid,ppid,wchan,args | egrep "[[:digit:]]+-[[:digit:]]{1,2}:[[:digit:]]{1,2}:[[:digit:]]{1,2} S.*gm convert"

## elapsed time > 1 hour
## ps -eo etime,s,pid,ppid,wchan,args | egrep "[[:digit:]]{1,2}:[[:digit:]]{1,2}:[[:digit:]]{1,2} S.*gm convert"

## elapsed time > 30 minutes
## ps -eo etime,s,pid,ppid,wchan,args | egrep "[3-6][0-9]:[[:digit:]]{1,2} S.*gm convert"

PIDS=( `ps -eo etime,s,pid,ppid,wchan,args | egrep "[3-6][0-9]:[[:digit:]]{1,2} S.*gm convert" | awk '{print $3}'` )

for pid in ${PIDS[@]}
do
    echo kill process id = $pid
    kill $pid
done

echo "All DONE"
