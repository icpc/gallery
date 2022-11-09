#!/bin/bash

PUBLIC_URL=/gallery npm run build
cd build
zip -r upload_me.zip *

