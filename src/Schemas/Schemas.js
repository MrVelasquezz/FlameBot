const mongoose = require('mongoose')
const Schema = mongoose.Schema

const registerS = new Schema({
    serverId: {
        type: String,
        required: true,
        unique: true,
        validate: /[0-9]/g,
        minLength: 18,
        maxLength: 18
    },
    serverName: {
        type: String
    },
    admins: {
        type: Array,
        reqired: true
    },
    bans: {
        type: Array
    },
    playlists: {
        type: Array
    }
},{
    versionKey: false,
    timestamps: () => Date.now()
})

const register = mongoose.model('Reg', registerS)

module.exports = {
    register
}