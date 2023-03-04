set version=

set PUBLIC_URL=gallery%version%

set VITE_DATA_FOLDER=data%version%

echo "Making bundle with public_url=%PUBLIC_URL% and data=%VITE_DATA_FOLDER%"

npm run build -- --base=/%PUBLIC_URL%