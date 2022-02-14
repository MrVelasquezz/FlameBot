const ds = require('discord.js')
const dsv = require('@discordjs/voice')
const playDl = require('play-dl')
const EventEmitter = require('events')
const emitter = new EventEmitter()
require('dotenv').config()

const client = new ds.Client({
  intents: [ds.Intents.FLAGS.GUILDS, ds.Intents.FLAGS.GUILD_MESSAGES, ds.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ds.Intents.FLAGS.GUILD_VOICE_STATES
  ]
})

const {
  helpMsg,
  hiMsg,
  skipMsg,
  skipMsgE,
  queueMsg,
  queueMsgE,
  playingMsg,
  playingMsgE,
  videoError,
  ps,
  pp,
  up,
  vce,
  ivce
} = require('./src/messages/messages')

const m_key = '-'
global.queue = []

class Queue {
  constructor(data, track, i) {
    this.d = data
    this.t = track
    this.i = i
  }

  element() {
    return queue.find(item => item.serverId === this.d.guildId)
  }

  async edit() {
    if (this.d) {
      const element = this.element()
      if (element) {
        for (let a = 0; a <= this.i-1; a++) {
          element.queue.unshift(element.queue[0])
        }
        this.d.channel.send('Track ' + element.queue[0].name + ' will be repeated ' + this.i + ' times')
      }
    }
  }

  async create() {
    const element = this.element()
      if (this.d, this.t) {
        let vid
        try {
          vid = await playDl.video_info(this.t)
        } catch (e) {
          this.d.channel.send({
            embeds: [videoError]
          })
          console.log(e)
          return
        }
        if (element) {
          element.queue.push({
            track: this.t,
            name: vid.video_details.title,
            thumbnail: vid.video_details.thumbnails[0].url,
            duration: vid.video_details.durationRaw
          })
          this.d.channel.send('Track **' + vid.video_details.title + '** was added to queue')
        } else {
          queue.push({
            serverId: this.d.guildId,
            queue: [{
              track: this.t,
              name: vid.video_details.title,
              thumbnail: vid.video_details.thumbnails[0].url,
              duration: vid.video_details.durationRaw
            }]
          })
          audioDriver(this.d.member.voice.channel, this.d)
        }
      }
  }

  async destroy() {
    if (this.d) {
      const id = queue.findIndex(item => item.srverId === this.d.guildId)
      if (id) {
        queue.splice(id, 1)
      }
    }
  }
}

function next_track(item, mess) {
  const index = queue.findIndex(q => q.serverId === item.guildId)
  if (index !== -1) {
    queue[index].queue.shift()
    if (queue[index].queue.length === 0) {
      dsv.getVoiceConnection(item.guildId).disconnect()
      const c = new Queue(item)
      c.destroy()
    } else {
      audioDriver(item, mess)
    }
  } else {
    dsv.getVoiceConnection(item.guildId).disconnect()
  }
}

async function audioDriver(item, mess) {
  const que = queue.find(q => q.serverId === item.guildId)
  if(item.permissionsFor(item.guild.me).has('CONNECT') && item.permissionsFor(item.guild.me).has('SPEAK')){
    if (que) {
      const url = que.queue[0].track
      const vid_info = que.queue[0].name
      const stream = await playDl.stream(url)
      const player = dsv.createAudioPlayer()
      const audio_res = dsv.createAudioResource(stream.stream, {
        inputType: stream.type
      })
      const connection = dsv.joinVoiceChannel({
        channelId: item.id, //returns channel id, where i am
        guildId: item.guildId, // returns the guild id, where the channel is
        adapterCreator: item.guild.voiceAdapterCreator,
        selfMute: false,
        selfDeaf: false
      })
  
      player.play(audio_res)
      connection.subscribe(player)
  
      player.on('idle', () => {
        player.stop()
        next_track(item, mess)
      })
      player.on('playing', d => {
        if (d.status === 'buffering') {
          mess.channel.send({
            embeds: [playingMsg(mess)]
          })
          console.log('The player is playing now. ')
        }
      })
      player.on('error', e => {
        player.stop()
        console.error('Error occured! ' + e)
      })
      emitter.on('pause', () => {
        player.pause()
      })
      emitter.on('unpause', () => {
        player.unpause()
      })
      emitter.on('skip', () => {
        player.stop()
      })
    }
  }
  else{
    console.log('Not enough permissions')
  }
}

