import React from 'react';
import SecureStorage from 'secure-web-storage';
import { withFirebase } from '../Firebase';
import stripesecured from './stripe-payment-logo.png';

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




class Paywall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            stripeLoading: true,
        };
        // onStripeUpdate must be bound or else clicking on button will produce error.
        this.onStripeUpdate = this.onStripeUpdate.bind(this);
        // binding loadStripe as a best practice, not doing so does not seem to cause error.
        this.loadStripe = this.loadStripe.bind(this);
        this.isTimeUp = this.isTimeUp.bind(this);
        this.setTimeLeft = this.setTimeLeft.bind(this);
        this.charge = this.charge.bind(this);
    }
  
    setTimeLeft() {
        const usr = secureStorage.getItem('authUser');
        const uid = Object.values(usr).slice()[0];
        const days = this.isTimeUp();
        let set;
        if ( days === 1000000)
            set = 30;
        else 
            set = days + 30;
        this.props.firebase.sub(uid).update({
            time: set,
            id: uid,
        });
        window.location.reload()
    }
  
    isTimeUp() {
        
        const usr = secureStorage.getItem('authUser');
        const uid = Object.values(usr).slice()[0];
        console.log(uid);
        let ret;
        this.props.firebase.sub(uid).on('value', snapshot => {
            if(snapshot.val() == null) {
                this.props.firebase.sub(uid).update({time: 1000000, id: uid,})
                ret = 1000000
            }
            else {
              ret = snapshot.val().time;
            }
        })
        return ret;
    }
  
    loadStripe(onload) {
        if(! window.StripeCheckout) {
            const script = document.createElement('script');
            script.onload = function () {
                console.info("Stripe script loaded");
                onload();
            };
            script.src = 'https://checkout.stripe.com/checkout.js';
            document.head.appendChild(script);
        } else {
            onload();
        }
    }
  
    componentDidMount() {
      const STRIPE_PUBLIC_KEY = 'pk_live_51GyUFgKqVfxj8aznW5Wa2M7GJBTWYPmw71LMS3FJcL6HYd9XhcmKdKKFAB1ibwe2khlRSjJXRewkywWEyR6n8JVE00P1X5mEeZ';
      const charge_amount = 499;
          const charge_currency = 'usd';
      this.loadStripe(() => {
          this.stripeHandler = window.StripeCheckout.configure({
              key: STRIPE_PUBLIC_KEY,
              locale: 'auto',
              token: async token => {
  
                  // Pass the received token to our Firebase function
                  let res = await this.charge(token, charge_amount, charge_currency);
                  if (res.body.error) {
                      alert('There was an error processing your payment.');
                      return;
                  }
  
                  // Card successfully charged!
                  this.setState({
                      displayPayButton: false
                  });
                  this.setTimeLeft();
              }
          });
  
          this.setState({
              stripeLoading: false,
              // loading needs to be explicitly set false so component will render in 'loaded' state.
              loading: false,
          });
      });

      const usr = secureStorage.getItem('authUser');
      ReactGA.initialize('UA-167407187-1');
        ReactGA.set({
            username: Object.values(usr).slice()[4],
            email: Object.values(usr).slice()[1],
            // any data that is relevant to the user session
            // that you would like to track with google analytics
        })
  }
    async charge(token, amount, currency) {
        var actionStr = "Made a payment";
        ReactGA.event({    
            category: "Made Payment",
            action: actionStr,
        });

      const FIREBASE_FUNCTION = 'https://us-central1-modulus-e56e4.cloudfunctions.net/charge ';
      const res = await fetch(FIREBASE_FUNCTION, {
          method: 'POST',
          body: JSON.stringify({
              token,
              charge: {
                  amount,
                  currency,
              },
          }),
      });
      const data = await res.json();
      data.body = JSON.parse(data.body);
      return data;
    }
  
    componentWillUnmount() {
        if(this.stripeHandler) {
            this.stripeHandler.close();
        }
    }
  
    onStripeUpdate(e) {
      this.stripeHandler.open({
          name: 'Modulus Pro',
          description: 'Unlimited calling and course creation',
          panelLabel: 'Subscribe Now',
      });
      e.preventDefault();
    }
  
    render() {
        var actionStr = "Viewed the paywall";
        ReactGA.event({    
            category: "Viewed Paywall",
            action: actionStr,
        });

        const { stripeLoading, loading } = this.state;
        if (this.isTimeUp()===1000000) { //if a student only
            //display upgrade page
            return (
                <div className="centered">
                    <div className="paybackgroundstrip">
                        <br /><br />
                        <h1>Upgrade to Modulus Pro</h1>
                        <br /><br />
                        <button className="begintrial" onClick={this.setTimeLeft}>Begin 30-day Free Trial</button>
                    </div>
                    <div className="normalbg">
                        <br /><br />
                        <div className="contentbox">
                            Our mission is to provide a free and democratic online learning environment for students anywhere, but unfortunately, it's not free to keep the lights on.
                            <br /><br />
                            For just 4.99 a month, you'll get to continue your instruction online - and we'll get to continue serving your course to the world.
                        </div>
                        <br />
                        <div className="contentbox">
                            <h2>One Price - Unlimited Features</h2>
                            <br />
                            <h3>For only 4.99 a month, you get:<br /></h3>
                            <ul>
                                <li>✓  Infinite course creation and editing</li>
                                <li>✓  Infinite class size</li>
                                <li>✓  Infinite video calling</li>
                            </ul>
                        </div>
                        
                        <br />
                        <button className="begintrial" onClick={this.setTimeLeft}>Begin 30-day Free Trial</button>
                        <br /><br /><br /><br /><br /><br /><br /><br />
                    </div>
                </div>
            );
        } else if (this.isTimeUp()===0) { //if time's up, be like "i see youre enjpying modulus, buy another 30 days"
            return (
                <div className="centered">
                    <div className="paybackgroundstrip">
                        <br /><br />
                        <h1>It looks like you're enjoying Modulus Pro ;)</h1>
                        <h3>Unfortunately, it looks like your current subscription has ended.</h3>
                        <br /><br />
                        <div>
                            {(loading || stripeLoading)
                                ? <p>Loading..</p>
                                : <button className="begintrial" onClick={this.onStripeUpdate}>Add another 30 days</button>
                            }
                        </div>
                    </div>
                    <div className="normalbg">
                        <br /><br />
                        <div className="contentbox">
                            Our mission is to provide a free and democratic online learning environment for students anywhere, but unfortunately, it's not free to keep the lights on.
                            <br /><br />
                            For just 4.99 a month, you'll get to continue your instruction online - and we'll get to continue serving your course to the world.
                        </div>
                        <br />
                        <div className="contentbox">
                            <h2>One Price - Unlimited Features</h2>
                            <br />
                            <h3>For only 4.99 a month, you get:<br /></h3>
                            <ul>
                                <li>✓  Infinite course creation and editing</li>
                                <li>✓  Infinite class size</li>
                                <li>✓  Infinite video calling</li>
                            </ul>
                        </div>
                        <img height="200px" src={stripesecured} />
                        <br />
                        <div>
                            {(loading || stripeLoading)
                                ? <p>Loading..</p>
                                : <button className="begintrial" onClick={this.onStripeUpdate}>Add another 30 days</button>
                            }
                        </div>
                        <br /><br /><br /><br /><br /><br /><br /><br />
                    </div>
                </div>
            );
        }
        else { //tell them the number of days they have left, and offer to buy another 30 now
            return (
                <div className="centered">
                    <div className="paybackgroundstrip">
                        <br /><br />
                        <h1>Thank you for using Modulus Pro</h1>
                        <h3>You still have {this.isTimeUp()} days left of Pro.</h3>
                        <br /><br />
                        <div>
                            {(loading || stripeLoading)
                                ? <p>Loading..</p>
                                : <button className="begintrial" onClick={this.onStripeUpdate}>Add another 30 days</button>
                            }
                        </div>
                    </div>
                    <div className="normalbg">
                        <br /><br />
                        <div className="contentbox">
                            Our mission is to provide a free and democratic online learning environment for students anywhere, but unfortunately, it's not free to keep the lights on.
                            <br /><br />
                            For just 4.99 a month, you'll get to continue your instruction online - and we'll get to continue serving your course to the world.
                        </div>
                        <br />
                        <div className="contentbox">
                            <h2>One Price - Unlimited Features</h2>
                            <br />
                            <h3>For only 4.99 a month, you get:<br /></h3>
                            <ul>
                                <li>✓  Infinite course creation and editing</li>
                                <li>✓  Infinite class size</li>
                                <li>✓  Infinite video calling</li>
                            </ul>
                        </div>
                        <img height="200px" src={stripesecured} />
                        <br />
                        <div>
                            {(loading || stripeLoading)
                                ? <p>Loading..</p>
                                : <button className="begintrial" onClick={this.onStripeUpdate}>Add another 30 days</button>
                            }
                        </div>
                        <br /><br /><br /><br /><br /><br /><br /><br />
                    </div>
                </div>
            );
        }
    }
  }

  export default withFirebase(Paywall);