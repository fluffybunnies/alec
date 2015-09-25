#!/bin/bash

echo "some stdout"
>&2 echo "some stderr"
commandnotfound
