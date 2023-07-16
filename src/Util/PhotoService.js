import {api_key, PER_PAGE, user_id, TAG_EVENT, TAG_TEAM, TAG_ALBUM} from "../consts";
import axios from "axios";

export default class PhotoService {
    static extras = "tags,url_m,url_c,url_l,url_o,description,date_upload,date_taken";
    static parameters = `&per_page=${PER_PAGE}&extras=${PhotoService.extras}&format=json&nojsoncallback=?`;

    static getAllWithEvent(year, event = "Photo%20Tour", page = 1) {
        return this.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=${TAG_EVENT}$${event},${TAG_ALBUM}$${year}&tag_mode=all&page=${page}` + PhotoService.parameters);
    }

    static getAllWithTeam(year, team, page = 1) {
        return this.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=${TAG_ALBUM}$${year},${TAG_TEAM}$${team}&tag_mode=all&page=${page}` + PhotoService.parameters);
    }

    static getAllWithPerson(year, person, page = 1) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=${TAG_ALBUM}$${year}&tag_mode=all&page=${page}&text=${person}` + PhotoService.parameters);
    }

    static getAllWithText(text, page = 1) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&page=${page}&text=${text}%20and%20${TAG_ALBUM}$` + PhotoService.parameters);
    }

    static getPhotoInfo(id) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.getInfo&api_key=${api_key}&user_id=${user_id}&format=json&nojsoncallback=?&photo_id=${id}`);
    }

    static async getAll(link) {
        try {
            const response = await axios.get(link);
            return response;
        } catch (e) {
            console.log(e);
        }
    }
}