import PhotoService from "./PhotoService";


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

    static async getPhotoInfo (id, setPhotoInfo) {
        let response = await PhotoService.getPhotoInfo(id);
        let curInfo = {
            "photographer": response.data.photo.description._content,
        };
        if (response.data.photo.tags.tag) {
            let person = [], team = [], event = [];
            for (let i = 0; i < response.data.photo.tags.tag.length; i++) {
                if (response.data.photo.tags.tag[i] === null) {
                    continue;
                }
                let tag = response.data.photo.tags.tag[i].raw;
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
                if (tag.startsWith("event")) {
                    event.push(tag.replaceAll("event$", ""));
                }
                if (tag.startsWith("team")) {
                    team.push(tag.replaceAll("team$", ""));
                }
                if (tag.startsWith("person")) {
                    person.push({name: tag.replaceAll("person$", "")});
                }
            }
            curInfo["team"] = team;
            curInfo["event"] = event;
            curInfo["person"] = person;
        }
        console.log("kek");
        console.log(curInfo);
        setPhotoInfo(curInfo);
    }
}