import PhotoService from "./PhotoService";
import {TAG_EVENT, TAG_TEAM, TAG_ALBUM, TAG_PERSON, TAG_PHOTOGRAPHER} from "../consts";


export default class PhotoParser {
    static MAX = 65535;

    static convertRel(text) {
        return PhotoParser.convertNum(text) / PhotoParser.MAX;
    }


    static getPosition(position) {
        return {
            left: this.convertRel(position.substr(0, 4)),
            top: this.convertRel(position.substr(4, 4)),
            right: this.convertRel(position.substr(8, 4)),
            bottom: this.convertRel(position.substr(12, 4)),
        }
    }

    static convertNum(text) {
        return parseInt("0x" + text);
    }

    static async getPhotoInfo(id, setPhotoInfo) {
        let response = await PhotoService.getPhotoInfo(id);
        console.log("ID", id);
        let curInfo = {
        };
        if (response.data.photo.tags.tag) {
            let person = [], team = [], event = [], album = [], photographer = [];
            for (let i = 0; i < response.data.photo.tags.tag.length; i++) {
                if (response.data.photo.tags.tag[i] === null) {
                    continue;
                }
                let tag = response.data.photo.tags.tag[i].raw;
                if (tag.startsWith(TAG_EVENT)) {
                    event.push(tag.replaceAll(TAG_EVENT+"$", ""));
                    continue;
                }
                if (tag.startsWith(TAG_EVENT)) {
                    event.push(tag.replaceAll(TAG_EVENT+"$", ""));
                    continue;
                }
                if (tag.startsWith(TAG_TEAM)) {
                    team.push(tag.replaceAll(TAG_TEAM+"$", ""));
                    continue;
                }
                if (tag.startsWith(TAG_PERSON)) {
                    person.push({name: tag.replaceAll(TAG_PERSON+"$", "")});
                    continue;
                }
                if (tag.startsWith(TAG_ALBUM)) {
                    album.push(tag.replaceAll(TAG_ALBUM+"$", ""));
                    continue;
                }
                if (tag.startsWith(TAG_PHOTOGRAPHER)) {
                    photographer.push(tag.replaceAll(TAG_PHOTOGRAPHER+"$", ""));
                    continue;
                }
                if (tag.indexOf('(') !== -1) {
                    const name = tag.substr(0, tag.indexOf('('));
                    if (name === "") {
                        continue;
                    }
                    person.push({
                        name: name,
                        position: this.getPosition(tag.substr(tag.indexOf('(') + 1, tag.indexOf(')', tag.indexOf('(')) - tag.indexOf('(') - 1))
                    });
                }
            }
            curInfo[TAG_TEAM] = team;
            curInfo[TAG_EVENT] = event;
            curInfo[TAG_PERSON] = person;
            curInfo[TAG_ALBUM] = album;
            curInfo[TAG_PHOTOGRAPHER] = photographer;
        }
        curInfo[TAG_PHOTOGRAPHER]?.push(response.data.photo.description._content.replaceAll("Photographer: ",""));
        setPhotoInfo(curInfo);
    }
}