#tentoumu-chu
A website for checkout/manage 48-group TV programme schedule.An online version you can found on [live.sashi.co](http://live.sashi.co). And also there is a browser extension  [miichan](https://github.com/larvata/miichan) powered by this service.


## requirements

- nodejs
- redis

## deploy your own service

```
npm install

# copy config from example
cp tentoumu-chu.example.cson tentoumu-chu.cson

# modify the configuration to fit your environment
vi tentoumu-chu.cson

# rename the manage page you defined in tentoumu-chu.cson:managePath
mv static_content/manage.html.example #{your_assert}

# start service
npm start
```
