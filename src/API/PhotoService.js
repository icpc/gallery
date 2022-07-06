import {api_key, user_id} from "../consts";
import axios from "axios";

export default class PhotoService {
    static async getAllWithEvent(year, event = "Photo%20Tour", page = 1) {
        try {
            const response = await axios.get(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=event$${event},Album$${year}&tag_mode=all&per_page=10&extras=tags,url_m,url_c,url_l,url_o,description&format=json&nojsoncallback=?&page=${page}`);
            console.log(response.data);
            return response;
        } catch (e) {
            console.log(e);
        }
    }

    static async getAllWithTeam(year, event, team, person, page = 1) {
        try {
            const response = await axios.get(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=Album$${year}&tag_mode=all&per_page=10&extras=tags,url_m,url_c,url_l,url_o,description&format=json&nojsoncallback=?&page=${page}`);
            console.log(response.data);
            return response;
        } catch (e) {
            console.log(e);
        }
    }


    static async getAllWithPerson(year, event, team, person, page = 1) {
        try {
            const response = await axios.get(`https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${api_key}&user_id=${user_id}&tags=Album$${year}&tag_mode=all&per_page=10&extras=tags,url_m,url_c,url_l,url_o,description&format=json&nojsoncallback=?&page=${page}`);
            console.log(response.data);
            return response;
        } catch (e) {
            console.log(e);
        }
    }
}