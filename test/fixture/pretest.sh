#!/bin/bash
set -ev

pushd `dirname $0`
DIR=`pwd`

../../bin/mm.js build
../../bin/mm.js up

popd
