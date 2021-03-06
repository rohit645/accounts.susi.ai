// Packages
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import { Link } from 'react-router-dom';
// import zxcvbn from 'zxcvbn';

// Components
import PasswordField from 'material-ui-password-field';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Snackbar from 'material-ui/Snackbar';
import FlatButton from 'material-ui/FlatButton';
import Login from '../Login/Login.react';
import StaticAppBar from '../../StaticAppBar/StaticAppBar';
import ChatConstants from '../../../constants/ChatConstants';
import Description from './Description.js';

// Static assets

import Footer from '../../Footer/Footer.react.js';
import susi from '../../../images/susi-logo.svg';
import Cookies from 'universal-cookie';
import { urls } from '../../../Utils';
import { CAPTCHA_KEY } from '../../../config.js';
import Recaptcha from 'react-recaptcha';
import zxcvbn from 'zxcvbn';
import isMobileView from '../../../Utils/isMobileView';

import './SignUp.css';
import './SignupMobileFix.min.css';

const cookies = new Cookies();

const mobileView = isMobileView();

const styles = {
  emailStyle: {
    height: '35px',
    borderRadius: 4,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '0px 10px',
    width: mobileView ? '90%' : '95%',
    marginTop: '10px',
  },
  fieldStyle: {
    height: '35px',
    borderRadius: 4,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '0px 10px',
    width: mobileView ? '90%' : '380px',
    marginTop: '10px',
  },
  inputStyle: {
    height: '35px',
    marginBottom: '10px',
    webkitTextFillColor: 'unset',
  },
  inputpassStyle: {
    height: '35px',
    marginBottom: '10px',
    marginRight: '50px',
    width: '100%',
    webkitTextFillColor: 'unset',
  },
  buttonStyle: {
    width: '100%',
    marginTop: '0',
  },
};

