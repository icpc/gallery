#!/bin/bash

read -p "Enter the public url for the application without '/' (default: gallery): " PUBLIC_URL
PUBLIC_URL=${PUBLIC_URL:-gallery}

read -p "Enter the data folder for the application (default: data): " VITE_DATA_FOLDER
VITE_DATA_FOLDER=${VITE_DATA_FOLDER:-data}

echo "Making bundle with public_url=/$PUBLIC_URL and data=$VITE_DATA_FOLDER"

PUBLIC_URL="$PUBLIC_URL" VITE_DATA_FOLDER="$VITE_DATA_FOLDER" npm run build -- --base=/${PUBLIC_URL} || exit 1;

zip -r $PUBLIC_URL.zip $PUBLIC_URL/* || exit 1;