async function finderMessage(m, res, i, c) {
  i = parseInt(i)
  if (res && m && i !== false && !isNaN(i)) {
    const trackArr = function () {
      let arr = []
      let btnArr = []
      let s = 0
      for (let a = i; a <= i + 4; a++) {
        s++
        if (res[a]) {
          arr.push({
            name: '-',
            value: '```' + s + '. ' + res[a].title + ' ' + res[a].durationRaw + '```',
            inline: false
          })
          btnArr.push(new ds.MessageButton()
            .setCustomId(res[a].url)
            .setEmoji('🎶')
            .setLabel(s.toString())
            .setStyle('SUCCESS'))
        }
      }
      return [arr, btnArr]
    }

    const prewBtnO = {
      customId: JSON.stringify({
        pref: '-',
        data: c,
        index: i - 5
      }),
      emoji: '⬅️',
      style: 'PRIMARY'
    }

    const nextBtnO = {
      customId: JSON.stringify({
        pref: '+',
        data: c,
        index: i + 5
      }),
      emoji: '➡️',
      style: 'PRIMARY'
    }

    if (i <= 0) {
      prewBtnO.disabled = true
      prewBtnO.style = 'SECONDARY'
    } else if (i >= res.length - 5) {
      nextBtnO.disabled = true
      nextBtnO.style = 'SECONDARY'
    }

    const prewBtn = new ds.MessageButton(prewBtnO)
    const nextBtn = new ds.MessageButton(nextBtnO)

    const emptyBtn = (a) => {
      const d = new ds.MessageButton()
        .setLabel(' ')
        .setCustomId(a)
        .setStyle('SECONDARY')
        .setDisabled(true)
      return d
    }

    const selectTrack = new ds.MessageEmbed()
      .setTitle('**Select a track**')
      .setDescription('Select a track in the list below. You just need to click the button with the number of a track.')
      .setColor('RED')
      .setFields(trackArr()[0])

    const ytButtons = new ds.MessageActionRow()
      .addComponents(trackArr()[1]),
      controllButtons = new ds.MessageActionRow()
      .addComponents([prewBtn, emptyBtn('empty1'), emptyBtn('empty2'), emptyBtn('empty3'), nextBtn])

    return {
      embeds: [selectTrack],
      components: [ytButtons, controllButtons]
    }
  } else {
    return 'Error'
  }
}

async function responcer(data) {
  const res = await playDl.search(data, {
    limit: 20
  })
  return res
}

client.once('ready', () => {
  console.log('Bot started')
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: '-help | FlameBot',
      type: 'PLAYING'
    }]
  })
})

client.on('interactionCreate', async m => {

  if (m.isButton()) {

    try {

      if (m.member.voice.channel) {

        if (playDl.yt_validate(m.customId) === 'video' || playDl.yt_validate(m.customId) === 'playlist') {
          m.message.delete()
          const c = new Queue(m, m.customId)
          c.create()
        } 
        
        else {
          
          try {
            const data = JSON.parse(m.customId)
            m.update(await finderMessage(m, await responcer(data.data), data.index, data.data))
          } 
          catch (e) {
            console.log(e)
          }
        }
      } 
      
      else {
        //m.deferReply() //откладывает ответ и выводит сообщение FlameBot is thinking...
        setTimeout(() => {
          m.update({
            embeds: [ivce],
            components: []
          })
        }, 1000) // изменяет ответ, что выше
      }
    } 
    
    catch (e) {
      console.error(e)
    }

  }
})

