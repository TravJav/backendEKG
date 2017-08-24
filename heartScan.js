
const _ = require('lodash');

const express = require('express'),
app = express(),
server = require('http').createServer(app);
var io = require('socket.io')(server);

// libs

const Ganglion = require('openbci-ganglion').Ganglion;
const ganglion = new  Ganglion();


server.listen(3001, ()=>{
  console.log('Listening For  Client Connection');
});

io.on('connection', socket=>{
  console.log("\n Client has connected to our server");
   ganglion.searchStart();
console.log("I have finished searching");
  });

/*================================================================================================================================================================================
=============================================================================================================================================================================================================================
This function will take in the RAW EEG, EMG, ECG data and send the Array with 4 objects inside ( Microvolts) to the 
read.js class 

=============================================================================================================================================================================================================================
==============================================================================================================================================================================*/
ganglion.once('ganglionFound', (peripheral) => {
// Stop searching for BLE devices once a ganglion is found.
ganglion.searchStop();


/*
Use throttle to control the sample rate

*/
ganglion.on('sample', _.throttle(sample => {
/** Work with sample */


const transferdata = [];
    for (let i = 0; i < ganglion.numberOfChannels(); i++) {
        GanglionObjects = sample.channelData[i].toFixed(8);
        transferdata.push(GanglionObjects);
       
    }

    pass_data(transferdata);    
  }, 200, {leading:true}))
    



ganglion.once('ready', () => {
  ganglion.streamStart();
  });

  ganglion.connect(peripheral);

});
 
/*
Function to actually pass the data from the socket to the front end react

*/
function pass_data(transferdata){


console.log("\n sending data: \n" + transferdata);
  io.emit("EKG", transferdata);

}

