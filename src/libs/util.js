import axios from 'axios';
import env from '../config/env';

let util = {

};

util.getContractAddress = function () {
    return 'n1edJ8f9VTtF2wY2W1yNXix7HqYd2kFzKFC';
};

util.parse = function (data) {
    return JSON.parse(data);
};

util.title = function(title) {
    title = title ? title + ' - 宠物卡' : '宠物卡';
    window.document.title = title;
};

const ajaxUrl = env === 'development' ?
    'http://127.0.0.1:8888' :
    env === 'production' ?
    'https://www.url.com' :
    'https://debug.url.com';

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000
});

export default util;