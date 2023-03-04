set version=

set PUBLIC_URL=gallery%version%

set VITE_DATA_FOLDER=data%version%

zip -r %PUBLIC_URL%.zip %PUBLIC_URL%/*
