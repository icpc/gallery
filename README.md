# [ICPC.global](https://icpc.global) World Finals Photo Gallery V2022

Created to substitute [news.icpc.global/gallery](https://news.icpc.global/gallery) photoarchive.

[Figma mockups](https://www.figma.com/file/MvNh0jm8dj0LXOh9vsVUbK/ICPC-Live?node-id=0%3A1)

Important features to keep:

- no-backend flickr-based solution
- photos are classified based on public flickr tags: year, event, team
- individuals are tagged as "Firstname Lastname (location)"
- show metadata information: photographer, year, event, team, tagged individuals, highlight tag locations
- search by substring over all tags
- easy image download
- adaptive interface for larger screens
- mobile version

# User guide

Welcome to the updated icpc gallery. All official photos from ICPC World Finals are stored here. If you would like to contribute your photos, email to lidia@icpc.global.

## Year Filter

Select a year! Selector is located on the left on desktop and in the upper menu on mobile/ By default, when selectin a year with no other filters preset, you will enter a `Photo Tour`.

## Event Filter

Photos from each year are classified into multiple events. Select the appropriate event in the `Events` filter. Some noteworthy filters are `Opening Ceremony`. `Team Photos`, `World Finals` and `Closing Ceremony`.

## Team Filter

Pictures may have specific teams tagged in them. Select the team name from the list (or type a few letters to narrow your search) to get all images of that team in the selected year.

## People Filter

To select the images with recognised individuals, pick a name from the list of suggestions, or type a few letters to narrow your search.

## General Search

To search by a keyword just type it into the Search field. For example, `Bill`, `Opening` or `Champions`

# Development

The gallery is built on top of the flickr api backend. All metadata is stored in photo exif tags. Tag types are:

- year, for example `album$2001`
- event, for example `event$Team Photos`
- team, for example `team$Aalto University`
- person, for example `Bill Poucher(1761524d3f579a4d)`. The data in parenthesis denotes face location within the image in Picasa standard.

Visit [tutorial](https://docs.google.com/document/d/1yBeLEYyGG2FpZGjBmAHP37gJAnKGtA56hAf1XjW8d18/edit#heading=h.iv1qq69p60ub) for more info.

## Picasa Standard Face Tag

The 16 characters enclosed in rect64(…) is a 64-bit hexadecimal number which can be broken up into four 16-bit numbers used to identify the position of the rectangle used to mark the face.

If you divide each of the four 16-bit numbers by the maximum unsigned 16-bit number (65535), you’ll get four numbers between 0 and 1 which give the relative coordinates for the face rectangle in the order: left, top, right, bottom.

To calculate the absolute coordinates, multiply the left and right relative coordinates by the width of the image and multiply the top and bottom relative coordinates by the height of the image. This way the faces will always be identified even when the image is re-sized.

## Flickr Tag Processing

Even though flickr stores tags in their initial form, it is important to remember the following

- by default, manually entered tags are split into separate words. Enclose the tag in quotes `"team$Aalto University"` to keep tag intact
- flickr eliminates all spaces and non-letter sybmols from tags for the filtering purposes
- make sure to keep correct encoding on tags, specifically in people names, to consistently process diacritic symbols
- make sure to enclose all university names with punctuation in quotes

## Configuration

[`src/const.js`](https://github.com/icpc/gallery/blob/main/data/consts.js) contais access detail and general year setup.

This repository supports multiple galleries, each with its own dedicated [`/data/`](https://github.com/icpc/gallery/tree/main/data) folder.
Each year is represented by three files in this folder: `.event`, `.people` and `.team` with one item per line.

## Production Deployment Guide

1. After every commit Action [Publish Release](https://github.com/icpc/gallery/actions) will run automatically.
1. Open the Action page for the corresponding run. Wait for it to finish
1. Download the created `all_raw` on the bottom of the page
1. Upload the acquired `all_raw.zip` archive into Bluehost -> Advanced -> File Manager -> under `home/public_html/newsicpc/` folder
1. Select `all_raw.zip` in the bluehost filemanager webinterface and press the `Extract` button
1. All new galleries are deployed, good job!

## Development Deployment Guide

Requires: Node 18+

Select gallery instance and build

```
set version=

set PUBLIC_URL=gallery%version%

set VITE_DATA_FOLDER=data%version%

echo "Making bundle with public_url=%PUBLIC_URL% and data=%VITE_DATA_FOLDER%"

npm run build -- --base=/%PUBLIC_URL%
```

3. this will produce a folder named %PUBLIC_URL%
4. upload this folder to your server

## Future Work:

- easy interface to suggest a photo tag change
- (?) support universities changing names
- rename events for better consistence (correct flickr tags)
- release badge recognition tool
- release tag embedding tool
- support a face recognition tool
