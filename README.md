# [ICPC.global](https://icpc.global) World Finals Photo Gallery V2022

Created to substitute [news.icpc.global/gallery](https://news.icpc.global/gallery) photoarchive.

[Figma mockups](https://www.figma.com/file/MvNh0jm8dj0LXOh9vsVUbK/ICPC-Live?node-id=0%3A1)

Important features to keep:
* no-backend flickr-based solution
* photos are classified based on public flickr tags: year, event, team
* individuals are tagged as "Firstname Lastname (location)"
* show metadata information: photographer, year, event, team, tagged individuals, highlight tag locations
* search by substring over all tags
* easy image download

Important featured to implement:
* adaptive interface for larger screens
* mobile version

## How to start

1. Set path

```
set PUBLIC_URL=/gallery
```

2. Start production build

```
npm run build
```

3. rename `build` folder into `gallery`
4. upload `gallery` folder to your server

## Future Work:

* easy interface to suggest a photo tag change
* infinite scroll though all years by given filter
* work better with university names with commas, ampersands and other symbols in the name
* (?) support universities changing names
* rename events for better consistence (correct flickr tags)
* release badge recognition tool
* release tag embedding tool
* support a face recognition tool
