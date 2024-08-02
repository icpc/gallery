import axios from "axios";

import { api_key, PER_PAGE, TAG_ALBUM, TAG_EVENT, TAG_TEAM, user_id } from "../consts";

export default class PhotoService {
    // Parameters help: https://www.flickr.com/services/api/flickr.photos.search.html
    static extras = "tags,machine_tags,url_m,url_c,url_l,url_o,description,date_upload,date_taken";
    static parameters = `&sort=date-taken-desc&per_page=${PER_PAGE}&extras=${PhotoService.extras}&format=json&nojsoncallback=?`;

    static getAllWithEvent(year, event = "Photo%20Tour", page = 1, config = {}) {
        return this.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=${TAG_EVENT}$${event},${TAG_ALBUM}$${year}&tag_mode=all&page=${page}` + PhotoService.parameters, config);
    }

    static getAllWithTeam(year, team, page = 1, config = {}) {
        return this.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=${TAG_ALBUM}$${year},${TAG_TEAM}$${team}&tag_mode=all&page=${page}` + PhotoService.parameters, config);
    }

    static getAllWithPerson(year, person, page = 1, config = {}) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=${TAG_ALBUM}$${year}&tag_mode=all&page=${page}&text=${person}` + PhotoService.parameters, config);
    }

    static getAllWithText(text, page = 1, config = {}) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&page=${page}&text=${text}%20and%20${TAG_ALBUM}$` + PhotoService.parameters, config);
    }

    static getPhotoInfo(id, config = {}) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.getInfo&api_key=${api_key}&user_id=${user_id}&format=json&nojsoncallback=?&photo_id=${id}`, config);
    }

    static async getAll(link, config = {}) {
        try {
            const response = await axios.get(link, config);
            return response;
        } catch (e) {
            console.log(e);
        }
    }
}