client.on('messageCreate', async m => {
  let mess = m.content.trim()
  
  if (mess.length > 1 && mess.startsWith(m_key) && m.channel.permissionsFor(m.guild.me).has('SEND_MESSAGES')) {
    const s = mess.indexOf(' ')
    mess = mess.slice(1, mess.length)
    const command = function () {
      
      if (s === -1) {
        return mess.trim().toLowerCase()
      } 
      
      else {
        return mess.slice(0, s).trim().toLowerCase()
      }
    }
    const content = mess.slice(s, mess.length).trim()

    //start of command logic

    if (command() === 'play' && content.length > 0) {
      
      if (m.member.voice.channel) {
        
        try {
          
          if (playDl.yt_validate(content) === 'video' || playDl.yt_validate(content) === 'playlist') {
            m.delete()
            const c = new Queue(m, content)
            c.create()
          } 
          
          else if (playDl.yt_validate(content) === 'search') {
            m.reply(await finderMessage(m, await responcer(content), 0, content))
          }

        } 
        
        catch (e) {
          console.error(e)
        }

      } 
      
      else {
        m.reply({
          embeds: [vce]
        })
      }
    } 
    
    else if (command() === 'stop') {
      dsv.getVoiceConnection(m.guildId).disconnect()
      m.channel.send({
        embeds: [ps]
      })
    } 
    
    else if (command() === 'pause') {
      emitter.emit('pause')
      m.channel.send({
        embeds: [pp(m)]
      })
    } 
    
    else if (command() === 'unpause') {
      emitter.emit('unpause')
      m.channel.send({
        embeds: [up(m)]
      })
    } 
    
    else if (command() === 'playing') {
      const now = queue.find(item => item.serverId === m.guildId)
      
      if (typeof now !== 'undefined') {
        m.channel.send({
          embeds: [playingMsg(m)]
        })
      } 
      
      else {
        m.channel.send({
          embeds: [playingMsgE]
        })
      }
    } 
    
    else if (command() === 'queue') {
      const servQueue = queue.find(item => item.serverId === m.guildId)
      
      if (typeof servQueue !== 'undefined' && servQueue.queue.length > 0) {
        m.channel.send({
          embeds: [queueMsg(m)]
        })
      } 
      
      else {
        m.channel.send({
          embeds: [queueMsgE]
        })
      }
    } 
    
    else if (command() === 'help') {
      m.channel.send({
        embeds: [helpMsg]
      })
    } 
    
    else if (command() === 'skip') {
      const n = queue.find(item => item.serverId === m.guildId)
      
      if (n) {
        m.channel.send({
          embeds: [skipMsg(n.queue[0].name)]
        })
        emitter.emit('skip')
      } 
      
      else {
        m.channel.send({
          embeds: [skipMsgE]
        })
      }
    } 
    
    else if (command() === 'again') {
      if (!content) {
        const e = new Queue(m, null, 1)
        e.edit()
      } 
      
      else {
        const count = parseInt(content)
        
        
        if (typeof count === 'number' && !isNaN(count)) {
          const e = new Queue(m, null, count)
          e.edit()
        }

      }
    }

    //end of command logic

  } 
  
  else if (!m.channel.permissionsFor(m.guild.me).has('SEND_MESSAGES')) {
    console.log('Missing permissions.' + m.channel.permissionsFor(m.guild.me))
  }

})

client.on('voiceStateUpdate', (oldState, newState) => {
  
  if (oldState.channel !== null) {
    
    if (oldState.channel.members.size === 1 && oldState.channel.members.has('939294433852145725')) {
      console.log(oldState.guild.id)
      dsv.getVoiceConnection(oldState.guild.id).disconnect()
      const d = new Queue(oldState.channel)
      d.destroy()
    }
    
    if (!oldState.channel.members.has('939294433852145725')) {
      const d = new Queue(oldState.channel)
      d.destroy()
    }

  }
})

client.on('guildCreate', g => {
  
  if (g.systemChannel.permissionsFor(g.me).has('SEND_MESSAGES')) {
    g.systemChannel.send({
      embeds: [hiMsg]
    })
  }
  
})

client.login(process.env.TOKEN)