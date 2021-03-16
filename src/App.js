import { useState } from "react";
import "./App.css";
import logo from "./img/logo.png";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

function App() {
  const [isUser, setIsUser] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    message: "",
    state: "",
  });
  const [user, setUser] = useState({
    isSignedIn: false,
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    message: "",
    state: "",
  });

  const handleInputChange = (event) => {
    let isInputValid;

    if (event.target.name === "name") {
      const re = /^[a-zA-Z '.-]*$/;
      isInputValid = re.test(event.target.value);
    }
    if (event.target.name === "email") {
      const re = /\S+@\S+\.\S+/;
      isInputValid = re.test(event.target.value);
    }
    if (event.target.name === "password") {
      const re = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%&*]{6,}$/;
      isInputValid = re.test(event.target.value);
    }
    if (event.target.name === "confirmPassword") {
      const re = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%&*]{6,}$/;
      isInputValid = re.test(event.target.value);
    }
    if (isInputValid) {
      const newUser = { ...user };
      newUser[event.target.name] = event.target.value;
      setUser(newUser);
    } else {
      const newUser = { ...user };
      newUser[event.target.name] = "";
      setUser(newUser);
    }
  };

  const handleMessage = (state, message) => {
    const newMessage = { ...alertMessage };
    newMessage.state = state;
    newMessage.message = message;
    setAlertMessage(newMessage);
  };

  const updateUserProfile = (name) => {
    const currentUser = firebase.auth().currentUser;

    currentUser
      .updateProfile({
        displayName: name,
      })
      .then(function () {
        // console.log("Display Name Added Successfully");
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleClearInput = () => {
    document.getElementById("signup-form").reset();
  };

  const handleFormSubmit = (event) => {
    if (!isUser) {
      if (user.email && user.password === user.confirmPassword) {
        firebase
          .auth()
          .createUserWithEmailAndPassword(user.email, user.password)
          .then((res) => {
            updateUserProfile(user.name);
            handleMessage("success", "Your account have been created successfully");
            handleClearInput();
          })
          .catch((error) => {
            var errorMessage = error.message;
            handleMessage("error", errorMessage);
          });
      } else {
        if (!(user.password === user.confirmPassword)) {
          handleMessage("error", "Password And Confirm Password not matched");
        }
        if (user.email === "") {
          handleMessage("error", "Please use correct email");
        }
      }
    } else {
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const data = res.user;
          console.log(data);
          handleMessage("success", "Successfully Signed In");
          setUser({ isSignedIn: true, name: data.displayName, email: data.email });
        })
        .catch((error) => {
          var errorMessage = error.message;
          handleMessage("error", errorMessage);
        });
    }

    event.preventDefault();
  };

  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        handleMessage("", "");
        setUser({});
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="content">
      <div className="container">
        <div className="logo">
          <img src={logo} alt="" />
        </div>
        <div className={`message ${alertMessage.state}`}>
          <p>{alertMessage.message}</p>
        </div>
        {!user.isSignedIn && (
          <form onSubmit={handleFormSubmit} action="" id="signup-form" className="signup-form">
            {!isUser && (
              <div className="single-input">
                <input onChange={handleInputChange} type="text" name="name" placeholder="Name" />
              </div>
            )}

            <div className="single-input">
              <input onChange={handleInputChange} type="text" name="email" placeholder="Email" />
            </div>

            <div className="single-input">
              <input onChange={handleInputChange} type="password" name="password" placeholder="Password" />
            </div>

            {!isUser && (
              <div className="single-input">
                <input onChange={handleInputChange} type="password" name="confirmPassword" placeholder="Confirm Password" />
              </div>
            )}

            <button className="button">{isUser ? "Sign In" : "Sign Up"}</button>
          </form>
        )}

        {!user.isSignedIn && (
          <div className="signup-footer">
            {isUser ? (
              <p>
                Create a new account here. <span onClick={() => setIsUser(false)}>Sign Up</span>
              </p>
            ) : (
              <p>
                Already Have an account? <span onClick={() => setIsUser(true)}>Sign In</span>
              </p>
            )}
          </div>
        )}

        {user.isSignedIn && (
          <div className="user-info">
            <h1>Name: {user.name}</h1>
            <h3>Email: {user.email}</h3>
            <button className="button sign-out" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
