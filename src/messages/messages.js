const ds = require('discord.js')

const helpCommands = {
    name: 'Commands:',
    value: '```-help - for help \n\n-play <url|song name> - to play music from YouTube \n\n-pause - to pause music \n\n-unpause - to continue playing \n\n-skip <number|all> \n\n-queue - to see, what is in queue \n\n-playing - to see, which track is playing now```'
}

const helpMsg = new ds.MessageEmbed()
    .setTitle('🎶Help for FlameBot🎶')
    .addFields([helpCommands])
    .setColor('GREEN')
    .setTimestamp(Date.now())
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/599/599502.png')
    .setFooter({
        text: 'FlameBot'
    })

const hiMsg = new ds.MessageEmbed()
    .setTitle('**📻FLAME MUSIC BOT📻**')
    .setColor('ORANGE')
    .setDescription('I am bot, which plays music. With the help of me, you can listen to music yourself or have a full-fledged **DISCORD-PARTYS**!\n ```Type help, to see more information```')
    .addFields([helpCommands])
    .setTimestamp(Date.now())
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/599/599502.png')
    .setFooter({
        text: 'FlameBot'
    })

const skipMsg = (n) => {
    return new ds.MessageEmbed()
        .addFields([{
                name: 'Track name',
                value: '```' + n.slice(0, 56) + '...```',
                inline: true
            },
            {
                name: 'Status',
                value: 'Skiped',
                inline: true
            }
        ])
        .setColor('BLUE')
        .setTimestamp(Date.now())
        .setFooter({
            text: 'FlameBot'
        })
}

const skipMsgE = new ds.MessageEmbed()
    .setTitle('Nothing is playing now.')
    .setColor('RED')
    .setTimestamp(Date.now())
    .setFooter({
        text: 'FlameBot'
    })

const queueMsg = (m) => {
    const q = queue.find(item => item.serverId === m.guildId)
    q.queue.splice(0, 1)
    const text = () => {
        let text = '',
            i = 0
        q.queue.forEach(item => {
            i++
            text += `**${i}.** ${item.name} ${item.duration} \n\n`
        });
        return text
    }

    return new ds.MessageEmbed()
        .setTitle('Now in queue are:')
        .setDescription(text())
        .setColor('GREEN')
        .setTimestamp(Date.now())
        .setFooter({
            text: 'FlameBot'
        })
}

const queueMsgE = new ds.MessageEmbed()
    .setColor('RED')
    .setTitle('Queue is empty.')
    .setTimestamp(Date.now())
    .setFooter({
        text: 'FlameBot'
    })

const playingMsg = (m) => {
    const q = queue.find(item => item.serverId === m.guildId)
    console.log(q.queue)

    return new ds.MessageEmbed()
        .setColor('GREEN')
        .addField('Now is playing:',
            `${q.queue[0].name} ${q.queue[0].duration}`)
        .setTimestamp(Date.now())
        .setThumbnail(q.queue[0].thumbnail)
        .setFooter({
            text: 'FlameBot'
        })
}

const playingMsgE = new ds.MessageEmbed()
    .setColor('RED')
    .setTitle('Nothing is playing now.')
    .setTimestamp(Date.now())
    .setFooter({
        text: 'FlameBot'
    })


module.exports = {
    helpMsg,
    hiMsg,
    skipMsg,
    skipMsgE,
    queueMsg,
    queueMsgE,
    playingMsg,
    playingMsgE
}