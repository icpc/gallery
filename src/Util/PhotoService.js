import {api_key, PER_PAGE, user_id} from "../consts";
import axios from "axios";

export default class PhotoService {
    static getAllWithEvent(year, event = "Photo%20Tour", page = 1) {
        return this.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=event$${event},Album$${year}&tag_mode=all&per_page=${PER_PAGE}&extras=tags,url_m,url_c,url_l,url_o,description&format=json&nojsoncallback=?&page=${page}`);
    }

    static getAllWithTeam(year, team, page = 1) {
        return this.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=Album$${year},team$${team}&tag_mode=all&per_page=${PER_PAGE}&extras=tags,url_m,url_c,url_l,url_o,description&format=json&nojsoncallback=?&page=${page}`);
    }


    static getAllWithPerson(year, person, page = 1) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=Album$${year}&tag_mode=all&per_page=${PER_PAGE}&extras=tags,url_m,url_c,url_l,url_o,description&format=json&nojsoncallback=?&page=${page}&text=${person}`);
    }

    static getAllWithText(text, page = 1) {
        return PhotoService.getAll(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&per_page=${PER_PAGE}&extras=tags,url_m,url_c,url_l,url_o,description&format=json&nojsoncallback=?&page=${page}&text=${text}%20and%20Album$`);
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