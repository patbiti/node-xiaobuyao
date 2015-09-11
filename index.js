var request = require('request');
var _ = require('lodash');
var config = require('./config/config.js');
var lineReader = require('line-reader');
var Table = require('cli-table');

var userTable = new Table({
    head: ['微博地址', 'uid', '昵称']
  , colWidths: [40, 30, 30]
});
var errorTable = new Table({
    head: ['微博地址', '错误']
  , colWidths: [50, 50]
});

var test =[], test1= [];

var requestFunc = function(line){
    var keyword;
    var isUUid = line.search(/(\d{10})/);
    if(isUUid > -1){
        keyword = line.substring(isUUid, isUUid + 10);
    }else{
        keyword = line.split('weibo.com/')[1].split('/')[0];
    }
    var type;
    if(/^\d{10}$/.test(keyword)){
        type = 'uid'
    }else{
        type = 'domain';
    }
    var params = {
        source: config.appkey,
        domain: keyword
    };
    var options = {
        url: config.urls[type].replace('${source}', params.source).replace('${value}', keyword),
        headers: config.headers
    }
    request(options, function (error, response, body) {
        if(response.body){
            var content = JSON.parse(response.body);
            if(content.id){
                userTable.push(line, content.id, content.screen_name);
            }else{
                errorTable.push([line, content.error])
            }
        }else{
            console.log('error:' + error);
        }
    })
}
_.forEach(config.data, function(file) {
    lineReader.eachLine(file, function(line) {
        requestFunc(line);
    }).then(function(){
        console.log(userTable.toString());
        // console.log(errorTable.toString());
    });
});