export default class SignUp extends Component {
  componentDidMount() {
    const isLoggedIn = !!cookies.get('loggedIn');
    if (isLoggedIn) {
      return this.props.history.push('/settings');
    }
  }
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
      checked: false,
      isCaptchaVerified: false,
      captchaVerifyErrorMessage: '',
      passwordConfirmErrorMessage: '',
      passwordErrorMessage: '',
      emailErrorMessage: '',
      passwordStrength: '',
      passwordScore: -1,
      openSnackbar: false,
      msgSnackbar: '',
    };

    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.passwordConfirmErrorMessage = '';

    if (document.cookie.split('=')[0] === 'loggedIn') {
      this.props.history.push('/');
      window.location.reload();
    }
  }

  handleClose = () => {
    let state = this.state;

    if (state.success) {
      this.props.history.push('/', { showLogin: true });
    } else {
      this.setState({
        email: '',
        isEmail: false,
        emailError: true,
        passwordError: true,
        passwordConfirmError: true,
        passwordValue: '',
        passwordScore: -1,
        confirmPasswordValue: '',
        msg: '',
        success: false,
        validForm: false,
        checked: false,
        open: false,
      });
    }
  };

  handleChange = event => {
    let {
      email,
      passwordValue,
      confirmPasswordValue,
      isEmail,
      emailError,
      validPassword,
      passwordError,
      passwordConfirmError,
      emailErrorMessage,
      passwordErrorMessage,
      passwordConfirmErrorMessage,
      validForm,
      passwordScore,
      passwordStrength,
    } = this.state;

    // eslint-disable-next-line
    switch (event.target.name) {
      case 'email':
        email = event.target.value.trim();
        isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
        emailError = !(email && isEmail);
        emailErrorMessage = emailError ? 'Enter a valid Email Address' : '';
        break;
      case 'password':
        passwordValue = event.target.value.trim();
        validPassword = passwordValue.length >= 6;
        const validConfirmPassword = confirmPasswordValue.length >= 1;
        passwordError = !(passwordValue && validPassword);
        passwordConfirmError = !(
          passwordValue === this.state.confirmPasswordValue
        );
        if (validPassword) {
          const result = zxcvbn(passwordValue);
          passwordScore = result.score;
          let strength = ['Worst', 'Bad', 'Weak', 'Good', 'Strong'];
          passwordStrength = strength[result.score];
        } else {
          passwordStrength = '';
          passwordScore = -1;
        }
        passwordErrorMessage = passwordError
          ? 'Minimum 6 characters required'
          : '';
        passwordConfirmErrorMessage =
          passwordConfirmError && validConfirmPassword
            ? 'Check your password again'
            : '';
        break;

      case 'confirmPassword':
        confirmPasswordValue = event.target.value;
        const validConfirmPasswordLength = confirmPasswordValue.length >= 6;
        validPassword = confirmPasswordValue === passwordValue;
        passwordConfirmError = !(validPassword && confirmPasswordValue);
        passwordConfirmErrorMessage =
          passwordConfirmError && validConfirmPasswordLength
            ? 'Check your password again'
            : '';
        break;
    }

    if (!emailError && !passwordError && !passwordConfirmError) {
      validForm = true;
    } else {
      validForm = false;
    }

    this.setState({
      email,
      passwordValue,
      confirmPasswordValue,
      isEmail,
      emailError,
      validPassword,
      passwordError,
      passwordConfirmError,
      emailErrorMessage,
      passwordErrorMessage,
      passwordConfirmErrorMessage,
      validForm,
      passwordScore,
      passwordStrength,
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    const {
      email,
      passwordValue,
      emailError,
      passwordConfirmError,
      isCaptchaVerified,
    } = this.state;

    let BASE_URL = urls.API_URL;
    let signupEndPoint =
      BASE_URL +
      '/aaa/signup.json?signup=' +
      email +
      '&password=' +
      encodeURIComponent(passwordValue);

    if (!isCaptchaVerified) {
      this.setState({
        captchaVerifyErrorMessage: 'Please verify that you are a human.',
      });
    }

    if (!emailError && !passwordConfirmError && isCaptchaVerified) {
      $.ajax({
        url: signupEndPoint,
        dataType: 'jsonp',
        crossDomain: true,
        timeout: 3000,
        async: false,
        success: function(response) {
          this.setState({
            msgSnackbar: response.message,
            openSnackbar: true,
            success: true,
          });
        }.bind(this),
        error: function(errorThrown) {
          this.setState({
            openSnackbar: true,
            msgSnackbar: 'Failed. Try Again',
            success: false,
          });
        }.bind(this),
      });
    }
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  onCaptchaLoad = () => {
    this.setState({
      isCaptchaVerified: false,
      captchaVerifyErrorMessage: '',
    });
  };

  verifyCaptchaCallback = response => {
    if (response) {
      this.setState({
        isCaptchaVerified: true,
        captchaVerifyErrorMessage: '',
      });
    }
  };

  render() {
    const {
      fieldStyle,
      emailStyle,
      inputpassStyle,
      inputStyle,
      buttonStyle,
    } = styles;

    const {
      email,
      passwordValue,
      passwordErrorMessage,
      emailErrorMessage,
      validForm,
      confirmPasswordValue,
      passwordConfirmErrorMessage,
      isCaptchaVerified,
      captchaVerifyErrorMessage,
    } = this.state;

    const actions = (
      <FlatButton
        label="OK"
        backgroundColor={ChatConstants.standardBlue}
        labelStyle={{ color: '#fff' }}
        onClick={this.handleClose}
      />
    );

    const PasswordClass = `is-strength-${this.state.passwordScore}`;

    return (
      <div>
        <div>
          <div className="app-bar-div">
            <StaticAppBar />
          </div>
        </div>
        <Description />

        <div className="signup-container">
          <div className="signUpForm">
            <form
              onSubmit={this.handleSubmit}
              style={{ float: 'left' }}
              className="form"
            >
              <img src={susi} alt="SUSI" className="susi-signup-logo" />
              <h1 className="signup-header-text">
                See whats happening in the world right now
              </h1>
              <h1 style={{ fontSize: '40px', paddingTop: '10px' }}>Sign Up</h1>
              <br />
              <div>
                <TextField
                  name="email"
                  type="email"
                  value={email}
                  onChange={this.handleChange}
                  style={emailStyle}
                  inputStyle={inputStyle}
                  labelText={{ color: '#878faf' }}
                  underlineStyle={{ display: 'none' }}
                  placeholder="Email"
                  errorText={emailErrorMessage}
                />
              </div>
              <div className={PasswordClass}>
                <PasswordField
                  name="password"
                  style={fieldStyle}
                  inputStyle={inputpassStyle}
                  value={passwordValue}
                  placeholder="Password"
                  underlineStyle={{ display: 'none' }}
                  onChange={this.handleChange}
                  errorText={passwordErrorMessage}
                  visibilityButtonStyle={{
                    marginTop: '-3px',
                  }}
                  visibilityIconStyle={{
                    marginTop: '-3px',
                  }}
                />
                <div style={{ width: '400px', textAlign: 'center' }}>
                  <div className="ReactPasswordStrength-strength-bar" />
                  <span>{this.state.passwordStrength}</span>
                </div>
              </div>
              <div>
                <PasswordField
                  name="confirmPassword"
                  style={fieldStyle}
                  inputStyle={inputpassStyle}
                  value={confirmPasswordValue}
                  placeholder="Confirm Password"
                  underlineStyle={{ display: 'none' }}
                  onChange={this.handleChange}
                  errorText={passwordConfirmErrorMessage}
                  visibilityButtonStyle={{
                    marginTop: '-3px',
                  }}
                  visibilityIconStyle={{
                    marginTop: '-3px',
                  }}
                  textFieldStyle={{
                    padding: '0px',
                    width: mobileView ? '100%' : '380px',
                  }}
                />
              </div>
              <div style={{ width: '304px', margin: '10px auto 10px' }}>
                <Recaptcha
                  sitekey={CAPTCHA_KEY}
                  render="explicit"
                  onloadCallback={this.onCaptchaLoad}
                  verifyCallback={this.verifyCaptchaCallback}
                  badge="inline"
                  type="audio"
                  size="normal"
                />
                {!isCaptchaVerified &&
                  captchaVerifyErrorMessage && (
                    <p className="error-message">{captchaVerifyErrorMessage}</p>
                  )}
              </div>
              <div>
                <RaisedButton
                  label="Sign Up"
                  type="submit"
                  style={buttonStyle}
                  disabled={!validForm || !isCaptchaVerified}
                  backgroundColor={ChatConstants.standardBlue}
                  labelColor="#fff"
                />
              </div>
              <br />
              <h4
                style={{
                  fontSize: '15px',
                  textAlign: 'center',
                  color: 'grey',
                  marginTop: '20px',
                }}
              >
                OR
              </h4>
              <div>
                <h4
                  style={{ textAlign: 'center', margin: 5, fontWeight: '300' }}
                >
                  If you have an account, Please Login
                </h4>
                <br />
                <Link to={'/'}>
                  <div className="loginButton">
                    <RaisedButton
                      // onClick={this.handleOpen}
                      label="Login"
                      style={buttonStyle}
                      backgroundColor={ChatConstants.standardBlue}
                      labelColor="#fff"
                    />
                  </div>
                </Link>
              </div>
            </form>
            <Dialog
              actions={actions}
              modal={false}
              open={this.state.open}
              autoScrollBodyContent={true}
              onRequestClose={this.handleClose}
              contentStyle={{ width: '35%', minWidth: '300px' }}
            >
              <div>
                <Login {...this.props} />
              </div>
            </Dialog>
          </div>
        </div>
        <Footer />
        <Snackbar
          open={this.state.openSnackbar}
          message={this.state.msgSnackbar}
          autoHideDuration={4000}
          onRequestClose={() => {
            this.setState({ openSnackbar: false });
          }}
        />
      </div>
    );
  }
}

SignUp.propTypes = {
  history: PropTypes.object,
};
