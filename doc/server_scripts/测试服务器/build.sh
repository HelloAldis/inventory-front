#!/bin/bash

########## Config Start ##########
SCRIPT_ABS_DIR=$(cd "$(dirname "$0")"; pwd)
SOURCE_CODE_DIR=/xvdb/tools/testing-server
API_TARGET_CONFIG_FILE=apiconfig.test.js
API_CONFIG_FILE=apiconfig.js
DATABASE_NAME=phase2-testing
DOMAIN_NAME=dev.jianfanjia.com
PORT=8888
ERR_NO_CONFIG=1
ERR_NO_PRIVILEGE=2
##########  Config End  ##########

## Functions
usage() {
    echo "Usage: ./`basename $0` [Options]"
    echo '''
Options:
        -b VALUE(the build name): update server with given VALUE
        -t: automatically run git command to get the latest tag, then update server
e.g.'''
    echo "        ./`basename $0` -b build-2.6.12"
    echo "        ./`basename $0` -t"

    exit 0
}

setup() {
    [[ $UID -ne 0 ]] && {
        echo "This script should be run as root privilege."
        exit $ERR_NO_PRIVILEGE
    }

    [[ x$SOURCE_CODE_DIR == "x" ]] && echo "SOURCE_CODE_DIR is not set." && exit $ERR_NO_CONFIG
    [[ ! -d $SOURCE_CODE_DIR ]] && echo "Cannot find path: SOURCE_CODE_DIR ($SOURCE_CODE_DIR)" && exit $ERR_NO_CONFIG

    TMP_FILE=${SCRIPT_ABS_DIR}/file_$$.tmp
}

