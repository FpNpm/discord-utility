const crypto = require('crypto');
const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya', 'hai', 'si', 'sí', 'oui', 'はい', 'correct'];
const no = ['no', 'n', 'nah', 'nope', 'nop', 'iie', 'いいえ', 'non', 'fuck off'];
const Discord = require("discord.js");
const mongoose = require("mongoose");
const figlet = require("figlet");

module.exports = class DiscordUtility {

    /**
     * Delay a process by "time" milliseconds
     * @param {Number} time - Time must be in milliseconds
     * @returns Promise
     */

    static delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    /**
     * Trims a string to get a specified length of string.
     * @param {String} text String to shorten
     * @param {Number} maxLen (Optional) Maximum length of String to return. Default: 2000
     * @returns Trimmed String
     */

    static shorten(text, maxLen = 2000) {
        return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
    }

    /**
     * Generates a random number between two specified numbers.
     * @param {Number} min Minimum number range
     * @param {Number} max Maximum Number range
     * @returns Generated Number
     */

    static randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Trim an array to the specified length.
     * By default, trims and returns first 10 elements of the array.
     * @param {Array} array Array to trim
     * @param {Number} maxLen (Optional) Maximum length of array to trim. Default: 10 (Will return first 10 elements from array)
     * @returns Trimmed Array
     */

    static trimArray(array, maxLen = 10) {
        if (array.length > maxLen) {
            const len = array.length - maxLen;
            array = array.slice(0, maxLen);
            array.push(`${len} more...`);
        }
        return array;
    }

    /**
     * Shuffles an array.
     * @param {Array} array Array to shuffle elements in.
     * @returns Shuffled Array
     */

    static shuffleArray(array) {
        const arr = array.slice(0);
        for (let i = arr.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    /**
     * Returns array without any duplicate values.
     * @param {Array} array Array of duplicate elements
     * @returns Array without duplicates
     */

    static removeDuplicates(array) {
        return [...new Set(array)];
    }

    /**
     * Make a list of elements of an array.
     * @param {Array} array Array of elements
     * @param {String} conj (Optional) Conjuction to join the last two elements of array. Default: "and"
     * @returns List of array elements
     */

    static list(array, conj = 'and') {
        const len = array.length;
        if (len === 0) return '';
        if (len === 1) return arr[0];
        return `${array.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${array.slice(-1)}`;
    }

    /**
     * Sort elements of an array by name.
     * @param {Array} arr Array to sort elements of.
     * @returns Sorted Array
     */

    static sortByName(arr) {
        return arr.sort((a, b) => {
            return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
        });
    }

    /**
     * Make first letter of words capital.
     * @param {String} text String to capitalise from
     * @param {String} split (Optional) Split the String to get first word to capitalise.
     * @returns Capitalised String
     */

    static firstUpperCase(text, split = ' ') {
        return text.split(split).map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
    }

    /**
     * Format a number in 2 digits.
     * @param {Number} number The number to format
     * @param {Number} minimumFractionDigits (Optional) Minimum fraction digits. Default: 0
     * @returns Formatted Number
     */

    static formatNumber(number, minimumFractionDigits = 0) {
        return Number.parseFloat(number).toLocaleString(undefined, {
            minimumFractionDigits,
            maximumFractionDigits: 2
        });
    }

    /**
     * Encode String to binary or Decode binary to normal string.
     * @param {String} text String to encode/decode
     * @param {String} mode (Optional) Mode of action. Either 'encode' or 'decode'. Default: 'encode'
     * @returns Encoded/Decoded String
     */

    static base64(text, mode = 'encode') {
        if (mode === 'encode') return Buffer.from(text).toString('base64');
        if (mode === 'decode') return Buffer.from(text, 'base64').toString('utf8') || null;
        throw new TypeError(`${mode} is not a supported base64 mode.`);
    }

    /**
     * Generate Hash codes of a string
     * @param {String} text String to transform into hash
     * @param {String} algorithm Type of algorithm. Example: 'md5', 'sha224', 'sha2', 'sha256', etc.
     * @returns Generaged hash of the provided String
     */

    static createHash(text, algorithm) {
        return crypto.createHash(algorithm).update(text).digest('hex');
    }

    /**
     * Make a text-based cerification.
     * @param {Discord.Channel} channel 
     * @param {Discord.User} user 
     * @param {Object} options (Optional) { time: The time for verification to last (in milliseconds) }
     * @returns Boolean? Whether verification was "yes" (true) or "no" (false)
     */

    static async verify(channel, user, { time = 30000, extraYes = [], extraNo = [] } = {}) {
        const filter = res => {
            const value = res.content.toLowerCase();
            return (user ? res.author.id === user.id : true)
                && (yes.includes(value) || no.includes(value) || extraYes.includes(value) || extraNo.includes(value));
        };
        const verify = await channel.awaitMessages(filter, {
            max: 1,
            time
        });
        if (!verify.size) return 0;
        const choice = verify.first().content.toLowerCase();
        if (yes.includes(choice) || extraYes.includes(choice)) return true;
        if (no.includes(choice) || extraNo.includes(choice)) return false;
        return false;
    }

    /**
     * React to a message if the bot is able to.
     * @param {Discord.Message} message Message to react on.
     * @param {Discord.ClientUser} user Discord client user.
     * @param {String} emoji Emoji to react with
     * @param {String} fallbackEmoji (Optional) If reaction fails with custom emoji, use this emoji instead. Default: ✅
     * @returns Promise<MessageReaction>
     */

    static async reactMessage(message, user, emoji, fallbackEmoji = "✅") {
        const dm = !message.guild;
        if (fallbackEmoji && (!dm && !message.channel.permissionsFor(user).has('USE_EXTERNAL_EMOJIS'))) {
            emoji = fallbackEmoji;
        }
        if (dm || message.channel.permissionsFor(user).has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) {
            try {
                await message.react(emoji);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Create a queue to join. Can be for playing games or for events
     * @param {Discord.Message} msg Discord.Message
     * @param {String} join Message that will be used for joining the queue. For example: "join game"
     * @param {String} emoji Emoji that will be used to react on msgs when user types "join game" and is accepted in queue.
     * @param {Number} max Maximum amount of players that can join
     * @param {Number} min (Optional) Minimum amount of players required in queue. Default: 1
     * @returns Array of user IDs who joined the queue.
     */

    static async awaitPlayers(msg, join, emoji, max, min = 1) {
        if (max === 1) return [msg.author.id];
        await msg.channel.send(
            `You will need at least ${min - 1} more player(s) (at max ${max - 1}). To join, type \`${join}\`.`
        );
        const joined = [];
        joined.push(msg.author.id);
        const filter = res => {
            if (res.author.bot) return false;
            if (joined.includes(res.author.id)) return false;
            if (res.content.toLowerCase() !== join) return false;
            joined.push(res.author.id);
            Util.reactIfAble(res, res.author, emoji, '✅');
            return true;
        };
        const verify = await msg.channel.awaitMessages(filter, { max: max - 1, time: 60000 });
        verify.set(msg.id, msg);
        if (verify.size < min) return false;
        return verify.map(player => player.author.id);
    }

    /**
     * Convert Bytes into KB/MB/GB/TB...
     * @param {Number} bytes Bytes to format into KB/MB/Gb...
     * @returns Formatted String of bytes
     */

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    }

    /**
     * Create a reaction based verification
     * @param {Discord.Message} message Discord message to create verification on
     * @param {Discord.User} author Author of message OR user who is alowed to verify using emoji
     * @param {Number} time Duration the verification will last for IN SECONDS
     * @param {Array} validReactions Array of emoji that will be reacted on message for verification
     * @returns String of Reacted emoji
     */

    static async promptMessage(message, author, time, validReactions) {
        time *= 1000;
        for (const reaction of validReactions) await message.react(reaction);
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;
        return message
            .awaitReactions(filter, { max: 1, time: time })
            .then(collected => collected.first() && collected.first().emoji.name);
    }

    /**
     * Fetch a member from the guild.
     * @param {Discord.Message} message Discord message
     * @param {String} toFind The username/displayname/usertag/user mention you are searching for
     * @returns Discord.GuildMember
     */

    static getMember(message, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = message.guild.members.cache.get(toFind);
        if (!target && message.mentions.members)
            target = message.mentions.members.first();
        if (!target && toFind) {
            target = message.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                    member.user.tag.toLowerCase().includes(toFind)
            });
        }
        if (!target)
            target = message.member;
        return target;
    }

    /**
     * 
     * @param {Discord.Client} client Your bot client
     * @param {Discord.Message} message Discord.Message
     * @param {String} toFind The username/usertag/user mention you are searching for
     * @returns Discord.User
     */

    static getUser(client, message, toFind = '') {
        toFind = toFind.toLowerCase();
        let target = client.users.cache.get(toFind);
        if (!target && message.mentions.users)
            target = message.mentions.users.first();
        if (!target && toFind) {
            target = client.users.cache.find(member => {
                return member.username.toLowerCase().includes(toFind) ||
                    member.tag.toLowerCase().includes(toFind)
            });
        }
        if (!target)
            target = message.author;
        return target;
    }

    /**
     * Generate a random "length" letters long ID
     * @param {Number} length Length of ID that should be created. Default: 4
     * @returns String of generated ID
     */

    static createId(length = 4) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * Generate Roman form of the given number
     * @param {Number} num The number to convert in roman
     * @returns Roman number string of provided number
     */

    static generateRoman(num) {
        const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let roman = '';
        let i;
        for (i in lookup) {
            while (num >= lookup[i]) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    }

    /**
     * Generate Arabic Number from Roman numbers
     * @param {String} roman Roman number to convert in normal numeral digits
     * @returns Number
     */

    static generateNumeral(roman) {
        roman = roman.toUpperCase();
        const lookup = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        let arabic = 0;
        let i = roman.length;
        while (i--) {
            if (lookup[roman[i]] < lookup[roman[i + 1]]) {
                arabic -= lookup[roman[i]];
            }
            else {
                arabic += lookup[roman[i]];
            }
        }
        return arabic;
    }

    /**
     * Convert normal texts into Figlet Texts
     * @param {Discord.Message} message Discord.Message
     * @param {String} string String to convert into figlet text
     * @returns Converted String
     */

    static figlet(message, string) {
        let maxLen = 12;
        if (string.length > maxLen) return message.reply("Only 12 characters are admitted!");
        figlet(`${string}`, function (err, data) {
            if (err) {
                return false;
            }
            return data;
        });
    }

    /**
     * Format your discord client's uptime in Days Hours Minutes Seconds
     * @param {Number} uptime Discord.Client.uptime
     * @returns Uptime String as days, hours, minutes and seconds
     */

    static uptime(uptime) {
        let totalSeconds = (uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 60 / 60 % 24);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        return `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━▲━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  ━━━━━━━━━━━━━━━━━━ MONGOOSE FUNCTION ━━━━━━━━━━━━━━━━━━
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━━━━━━━━━━━━



    /**
     * Connect to your MongoDB database/Cluster
     * @param {String} url Your MongoDB Connection URI
     * @returns Promise Connection to your MongoDB database
     */

    static mongoConnect(url) {
        return mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     * Search for a specific database in MongoDB
     * @param {mongoose.Schema} schema mongoose.Schema to search in
     * @param {Object} options Object to search schema for.
     * @returns Data
     */

    static async mongoFind(schema, options) {
        let data = await schema.findOne(options).catch(e => {
            throw new TypeError("Something went wrong:", e)
        })
        if (!data) return false;
        return data;
    }

    /**
     * Save a collection in database of MongoDB
     * @param {mongoose.Collection} data data you want to save
     * @returns Boolean? true if data was saved else false if there were errors
     */

    static async mongoSave(data) {
        try {
            await data.save().catch(e => {
                throw new TypeError("Something went wrong:", e)
            })
        } catch (error) {
            throw new TypeError("Something went wrong:", error)
        }
        return true;
    }

    /**
     * Update a collection in your MongoDB database.
     * @param {mongoose.Schema} schema Your schema to uodate the data in.
     * @param {Object} options Search collection options
     * @param {String} key Object key to change. Must be a String
     * @param {Any} value Key vaue to declare
     * @returns Boolean true if success, false if failed
     */

    static async mongoUpdate(schema, options, key, value) {
        try {
            await schema.updateOne({ options }, { "$set": { key: value } }).catch(e => {
                throw new TypeError("Something went wrong:", e)
            })
        } catch (error) {
            throw new TypeError("Something wet wrong:", error)
        }
        return true;
    }

    /**
     * Delete a database collection from a MongoDB database.
     * @param {mongoose.Collection} data Collection to delete
     * @returns Boolean true if success, false if failed
     */

    static async mongoDelete(data) {
        try {
            await data.delete().catch(e => {
                throw new TypeError("Something went wrong:", e)
            })
        } catch (error) {
            throw new TypeError("Something wet wrong:", error)
        }
        return true;
    }

    /**
     * Create a new Collection in your MongoDB database
     * @param {mongoose.Schema} schema Your schema to create a new collection in
     * @param {Object} options Options to save data which are not set default in Schema
     * @returns Boolean true if success, false if failed
     */

    static async mongoCreate(schema, options) {
        try {
            let newSchema = new schema(options);
            await newSchema.save().catch(e => {
                throw new TypeError("Something went wrong:", e)
            })
        } catch(error) {
            throw new TypeError("Something wet wrong:", error)
        }
        return true;
    }
}