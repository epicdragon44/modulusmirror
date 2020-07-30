import React from 'react';
import { Link } from 'react-router-dom';
import logo from './inversemodulus.png';

import { AuthUserContext } from '../Session';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

import dashboard from './dashboard.png';
import account from './account.png';
import cameraicon from './vidcall.svg';
import publiccourses from './browsecourses.svg';//change to new icon for public courses

import './nav.css';

function Logo() {
    const [isMobile, setIsMobile] = React.useState('large');

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
    });

    if (isMobile==='medium') {
        return (
            null
        );
    } else {
        return (
            <div className="logo" >
                <a href="https://modulusedu.com/"><img id="logo" src={logo} alt="Modulus Logo" /></a>
            </div>
        );
    }
}

const Navigation = () => (
    <AuthUserContext.Consumer>
        {authUser =>
            authUser ? (
                <NavigationAuth authUser={authUser} />
            ) : (
                <NavigationNonAuth />
            )
        }
    </AuthUserContext.Consumer>
);

function DashboardMenuItem(props) {
    return (
        <li className="nav" id="dashboard">
            <Link to={props.link}><img src={dashboard} alt="dashboard" height="20px"></img></Link>
        </li>
    );
}

function AccountMenuItem(props) {
    return (
        <li className="nav" id="account">
            <Link to={props.link}><img src={account} alt="account" height="20px"></img></Link>
        </li>
    );
}
function PublicCoursesMenuItem(props) {
    return (
        <li className="nav" id="special">
            <Link to={props.link}><img src={publiccourses} alt="publiccourses" height="20px"></img></Link>
        </li>
    );
}
function VidcallMenuItem(props) {
    return(
        <li className="nav" id="account">
            {/*change id*/}
            <Link to={props.link}><img src={cameraicon} alt="vidcall" height="20px"/></Link>
        </li>
    );
}
function MenuItem(props) {
    return (
        <li className="nav" id="special">
            <Link to={props.link}><img src={account} alt="account" height="20px"></img></Link>
        </li>
    );
}

const NavigationAuth = ({ authUser }) => (
    <div>
        <ul className="nav">
            {/* <li className="left">
                <Link to={ROUTES.LANDING}>Modulus</Link>
            </li> */}
            <li className="left">
                <Logo />
            </li>
            {/* <li className="left" style={{marginTop: "-5px"}}>
                &nbsp;&nbsp;<PublicCoursesMenuItem link={ROUTES.PUBLIC_COURSES} />
            </li> */}
            <li className="nav">
                <Link id="upgradebutton" to={ROUTES.PAYMENT}>
                    <button className="navigationbutton" style={{height: "3em"}} type="button">
                        Modulus Pro
                    </button>
                </Link>
            </li>
            <AccountMenuItem link={ROUTES.ACCOUNT} />
            
            <VidcallMenuItem link={ROUTES.VIDCALL}/>

            <DashboardMenuItem link={ROUTES.HOME} />
            {/* {authUser.roles.includes(ROLES.ADMIN) && (
                <li>
                    <Link to={ROUTES.ADMIN}>Admin</Link>
                </li>
            )} */}
            
        </ul>
    </div>

);

const NavigationNonAuth = () => (
    <ul className="nav">
        <li className="left">
            <Logo />
        </li>
        {/* <li className="left" style={{marginTop: "-5px"}}>
            &nbsp;&nbsp;&nbsp;<PublicCoursesMenuItem link={ROUTES.PUBLIC_COURSES} />
        </li> */}
        <MenuItem link={ROUTES.ACCOUNT} name="Sign In" />
    </ul>
);

export default Navigation;