stop_server_if_need() {
    current_build_number=$(awk "/\"version\":/{print \$NF}" ${SOURCE_CODE_DIR}/package.json | sed 's/["|,]//g')
    current_build_name="build-${current_build_number}"
    current_node_id=$(pm2 list | awk "/$current_build_name/{print \$4}")
    current_node_status=$(pm2 list | awk "/$current_build_name/{print \$10}")

    if [[ $current_node_status == "online" ]]; then
        echo "Current node status (name = $current_build_name, id = $current_node_id) is $current_node_status, stop it and delete it..."
        pm2 stop $current_node_id
        pm2 delete $current_node_id
    elif [[ $current_node_status == "stopped" ]]; then
        echo "Current node status (name = $current_build_name, id = $current_node_id) is $current_node_status, delete it..."
        pm2 delete $current_node_id
    else
        echo "Current node status (name = $current_build_name, id = $current_node_id) is $current_node_status, let it be..."
    fi

    # double check whether the port is already in used
    current_process_ids=( $(netstat -anp | grep $PORT | awk "{print \$7}" | awk -F/ "{print \$1}" | sed '/-/d' | uniq) )
    if [[ ${#current_process_ids[@]} -eq 0 ]]; then
        echo "The port $PORT is not in used, go ahead..."
    else
        echo "The port $PORT is already in used by process id (${current_process_ids[@]}), kill it..."
        for id in ${current_process_ids[@]}
        do
            kill $id
        done
    fi
}

# verify whether the given build name exists in git tag list
verify_build_exists() {
    cd ${SOURCE_CODE_DIR}
    upgrade_build_name=$1

    is_exsit=$(git tag | sed -n "/^${upgrade_build_name}\$/p")
    if [[ -z $is_exsit ]]; then
        echo "Error: Target upgrade build ($upgrade_build_name) doesn't exist in git tag list"
        exit 1
    else
        echo "$upgrade_build_name exists in git tag list, go ahead..."
    fi
}

# git checkout build by given build version($1)
checkout_build() {
    cd ${SOURCE_CODE_DIR}
    upgrade_build_name=$1

    rm -rf ${API_CONFIG_FILE} log node_modules
    if [[ $? -eq 0 ]]; then
        echo "Run command [rm -rf ${API_CONFIG_FILE} log node_modules] pass..."
    else
        echo "Run command [rm -rf ${API_CONFIG_FILE} log node_modules] failed..."
        exit 1
    fi

    git checkout * 2> $TMP_FILE
    if [[ $? -eq 0 ]]; then
        echo "Run command: [git checkout *] pass..."
    else
        echo "Run command: [git checkout *] failed..."
        git_unknown=( `awk '/did not match any file\(s\) known to git/{print $3}' $TMP_FILE | sed "s/'//g"` )
        if [[ ${#git_unknown[@]} -ne 0 ]]; then
            echo "Try to delete git known files..."
            for filepath in ${git_unknown[@]}
            do
                echo "Delete filepath: $filepath"
                rm -rf $filepath
            done
            git checkout *
            if [[ $? -eq 0 ]]; then
                echo "Run command: [git checkout *] pass..."
                rm -rf $TMP_FILE
            else
                echo "Run command: [git checkout *] STILL failed..."
                exit 1
            fi
        fi
    fi
    rm -rf $TMP_FILE

    git checkout tags/$upgrade_build_name
    if [[ $? -eq 0 ]]; then
        echo "Run command: [git checkout tags/$upgrade_build_name] pass..."
    else
        echo "Run command: [git checkout tags/$upgrade_build_name] failed..."
        exit 1
    fi
}

get_latest_git_tag() {
    cd ${SOURCE_CODE_DIR}
    echo "Updating git tags..."
    git fetch --tag >/dev/null 2>&1
    if [[ $? -eq 0 ]]; then
        echo "Fetch git tags pass..."
    else
        echo "Fetch git tags failed..."
    fi

    TARGET_BUILD_NAME=$(git tag | sort -V | sed -n '$p')
}

install_module() {
    echo "Install module..."
    cd ${SOURCE_CODE_DIR} && cnpm install >/dev/null 2>&1
    if [[ $? -eq 0 ]]; then
        echo "Install module pass..."
    else
        echo "Install module failed..."
    fi
}

config_server() {
## version 1
#    sed -e "s/db:.*mongodb:.*/db: 'mongodb:\/\/127.0.0.1\/${DATABASE_NAME}',/" \
#-e "s/session_secret: 'jiayizhuang_jianfanjia_secret',/session_secret: 'jiayizhuang_jianfanjia_secret_${DATABASE_NAME}',/" \
#-e "s/^  port: .*,/  port: ${PORT},/" \
#-e "s/^  debug:.*/  debug: true,/" $API_TARGET_CONFIG_FILE > $TMP_FILE \
#    && mv $TMP_FILE $API_CONFIG_FILE \
#    && dos2unix $API_CONFIG_FILE >/dev/null 2>&1

## version 2
#    cp ${SOURCE_CODE_DIR}/$API_TARGET_CONFIG_FILE ${SOURCE_CODE_DIR}/$API_CONFIG_FILE
#
#    if [[ $? -eq 0 ]]; then
#        echo "Run command [cp ${SOURCE_CODE_DIR}/$API_TARGET_CONFIG_FILE ${SOURCE_CODE_DIR}/$API_CONFIG_FILE] pass..."
#    else
#        echo "Run command [cp ${SOURCE_CODE_DIR}/$API_TARGET_CONFIG_FILE ${SOURCE_CODE_DIR}/$API_CONFIG_FILE] failed..."
#    fi

## version 3
    gulp qatest
    if [[ $? -eq 0 ]]; then
        echo "Run gulp command [gulp qatest] pass..."
    else
        echo "Run gulp command [gulp qatest] failed..."
    fi
}

start_server() {
    cd ${SOURCE_CODE_DIR}
    upgrade_build_name=$1
    pm2 start app.js --name="$upgrade_build_name"

    if [[ $? -eq 0 ]]; then
        echo "Start server [pm2 start app.js --name="$upgrade_build_name"] pass..."
    else
        echo "Start server [pm2 start app.js --name="$upgrade_build_name"] failed..."
    fi
}

cleanup() {
    cd $SCRIPT_ABS_DIR
}

########## Main ##########
[[ $# -eq 0 ]] && usage
setup

while getopts ":tb:" OPTION
do
    case "$OPTION" in
        "t")
            get_latest_git_tag
            echo TARGET_BUILD_NAME=$TARGET_BUILD_NAME
            ;;
        "b")
            TARGET_BUILD_NAME=$OPTARG
            echo TARGET_BUILD_NAME=$TARGET_BUILD_NAME
            verify_build_exists $TARGET_BUILD_NAME
            ;;
        ":")
            echo "!!No value for option $OPTARG"
            echo
            usage
            ;;
        "?")
            echo "!!Unknown option $OPTARG"
            echo
            usage
            ;;
    esac
done

stop_server_if_need
checkout_build $TARGET_BUILD_NAME
install_module
config_server
start_server $TARGET_BUILD_NAME
cleanup

exit 0
