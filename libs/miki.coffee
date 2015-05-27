redisModule = require('redis')
phantom=require 'phantom'
_ = require 'underscore'
cheerio = require 'cheerio'
fs = require 'fs'
moment = require 'moment'

schedules=[]
rooms=[]

redis={}
# For data provider and persist
class Miki
  constructor: (@config) ->

    # start redis client
    console.log "redis server: #{@config.redis_host}:#{@config.redis_port}"
    redis=redisModule.createClient(@config.redis_port,@config.redis_host)

    # load schedules from redis
    redis.lrange [@config.scheduleKey,0,-1],(err,replies)->
      for r in replies
        s= JSON.parse(r)
        schedules.push s


    ###
      generate schedule pic
    ###
    @generaterTimer=undefined

    @generater=()=>
      headlessUrl="http://#{@config.host}:#{@config.port}/#{@config.headless}"
      phantom.create (ph)->
        ph.createPage (page)->

          page.open headlessUrl,(status)->
            page.render('static_content/schedule.png')
            console.log "Output on "+ new Date()
            ph.exit()

  generatePic:()->
    clearTimeout @generaterTimer
    @generaterTimer= setTimeout(@generater,5000)




  # obsolete: new schedule structure with auto expire feature
  getSchedules:()->
    return schedules

  # obsolete: new schedule structure with auto expire feature
  setSchedule:(schedule)->
    found=false
    for i in [0...schedules.length]
      s=schedules[i]
      if s.order is schedule.order
        s.begin=schedule.begin
        s.end=schedule.end
        s.description=schedule.description

        found=true
        break

    schedules.push schedule if !found

    ret=[]
    redis.del @config.scheduleKey
    for i in [0...schedules.length]
      s=schedules[i]

      if s.begin.length is 0 and s.end.length is 0 and s.description.length is 0
      else
        s.order=i+1
        ret.push s

        # save to redis
        redis.rpush @config.scheduleKey,JSON.stringify(s)

    # trim and set list dirty
    redis.ltrim @config.scheduleKey,0,ret.length-1
    schedules=ret

    @generatePic()

    return schedules



  getRooms:()->
    return rooms

  updateRoom:(room)->
    # if _.any(rooms,(r)->r.room_id is room.room_id)
    roomExisted=_.find(rooms,(r)->r.room_id is room.room_id)
    if roomExisted?
      roomExisted.show_status=room.show_status
      roomExisted.room_name=room.room_name
      roomExisted.show_time=room.show_time
    else
      rooms.push room

  createRequestOptions:(url,host)->
    headers=
      'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      'Accept-Encoding':'gzip, deflate, sdch'
      'Accept-Language':'en-US,en;q=0.8'
      'Cache-Control':'no-cache'
      'Connection':'keep-alive'
      'Host':host
      'Pragma':'no-cache'
      'User-Agent':'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.2 Safari/537.36'

    options=
      url:url
      headers:headers
      gzip:true
      agent:false
      timeout:7000



    console.log "REQUEST: #{url}"

    return options

  parseProgramme:(text,template)->
    ret={
      type:'failed'
      year:template.year
      month:-1
      day:-1
      start:''
      end:''
      channel:''
      title:''
      episode:''
      members:''
    }

    match=text.match(/(\d+)月(\d+)日（\S）/)
    if match?
      ret.type='date'
      ret.month=match[1]
      ret.day=match[2]
      return ret

    match=text.match(/(\S+)～(\S+)\s(.*)\s『(.*)』(\s#\d+)?(\s.*)?/)
    if match?
      ret.month=template.month
      ret.day=template.day
      ret.type='programme'
      ret.start=match[1]
      ret.end=match[2]
      ret.channel=match[3]
      ret.title=match[4]
      ret.episode=(match[5]||'').trim()
      ret.members=(match[6]||'').trim()
      return ret

    return ret

    console.log "failed try parse: #{text}"

  parseSchedule:(article)->
    $= cheerio.load(article.description,{decodeEntities: false})
    text =  $('p').html().split('<br>')
    lastTemplate={}


    m=moment(article.pubdate)

    lastTemplate={
      year:m.year()
    }


    # dateBag={}
    dayCount=0
    schedule=[]
    for t in text
      break if dayCount is 2
      ret=@parseProgramme(t,lastTemplate)
      if ret.type is 'date'
        dayCount++
        lastTemplate=ret
      else if ret.type is 'programme'
        schedule.push ret
    return schedule

  getProgrammeKey:(programme)->
    key="programme:"
    key+=programme.month
    key+=":"
    key+=programme.day
    key+=":"
    key+=programme.start
    key+=":"
    key+=programme.title
    return key


  getExpireSeconds:(programme)->

    # delay 1hour for delete
    offset=3600

    # todo
    hour = programme.end.split(':')[1]
    if hour>=24
      hour-=24
      programme.month++

    if programme.month is 13
      programme.month=1

      # ...


    timeString="2015 #{programme.month} #{programme.day} #{programme.end} +0900"
    endMoment=moment(timeString,'YYYY MM DD HH mm Z')

    currentMoment=moment()
    countdown=endMoment.diff(currentMoment,'second')+offset

    return countdown


  updateSchedule:(article)->
    console.log "in updateSchedule"
    console.log article.pubdate
    schedule=@parseSchedule(article)
    fs.writeFileSync './out.json',JSON.stringify(schedule,null,2)
    return



    for p in schedule
      console.log JSON.stringify(p)
      key=@getProgrammeKey(p)
      countdown=@getExpireSeconds(p)

      console.log "key: #{key}"
      console.log "countdown: #{countdown}"
      redis.hmset "month",p
      redis.expire key,countdown












module.exports = Miki

