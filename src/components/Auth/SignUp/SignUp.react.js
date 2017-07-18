import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import $ from 'jquery';
import './SignUp.css';
import AppBar from 'material-ui/AppBar';
import PasswordField from 'material-ui-password-field';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import UserPreferencesStore from '../../../stores/UserPreferencesStore';
import Login from '../Login/Login.react';
import { slide as Menu } from 'react-burger-menu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { Link } from 'react-router-dom';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
/* eslint-disable */
const ListMenu = () => (
					<IconMenu className='IconMenu'
											tooltip="Options"
											iconButtonElement={
													<IconButton
													className='menu-icon'
													iconStyle={{ fill : 'white',}}>
															<MoreVertIcon /></IconButton>
											}
											targetOrigin={{ horizontal: 'right', vertical: 'top' }}
											anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
										 >
                     <MenuItem primaryText="Chat With Susi"
 										href="http://chat.susi.ai" />
										 <MenuItem primaryText="Forgot Password"
													 containerElement={<Link to="/forgotpwd" />} />
										<MenuItem primaryText="Log In"
										containerElement={<Link to="/" />} />
									</IconMenu>

);

export default class SignUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            isEmail: false,
            emailError: true,
            passwordError: true,
            passwordConfirmError: true,
            passwordValue: '',
            confirmPasswordValue: '',
            msg: '',
            success: false,
            open: false,
            validForm: false,
            serverUrl: '',
            checked:false,
            serverFieldError: false,
        };

        this.emailErrorMessage = '';
        this.passwordErrorMessage = '';
        this.passwordConfirmErrorMessage = '';
        this.customServerMessage = '';

        if (document.cookie.split('=')[0] === 'loggedIn') {
            this.props.history.push('/');
            window.location.reload();

        }
    }

    handleClose = () => {
        let state = this.state;

        if (state.success) {
            this.props.history.push('/', { showLogin: true });
        }
        else {
            this.setState({
                email: '',
                isEmail: false,
                emailError: true,
                passwordError: true,
                passwordConfirmError: true,
                passwordValue: '',
                confirmPasswordValue: '',
                msg: '',
                success: false,
                validForm: false,
                serverUrl: '',
                checked:false,
                serverFieldError: false,
                open: false
            });
        }
    }

    handleChange = (event) => {
        let email;
        let password;
        let confirmPassword;
        let serverUrl;
        let state = this.state
        if (event.target.name === 'email') {
            email = event.target.value.trim();
            let validEmail =
                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
            state.email = email;
            state.isEmail = validEmail;
            state.emailError = !(email && validEmail)
        }
        else if (event.target.name === 'password') {
            password = event.target.value;
            let validPassword = password.length >= 6;
            state.passwordValue = password;
            state.passwordError = !(password && validPassword);
        }
        else if (event.target.name === 'confirmPassword') {
            password = this.state.passwordValue;
            confirmPassword = event.target.value;
            let validPassword = confirmPassword === password;
            state.confirmPasswordValue = confirmPassword;
            state.passwordConfirmError = !(validPassword && confirmPassword);
        }
        else if (event.target.value === 'customServer') {
            state.checked = true;
            state.serverFieldError = true;
        }
        else if (event.target.value === 'standardServer') {
            state.checked = false;
            state.serverFieldError = false;
        }
        else if (event.target.name === 'serverUrl'){
            serverUrl = event.target.value;
            let validServerUrl =
/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:~+#-]*[\w@?^=%&amp;~+#-])?/i
            .test(serverUrl);
            state.serverUrl = serverUrl;
            state.serverFieldError = !(serverUrl && validServerUrl);
        }

        if (!this.state.emailError
            && !this.state.passwordError
            && !this.state.passwordConfirmError) {
            state.validForm = true;
        }
        else {
            state.validForm = false;
        }

        this.setState(state);

        if (this.state.emailError) {
            this.emailErrorMessage = 'Enter a valid Email Address';
        }
        else if (this.state.passwordError) {
            this.emailErrorMessage = '';
            this.passwordErrorMessage
                = 'Minimum 6 characters required';
            this.passwordConfirmErrorMessage = '';

        }
        else if (this.state.passwordConfirmError) {
            this.emailErrorMessage = '';
            this.passwordErrorMessage = '';
            this.passwordConfirmErrorMessage = 'Check your password again';
        }
        else {
            this.emailErrorMessage = '';
            this.passwordErrorMessage = '';
            this.passwordConfirmErrorMessage = '';
        }

        if (this.state.serverFieldError) {
            this.customServerMessage = 'Enter a valid URL';
        }
        else{
            this.customServerMessage = '';
        }

        if(this.state.emailError||
        this.state.passwordError||
        this.state.passwordConfirmError||
        this.state.serverFieldError){
            this.setState({validForm: false});
        }
        else{
            this.setState({validForm: true});
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();

        let defaults = UserPreferencesStore.getPreferences();
        let BASE_URL = defaults.Server;

        let serverUrl = this.state.serverUrl;
        if(serverUrl.slice(-1) === '/'){
            serverUrl = serverUrl.slice(0,-1);
        }
        if(serverUrl !== ''){
            BASE_URL = serverUrl;
        }
        console.log(BASE_URL);
        let signupEndPoint =
            BASE_URL+'/aaa/signup.json?signup=' + this.state.email +
            '&password=' + this.state.passwordValue;

        if (!this.state.emailError && !this.state.passwordConfirmError
            && !this.state.serverFieldError) {
            $.ajax({
                url: signupEndPoint,
                dataType: 'jsonp',
                crossDomain: true,
                timeout: 3000,
                async: false,
                success: function (response) {
                    let msg = response.message;
                    let state = this.state;
                    state.msg = msg;
                    state.success = true;
                    this.setState(state);

                }.bind(this),
                error: function (errorThrown) {
                    let msg = 'Failed. Try Again';
                    let state = this.state;
                    state.msg = msg;
                    state.success = false;
                    this.setState(state);

                }.bind(this)
            });
        }

    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    render() {

        const serverURL = <TextField name="serverUrl"
                            onChange={this.handleChange}
                            value={this.state.serverUrl}
                            errorText={this.customServerMessage}
                            floatingLabelText="Custom URL" />;

        const hidden = this.state.checked ? serverURL : '';

        const radioButtonStyles = {
          block: {
            maxWidth: 250,
          },
          radioButton: {
            marginBottom: 16,
          },
        };

        const styles = {
            'margin': '60px auto',
            'width': '100%',
            'padding': '20px',
            'textAlign': 'center'
        }

        const fieldStyle = {
            'width': '256px'
        }

        const actions =
            <FlatButton
                label="OK"
                backgroundColor={
                    UserPreferencesStore.getTheme()==='light' ? '#607D8B' : '#19314B'}
                labelStyle={{ color: '#fff' }}
                onTouchTap={this.handleClose}
            />;

        return (
        <div>
            <div>
                <header className='message-thread-heading'>
                <div className="app-bar-div">
                              <AppBar
                              iconElementLeft= {<iconButton></iconButton>}
                                  className="app-bar"
                                  style={{ backgroundColor : '#607D8B',
                                       height: '46px'}}
                                  titleStyle={{height:'46px'}}
                                  iconElementRight={<ListMenu />}

                              />
                  </div>
                </header>
            </div>
            <div>
            <Menu  customBurgerIcon={ <img key="icon" src="img/icon.svg" />} />
             <Menu customCrossIcon={ <img key="cross" src="img/cross.svg" /> } />
            <Menu className="menu-new">
            <li>
              <ul> <a id="Applist" className="menu-item" href="">Applist</a></ul>
              <ul> <a id="Chat" className="menu-item" href="http://chat.susi.ai">Chat with susi</a></ul>
              <ul><Link to={'/'} ><a id="LogIn" className="menu-item" >Log In</a></Link></ul>
               </li>
             </Menu>

           </div>
            <div className="signUpForm">
                <Paper zDepth={1} style={styles}>
                    <h1>Sign Up with SUSI</h1>
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <TextField
                                name="email"
                                value={this.state.email}
                                onChange={this.handleChange}
                                errorText={this.emailErrorMessage}
                                floatingLabelText="Email" />
                        </div>
                        <div>
                            <PasswordField
                                name="password"
                                style={fieldStyle}
                                value={this.state.passwordValue}
                                onChange={this.handleChange}
                                errorText={this.passwordErrorMessage}
                                floatingLabelText="Password" />
                        </div>
                        <div>
                            <PasswordField
                                name="confirmPassword"
                                style={fieldStyle}
                                value={this.state.confirmPasswordValue}
                                onChange={this.handleChange}
                                errorText={this.passwordConfirmErrorMessage}
                                floatingLabelText="Confirm Password" />
                        </div>
                        <div>
                            <div>
                            <RadioButtonGroup style={{display: 'flex',
                              marginTop: '10px',
                              maxWidth:'200px',
                              flexWrap: 'wrap',
                              margin: 'auto'}}
                             name="server" onChange={this.handleChange}
                             defaultSelected="standardServer">
                            <RadioButton
                                   value="customServer"
                                   label="Custom Server"
                                   labelPosition="left"
                                   style={radioButtonStyles.radioButton}
                                 />
                            <RadioButton
                                   value="standardServer"
                                   label="Standard Server"
                                   labelPosition="left"
                                   style={radioButtonStyles.radioButton}
                                 />
                            </RadioButtonGroup>
                            </div>
                        </div>
                        <div>
                        {hidden}
                        </div>
                        <div>
                            <RaisedButton
                                label="Sign Up"
                                type="submit"
                                disabled={!this.state.validForm}
                                backgroundColor={
                                    UserPreferencesStore.getTheme()==='light'
                                    ? '#607D8B' : '#19314B'}
                                labelColor="#fff" />
                        </div>
                        <h1>OR</h1>
                        <div>
                            <h4>If you have an account, Please Login</h4>
                            <Link to={'/'} >
                            <RaisedButton
                                // onTouchTap={this.handleOpen}
                                label='Login'

                                backgroundColor={
                                    UserPreferencesStore.getTheme()==='light'
                                    ? '#607D8B' : '#19314B'}
                                labelColor="#fff" />
                              </Link>
                        </div>
                    </form>
                </Paper>
                {this.state.msg && (
                    <div><Dialog
                        actions={actions}
                        modal={false}
                        open={true}
                        onRequestClose={this.handleClose}
                    >
                        {this.state.msg}
                    </Dialog></div>
                )}
                <Dialog
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    autoScrollBodyContent={true}
                    onRequestClose={this.handleClose}
                    contentStyle={{ width: '35%', minWidth: '300px' }}
                >
                    <div><Login {...this.props} /></div>
                </Dialog>
            </div>
        </div>
        );
    };
}

SignUp.propTypes = {
    history: PropTypes.object
}
