import axios from 'axios';
import env from '../config/env';

let util = {

};

util.getContractAddress = function () {
    return 'n1rfhQ3bvVhEt8QLSqQbcU8PGxE4jfPotEU';
};

util.parse = function (data) {
    return JSON.parse(data);
};

util.toSting = function (data) {
    return JSON.stringify(data);
};

util.dateFmt = function (dateString) {
    let date = typeof dateString !== 'object' ? new Date(dateString) : dateString;
    const tmpDate = {
        year: date.getFullYear(),
        month: (date.getMonth() < 9) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
        day: (date.getDate() < 10) ? '0' + date.getDate() : date.getDate(),
        hour: (date.getHours() < 10) ? '0' + date.getHours() : date.getHours(),
        min: (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes(),
        sec: (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds()
    };
    return `${tmpDate.year}年${tmpDate.month}月${tmpDate.day}日`;
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

util.uploadImg = function (data) {
    return axios.post('https://sm.ms/api/upload', data);
};

export default util;