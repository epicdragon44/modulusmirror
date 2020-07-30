import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Recaptcha from "react-recaptcha";
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';
import SecureStorage from 'secure-web-storage';

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



const SignUpPage = () => (
    <div className="dialogwallpaper">
        <div className="largecontent">
            <br /><br /><h1>Sign Up</h1>
            <SignUpForm />
        </div>
    </div>
);

const INITIAL_STATE = {
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    isAdmin: false,
    error: null,
    isVerified: false,
};

class SignUpFormBase extends Component {
    constructor(props) {
        super(props);

        this.recaptchaLoaded = this.recaptchaLoaded.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.state = { ...INITIAL_STATE };
    }
    componentDidMount() {
        this.props.firebase.courses().on('value', snapshot => {
            const coursesObject = snapshot.val();
            const coursesList = Object.keys(coursesObject).map(key => ({
                ...coursesObject[key],
                appID: key,
            }));
            secureStorage.setItem('courses', coursesList);
        });
    }

    onSubmit = event => {
        const { username, email, passwordOne, isAdmin } = this.state;
        const roles = [];
        const courses = ["000000"];
        const wvarkclicks = [""];
        const vcourseprogress = [];
        const tempCourse = ["Item1"];
        vcourseprogress['TempCourse'] = tempCourse;

        if (isAdmin) {
            roles.push(ROLES.ADMIN);
        }else{
            roles.push(ROLES.USER);
        }

        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                // Create a user in your Firebase realtime database
                this.props.firebase
                    .user(authUser.user.uid)
                    .set({
                        username,
                        email,
                        roles,
                        courses,
                        vcourseprogress,
                        wvarkclicks,
                    })
                    .then(() => {
                        this.setState({ ...INITIAL_STATE });
                        this.props.history.push(ROUTES.HOME);
                    })
                    .catch(error => {
                        this.setState({ error });
                    });
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    onChangeCheckbox = event => {
        this.setState({ [event.target.name]: event.target.checked });
    };

    recaptchaLoaded() {
        console.log("recaptcha has been loaded");
    }
    verifyCallback(response) {
        if(response) {
            this.setState({
                isVerified: true,
            })
            console.log("here");
        }
    }
    showPW = event => {
        var x = document.getElementById("pw1");
        var y = document.getElementById("pw2");
        if (x.type === "password") {
            x.type = "text";
            y.type = "text";
        } else {
            x.type = "password";
            y.type = "password";
        }
    }
    render() {
        const {
            username,
            email,
            passwordOne,
            passwordTwo,
            isAdmin,
            error,
            isVerified,
        } = this.state;

        const isValid =
            ((passwordOne === passwordTwo &&
            passwordOne !== '' &&
            email !== '' &&
            username !== '') &&
            isVerified);
        
        let signupmode = (isAdmin) ? "Teacher" : "Student";

        return (
            <form onSubmit={this.onSubmit}>
                <input
                    name="username"
                    value={username}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Full Name"
                /><br /><br />
                <input
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Email Address"
                /><br /><br />
                <input
                    name="passwordOne"
                    id="pw1"
                    value={passwordOne}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Password"
                /><br /><br />
                <input
                    name="passwordTwo"
                    id="pw2"
                    value={passwordTwo}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Confirm Password"
                /><br /><br />
                <label className="small">
                    Show Passwords
                    <input
                        name="show pw"
                        type="checkbox"
                        onClick={this.showPW}
                    /><br /><br />
                </label>
                
                <br />
                
                {/* Sign up as a <b>{signupmode}</b>
                <br />
                <br /> */}
                {/* <label className="switch">
                    <input
                        name="isAdmin"
                        type="checkbox"
                        checked={isAdmin}
                        onChange={this.onChangeCheckbox}
                    />
                    <span class="slider round"></span>
                </label><br /><br /><br /> */}
                <a href="https://docs.google.com/document/d/1JKemVIR1jxEcYMJa4lr6n_ZCOS69g1hhUe1p7HHYfEI/edit?usp=sharing">By signing up, I agree to these terms.</a>
                <br />
                <center>
                    <Recaptcha
                        sitekey = "6LfvB_IUAAAAADxPHcPo2P8I9wwZmSsHwmqH9cqZ"
                        //6LfvB_IUAAAAADxPHcPo2P8I9wwZmSsHwmqH9cqZ   is the actual API key for production
                        //6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI   is the testing API key
                        render = "explicit"
                        onloadCallback = {this.recaptchaLoaded}
                        verifyCallback = {this.verifyCallback}
                    />
                </center>
                <br /><br />
                <button disabled={!isValid} type="submit">
                    Sign Up
                </button>
                <br /><br /><br /><br />
                {console.log(isValid)}
                {error && <p>{error.message}</p>}
            </form>
        );
    }
}

const SignUpLink = () => (
    <p>
        Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
    </p>
);

const SignUpForm = withRouter(withFirebase(SignUpFormBase));

export default SignUpPage;

export { SignUpForm, SignUpLink };