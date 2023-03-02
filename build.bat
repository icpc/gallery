set /p "PUBLIC_URL=Enter the public url for the application (default: /gallery): "
IF "%PUBLIC_URL%"=="" set PUBLIC_URL=/gallery

set /p "VITE_DATA_FOLDER=Enter the data folder for the application (default: data): "
IF "%VITE_DATA_FOLDER%"=="" set VITE_DATA_FOLDER=data

echo "Making bundle with public_url=%PUBLIC_URL% and data=%VITE_DATA_FOLDER%"

npm run build -- --base=%PUBLIC_URL%
cd dist
zip -r upload_me.zip *
