import React, { useState } from 'react';

import {CopyToClipboard} from 'react-copy-to-clipboard';
import { withFirebase } from '../Firebase';
import Paywall from '../Paywall';
import SecureStorage from 'secure-web-storage';

import ReactGA from 'react-ga';
require('dotenv').config()

var CryptoJS = require("crypto-js");
var SECRET_KEY = process.env.REACT_APP_KEY;
var secureStorage = new SecureStorage(localStorage, {
    hash: function hash(key) {
        key = CryptoJS.SHA256(key, SECRET_KEY);
 
        return key.toString();
    },
    encrypt: function encrypt(data) {
        data = CryptoJS.AES.encrypt(data, SECRET_KEY);
 
        data = data.toString();
 
        return data;
    },
    decrypt: function decrypt(data) {
        data = CryptoJS.AES.decrypt(data, SECRET_KEY);
 
        data = data.toString(CryptoJS.enc.Utf8);
 
        return data;
    }
});

function Jutsu(props) {
  React.useEffect(() => {
      
  });

  var link = "https://meet.jit.si/" + props.roomName;

  return (
    <iframe src={link} allow="microphone; camera" title="Video Call" width={props.width} height={props.height}>

    </iframe> 
  );
}

function Vidcall(props)  {
  function isTimeUp() {
    
    const usr = secureStorage.getItem('authUser');
        const uid = Object.values(usr).slice()[0];
        let ret;
        props.firebase.sub(uid).on('value', snapshot => {
            if(snapshot.val() == null) {
                props.firebase.sub(uid).update({time: 1000000, id: uid,})
                ret = 1000000
            }
            else {
              ret = snapshot.val().time;
            }
        })
        return ret;
  }

  const [callMode, setCallMode] = React.useState(false); //false means join a call, true means create a call

  const [isMobile, setIsMobile] = React.useState('large');

  const [copy, setCopy] = React.useState(false);

  function updateWindowDimensions() {
      if (window.innerWidth<0) { //LEGACY, UNUSED
          setIsMobile('small');
      }
      else if (window.innerWidth<1100) {
          setIsMobile('medium');
      }
      else {
          setIsMobile('large');
      }
  }

  React.useEffect(() => {
      //update window size
      updateWindowDimensions();
      window.addEventListener('resize', updateWindowDimensions);

      const usr = secureStorage.getItem('authUser');
      ReactGA.initialize('UA-167407187-1');
      ReactGA.set({
          username: Object.values(usr).slice()[4],
          email: Object.values(usr).slice()[1],
          // any data that is relevant to the user session
          // that you would like to track with google analytics
      })
  });

  let timeLeftIsZero = isTimeUp()===0;
  let isAStudent = isTimeUp()===1000000;

  const [room, setRoom] = React.useState('');
  const [call, setCall] = React.useState(false);

  const [newheight, setheight] = React.useState((window.screen.height-100));
  const [newwidth, setwidth] = React.useState((window.screen.width-120));

    React.useEffect(() => {
        setheight((window.screen.height-300));
        setwidth((window.screen.width-200));
    });

  const handleClick = (event, roomName) => {
    var actionStr = "Started/Joined Video Call";
    ReactGA.event({    
        category: "Video Called",
        action: actionStr,
    });

    event.preventDefault();
    if (isMobile==='medium') {
      var link = "https://meet.jit.si/" + roomName;
      window.open(link, '_blank');
    } else {
      setCall(true);
    }   
  }

  let h = newheight+'px';
  let w = newwidth+'px';

  if (timeLeftIsZero) {
    return (
          <Paywall />
    );
  }

  if (isAStudent) { //only display the option to join a class
    return call ? (
        <div className="roompagenobg">
          <div className="roomrow">
            <div className="roomdetails">
              <p className="roomhead"><b>Room Code: </b> {room}</p>
               <br /><br />
            </div>
            <div className="returntodash">
              <a target="_blank" href="/courses" className="returnbutton">Open Dashboard in a new tab</a>
            </div>
          </div>
          <Jutsu
              width={w}
              height={h}
              roomName={room}
          />
        </div>
    ) : (
      <div className="roompage">
          <h1>Join Class Video Calls for Free</h1>
          
          <p>Enter the Room Code provided by your teacher to join their call.</p>
          
          <form className="roomform">
          <br /><br />
          <input className="roomfield" id='room' type='text' placeholder='Room Code' value={room} onChange={(e) => setRoom(e.target.value)} /><br /><br />
          
          <button className="joinroom" onClick={(event) => handleClick(event, room)} type='submit'>
              Join
          </button>
          </form>
            
          
          <br /><br /><br /><br /><br /><br /><br /><br />
      </div>
    );
  }
  else { //teacher has option to both join adn create calls
    var generator = require('generate-password');
 
    var roomCode = generator.generate({
        length: 10,
        numbers: true
    });

    return call ? ( //if calling is started
      (callMode) ? ( //if teacher generated call
        <div className="roompagenobg">
          <div className="roomrow">
            <div className="roomdetails">
              <CopyToClipboard text={roomCode}>
                <p className="roomhead" ><b>Room Code {(copy) ? ("(Copied!)") : ("(click to copy)")}: </b> {roomCode}</p>
              </CopyToClipboard>
            </div>
            <div className="returntodash">
              <a target="_blank" href="/Home" className="returnbutton">Open Dashboard in a new tab</a>
            </div>
          </div>
          <Jutsu
              width={w}
              height={h}
              roomName={roomCode}
          />
        </div>
      ) : ( //if student joining call
        <div className="roompagenobg">
          <div className="roomrow">
            <div className="roomdetails">
              <p className="roomhead"><b>Room code: </b> {room}</p>
               <br /><br />
            </div>
            <div className="returntodash">
              <a target="_blank" href="/Home" className="returnbutton">Open Dashboard in a new tab</a>
            </div>
          </div>
          <Jutsu
              width={w}
              height={h}
              roomName={room}
          />
        </div>
      )
    ) : (
      <div className="roompage">
          <h1>Free Class Video Calls</h1>
          <div className="bisplit">
            <button className={(!callMode) ? "activecallbutton" : "callbutton"} onClick={() => setCallMode(false)}>Join a Call</button>
            <button className={(callMode) ? "activecallbutton" : "callbutton"} onClick={() => setCallMode(true)}>Start a Call</button>
          </div>
          <br /><br />
          {
            (callMode) ? ( //if teacher generating a call
              <>
              <p>Create a Room for your students to join.</p>
              <form className="roomform">
              <br />
              <button className="joinroom" onClick={(event) => handleClick(event, roomCode)} type='submit'>
                  Start Call
              </button>
              </form>
              </>
            ) : ( //if student joining a call
              <>
              <p>Enter the Room Code provided by your teacher to join their call.</p>
              <form className="roomform">
              <br /><br />
              <input className="roomfield" id='room' type='text' placeholder='Room code' value={room} onChange={(e) => setRoom(e.target.value)} /><br /><br />
              
              <button className="joinroom" onClick={(event) => handleClick(event, room)} type='submit'>
                  Join Call
              </button>
              </form>
              </>
            )
          }
          <br /><br /><br /><br /><br /><br /><br /><br />
      </div>
    );
  }
}

export default withFirebase(Vidcall);