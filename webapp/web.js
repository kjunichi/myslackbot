"use strict";

const express = require("express");
const multer  = require('multer');
const upload = multer({dest: './uploads/'});
const logfmt = require("logfmt");
const ameshUtil = require('amesh-cli');
const libcalendar = require('./libcalendar.js');
const fs = require('fs');

var app = express();
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/amesh', function(req, res) {
  console.dir(ameshUtil.getAmeshImageUrl())
  ameshUtil.getImage((img)=>{
    const now = new Date()
    const formatted = now.toFormat("YYYYMMDDHH24")
    const mm5 = ("0" + (((now.toFormat("MI")-5) / 5) | 0) * 5).slice(-2)
    console.log("TIME = "+formatted + mm5)
    res.type('png')
    res.send(img)
  })
});

app.get('/ldd', function(req, res) {
  //var cmd = "ldd /app/user/node_modules/amesh-cli/node_modules/canvas/build/Release/canvas.node";
  var cmd = "find /opt/webapp -name canvas.node;ls /opt/webapp/node_modules/amesh-cli/node_modules/ansi-canvas/node_modules/canvas/;ldd /opt/webapp/node_modules/canvas/build/Release/obj.target/canvas.node";
  function shspawn(command) {
    return spawn('sh', ['-c', command]);
  }
  var child = shspawn(cmd);
  var buf="";

  child.stdout.on('data',function(data){
    buf=buf+data;
  });
  child.stderr.on('data',function (data){
    console.log('exec error: '+data);
  });

  child.on('close',function(code) {
    // コマンド実行後の処理
    // codeでコマンドの実行の成否が確認できる。
    // この時点でbufに正常時はコマンドの出力結果が入っている。
    //console.dir(buf);
      res.send(buf)
  });
});

app.get('/command', function(req, res) {
  switch (req.query.a) {
	  case "version":
		  res.send(process.versions);
		  break;
    case "set":
        res.send(success);
      break;
    case "get":
          res.send("N/A");
      break;
    case "stats":
          res.send("Error");
      break;
    case "delete":
        res.send(success);
      break;
    case "botkick":
        //controller.spawn({
        //   adapter
        //}).startRTM(function(err) {
        //   if (err) {
        //      throw new Error(err);
        //   }
        //});

        res.send("Bot kicked");
    default:
      res.send("");
  }
});

app.post('/upload',upload.array('images', 8),(req, res) => {
  console.dir(req.files);
  const tmp_path = req.files[0].path;
  const target_path = './public/' + req.files[0].originalname;

  fs.rename(tmp_path, target_path, (err) => {
    if (err) {
      throw err;
    }
    fs.unlink(tmp_path, () => {
      if (err) {
        throw err;
      }
      res.send('File uploaded to: ' + target_path + ' - ' + req.files[0].size + ' bytes');
    });
  });

});

//var port = Number(process.env.PORT || 5000);
//app.listen(port, function() {
//  console.log("Listening on " + port);
//  console.dir(process.env);
//});

var spawn = require('child_process').spawn;
const {Botkit} = require('botkit');
const { SlackAdapter} = require('botbuilder-adapter-slack');

var SLACK_TOKEN = process.env.SLACK_TOKEN2||(require("./secret.json")).SLACK_TOKEN2;
const SLACK_SECRET = process.env.SLACK_SECRET||(require("./secret.json")).SLACK_SECRET;

if (!SLACK_TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}
let adapter = new SlackAdapter({clientSigningSecret:SLACK_SECRET,debug: false,log: true,botToken:SLACK_TOKEN});
let controller = new Botkit({
 adapter: adapter
});

//controller.spawn({
//  token:SLACK_TOKEN
//}).startRTM(function(err) {
//  if (err) {
//    throw new Error(err);
//  }
//});

controller.hears(['hello','hi'],['direct_message','direct_mention','mention','message'],async(bot,message)=> {
    await bot.reply(message,"Hello.");
})

controller.hears(['おーい','誰か','だれか'],'message',async (bot,message) =>{
    await bot.reply(message,"Hello.");
});

