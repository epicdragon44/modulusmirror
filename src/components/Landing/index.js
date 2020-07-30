import React, { useEffect } from 'react';
import { withFirebase } from '../Firebase';
import SecureStorage from 'secure-web-storage';
import { Redirect } from "react-router-dom"; 

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



function getNumOfPublicCourses(firebase) {
    var publicItems = [];
    firebase.courses().on('value', snapshot => {
        const coursesObject = snapshot.val();
        const coursesList = Object.keys(coursesObject).map(key => ({
            ...coursesObject[key],
            appID: key,
        }));
        secureStorage.setItem('courses', coursesList);
        for (let i = 0, len = coursesList.length; i < len; ++i) {
            var course = coursesList[i];
            if (course.visibility === "public") {
                publicItems.push({
                    name: course.CourseName,
                });
            }
        }
        console.log(coursesList.length);
    });

    

    return publicItems.length;
}

function getNumOfCourses(firebase) {
    
    firebase.courses().on('value', snapshot => {
        const coursesObject = snapshot.val();
        const coursesList = Object.keys(coursesObject).map(key => ({
            ...coursesObject[key],
            appID: key,
        }));
        secureStorage.setItem('courses', coursesList);
    });
    var publicItems = [];
    const allCourses = secureStorage.getItem('courses');

    // for (let i = 0, len = allCourses.length; i < len; ++i) {
    //     var course = allCourses[i];
    //     if (course.visibility === "public") {
    //         publicItems.push({
    //             name: course.CourseName,
    //             teacher: course.nteacherName,
    //             joinCode: course.nclasscode,
    //             subject: course.osubject,
    //             courseDescription: course.courseDescription,
    //         });
    //     }
    // }

    return allCourses.length;
}

function getNumOfUsers(firebase) {
    // let output = 73;
    // firebase.users().on('value', function(snap) {
    //     secureStorage.setItem('authUser', authUser);
    //     output =(snap.numChildren()); // this logs the number of users. 
    // });
    // return output;
}

const linkstyle = {
    fontSize: 20,
    color: 'white',
};

function Landing(props) {
    // const [isMobile, setIsMobile] = React.useState('large');

    // localStorage.removeItem('authUser');
    // localStorage.removeItem('courses');

    // props.firebase.courses().on('value', snapshot => {
    //     const coursesObject = snapshot.val();
    //     const coursesList = Object.keys(coursesObject).map(key => ({
    //         ...coursesObject[key],
    //         appID: key,
    //     }));
    //     secureStorage.setItem('courses', coursesList);
    // });

    // function updateWindowDimensions() {
    //     if (window.innerWidth<0) { //LEGACY, UNUSED
    //         setIsMobile('small');
    //     }
    //     else if (window.innerWidth<1100) {
    //         setIsMobile('medium');
    //     }
    //     else {
    //         setIsMobile('large');
    //     }
    // }
    
    // React.useEffect(() => {
    //     //update window size
    //     updateWindowDimensions();
    //     window.addEventListener('resize', updateWindowDimensions);
    // });

    // var d = new Date();
    // var n = d.getFullYear();

    // const [activeButton, setActiveButton] = React.useState(2);

    // // let publiccoursecnt = getNumOfPublicCourses(props.firebase);
    // // let coursecnt = getNumOfCourses(props.firebase);

    // // let usercnt = getNumOfUsers(props.firebase);

    // if (isMobile==='medium') {
    //     return (
    //         <>
    //             <body>
    //             </ body>
    //         </>
    //     );
    // } else {
    //     return (
    //         <>
    //             <body>
    //             </body>
    //         </>
    //     );
    // }

    window.location.href="https://modulusedu.com/";
    return (
        <Redirect to="https://modulusedu.com/" />
    );
} 

export default withFirebase(Landing);