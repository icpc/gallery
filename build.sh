#!/bin/bash

PUBLIC_URL=${PUBLIC_URL:-gallery}

VITE_DATA_FOLDER=${VITE_DATA_FOLDER:-data}

MODE=${MODE:-production}

echo "Making bundle with public_url=/$PUBLIC_URL and data=$VITE_DATA_FOLDER"

PUBLIC_URL="$PUBLIC_URL" VITE_DATA_FOLDER="$VITE_DATA_FOLDER" npm run build -- --base=/${PUBLIC_URL} --mode=${MODE} || exit 1;

zip -r $PUBLIC_URL.zip $PUBLIC_URL/* || exit 1;