controller.hears(['明日の天気どう'],'message',async (bot,message) =>{
    var cmd = "curl --stderr /dev/null http://weather.livedoor.com/forecast/webservice/json/v1?city=130010|jq .forecasts[1]";
    function shspawn(command) {
      return spawn('sh', ['-c', command]);
    }
    var child = shspawn(cmd);
    var buf="";

    child.stdout.on('data',function(data){
      buf=buf+data;
    });
    child.stderr.on('data',function (data){
      console.log('exec error: '+data);
    });

    child.on('close',async (code) =>{
      // コマンド実行後の処理
      // codeでコマンドの実行の成否が確認できる。
      // この時点でbufに正常時はコマンドの出力結果が入っている。
      //console.dir(buf);
        await bot.reply(message,buf);
    });
});

controller.hears(['雨どう'],'message',async (bot,message) =>{
  await bot.reply(message,"http://wsproxy-slide.herokuapp.com/amesh?"+(new Date()).getTime());
});

controller.hears(['予定'],'message',async (bot,message) =>{
  libcalendar.getOurEvents(async(b)=>{
    var a = "";
    for(var i = 0; i < b.length; i++) {
      a = a + b[i]+"\n";
    }
    await bot.reply(message,a);
  });

});

controller.hears(['天気どう'],'message',async (bot,message)=> {
    var cmd = "curl --stderr /dev/null http://weather.livedoor.com/forecast/webservice/json/v1?city=130010|jq .forecasts[0]";
    function shspawn(command) {
      return spawn('sh', ['-c', command]);
    }
    var child = shspawn(cmd);
    var buf="";

    child.stdout.on('data',function(data){
      buf=buf+data;
    });
    child.stderr.on('data',function (data){
      console.log('exec error: '+data);
    });

    child.on('close',async (code) =>{
      // コマンド実行後の処理
      // codeでコマンドの実行の成否が確認できる。
      // この時点でbufに正常時はコマンドの出力結果が入っている。
      //console.dir(buf);
      let items = [];
      const tenkijson = JSON.parse(buf);
      let tenki = {
	        title: tenkijson.telop,
	        color: '#FFCC99',
	        fields: [],
	      };
       tenki.fields.push({
	           label: 'Temp',
	           value: tenkijson.temperature,
	           short: false,
	         });
       tenki.fields.push({
	                          label: 'image',
	                          value: tenkijson.image.url,
	                          short: false,
	                        });
      items.push(tenki);
      console.log(items);
      await  bot.reply(message,{text: buf,
		attachments: items},
		function(err,resp) {
			    console.log(err,resp);
	      });
    });
});

controller.hears(['attach'],'direct_message,direct_mention',async (bot,message) =>{

  var attachments = [];
  var attachment = {
    title: 'This is an attachment',
    color: '#FFCC99',
    fields: [],
  }

  attachment.fields.push({
    label: 'Field',
    value: 'A longish value',
    short: false,
  })

  attachment.fields.push({
    label: 'Field',
    value: 'Value',
    short: true,
  })

  attachment.fields.push({
    label: 'Field',
    value: 'Value',
    short: true,
  })

  attachments.push(attachment);

  await bot.reply(message,{
    text: 'See below...',
    attachments: attachments,
  },(err,resp) =>{
    console.log(err,resp);
  });
});

controller.hears(['dm me'],'direct_message,direct_mention',async (bot,message) =>{
  bot.startConversation(message,function(err,convo) {
    convo.say('Heard ya');
  });

  bot.startPrivateConversation(message,function(err,dm) {
    dm.say('Private reply!');
  })

});


controller.webserver.get('/amesh', (req, res) => {
  console.log(ameshUtil.getAmeshImageUrl())
  try {
      ameshUtil.getImage((img)=>{
          const now = new Date()
        const formatted = now.toFormat("YYYYMMDDHH24")
			            const mm5 = ("0" + (((now.toFormat("MI")-5) / 5) | 0) * 5).slice(-2)
			            console.log("TIME = "+formatted + mm5)
			            res.type('png')
			            res.send(img)
			          })
  } catch(e) {
    console.log(e);
  }
})
