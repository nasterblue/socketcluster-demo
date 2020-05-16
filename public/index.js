

const totalChannels = 1000;
const userId = faker.random.uuid();
const userName = faker.fake("{{name.lastName}} {{name.suffix}}");

// Initiate the connection to the server
const socket = socketClusterClient.create({
  hostname: 'localhost',
  port: 8000
});
const chanels = [];
let idx = 0;
do {
  idx = idx + 1;
  chanels.push(`BSS-CHANNEL-${idx}`);
} while (idx < totalChannels);
const socketChannels = [];


async function initError() {
  for await (let { error } of socket.listener('error')) {
    console.error(error);
  }
}

async function initConnect() {
  for await (let event of socket.listener('connect')) {
    console.log('Socket is connected');
  }
}

async function generateChannels() {
  for (let i of chanels) {
    let myChannel = socket.channel(i);
    await myChannel.subscribe();
    await myChannel.listener('subscribe');
    socketChannels.push(myChannel);
  }
  return socketChannels;
}


async function subscribeAChannel(myChannel) {
  // myChannel.state is now 'subscribed'.
  for await (let data of myChannel) {
    $('#chat-body').append(`
            <tr>
              <td>${data.channel}</td>
              <td>${data.userName}</td>
              <td>${data.message}</td>
              <td>${data.time}</td>
            </tr>
    `)
    //          console.log({data});
  }
  return myChannel;
}
async function transmitPublishToAChannel(myChannel) {
  const message = faker.lorem.sentence();
  await myChannel.transmitPublish({
    userId: userId,
    userName: userName,
    channel: myChannel.name,
    message: message,
    time: new Date().toString()
  });
  return myChannel;
}


(async () => {
  this.initError();
  this.initConnect();
  const generateChannelsData = await this.generateChannels();
  for (let myChannel of generateChannelsData) {
    this.subscribeAChannel(myChannel);
    setInterval(() => {
      this.transmitPublishToAChannel(myChannel);
    }, Math.floor((Math.random() * 120) + 10) * 1000);
  }
})()


$("#username").text(`userName : ${userName} - total joined channels : ${totalChannels}`);
