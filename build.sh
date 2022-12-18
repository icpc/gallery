#!/bin/bash

PUBLIC_URL=/gallery npm run build || exit 1;
cd build
zip -r upload_me.zip * || exit 1;

