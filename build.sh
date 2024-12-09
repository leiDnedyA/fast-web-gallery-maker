#!/bin/bash

npm run build
rm -rf backend/static
mv dist backend/static
