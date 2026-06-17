#!/usr/bin/env bash
set -euo pipefail
find . -name ".DS_Store" -delete
find . -name "Icon*" -not -path "./.git/*" -print -delete
