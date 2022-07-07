const socket = require('socket.io');
const formatMessage = require('../logic/message');
const chalk = require('chalk');
const { promisify } = require('util');
const { User, Room } = require('../models');
// const { getCurrentUser } = require('../logic/user');

//past messages that were stored in the database
const messages = {
  general: [],
  random: [],
  jokes: [],
  javascript: [],
};
const bot = 'DÜDLE Bot';
const users = {};

let userid = "";

const createWSEvents = async (io) => {
  io.on = promisify(io.on);
  try {
    //this runs when the user connects to the server
    io.on('connection', (socket) => {
      console.log(chalk.green('CONNECTED TO SOCKET!!! SOCKET ID:', socket.id));
      socket.emit('message', formatMessage(bot, `Welcome to DÜDL!`));

      socket.on('joinRoom', ({ room_name, join_username }) => {
        // this console log never shows?
        console.log(room_name, join_username);
        userid = join_username;
        // const newUser = userJoin(username, room, socket.id )
        socket.join(room_name); // needs a unique identifier for the rooom

        //broadcast to all users except for the actual user that joined that a new user has joined/ still not showing right now
        socket.broadcast
          .to(room_name)
          .emit('message', formatMessage(bot, `A user has joined the chat!`));
      });

      //this runs when the user sends a message
      socket.on('Chat Message', async (message) => {
        console.log(chalk.blue(`Message Received: ${message}`));

        socket.broadcast.emit(
          'message',
          formatMessage((userid, message))
        );
      });
    //   socket.on('SEND_MESSAGE', function(data){
    //     //Let every user know of the new message
    //     io.emit('RECEIVE_MESSAGE', data);
    // });
      //this runs when the user disconnects from the server
      socket.on('disconnect', () => {
        //broadcasting the user to all other users. letting them know that a user has left and there's only that many users left
        io.emit('message', 'A user has left the room');
      });
    });
  } catch (err) {
    console.log(
      chalk.redBright(`🚨🚨🚨 SOMETHING WENT WRONG 🚨🚨🚨`, JSON.stringify(err))
    );
  }
};
const initSocket = (server) => {
  const io = socket(server);
  createWSEvents(io);
};

module.exports = initSocket;
