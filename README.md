# myslackbot

## deploy to heroku

```txt
heroku plugins:install heroku-container-registry
heroku container:login
git clone https://github.com/kjunichi/myslackbot.git
heroku create
heroku container:push web
```

### if you already have Heroku app

```txt
heroku plugins:install heroku-container-registry
heroku container:login
git clone https://github.com/kjunichi/myslackbot.git
heroku container:push web -a HerokuAppName
```

### Set up Enviroment values

- CALENDAR_SECRET
- CALENDAR_TOKEN
- SLACK_TOKEN

## Bot commands

### Is it fine today?(only you are in Tokyo area)

```txt
雨どう
```

```txt
天気どう
```

```txt
明日の天気どう
```

### check my schedule

```txt
明日の予定
```

## Urls

- /amesh
- /
