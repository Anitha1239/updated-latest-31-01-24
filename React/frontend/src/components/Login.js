// Import necessary modules
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import styles from "./login.module.css"; // Import CSS module
import RealmLogo from "./RealmLogo";

const Login = () => {
  // State declarations
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  // Event handler to update input values
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Accessing login function from AuthContext
  const { login } = useContext(AuthContext);

  // Handling login action
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
  
      // Check if the logged-in user's email is "uploader@gmail.com"
      if (inputs.email === "uploader@gmail.com") {
        // If yes, navigate to the admin page
        navigate("/admin");
      } else {
        // If not, navigate to the profiles page
        navigate("/profiles");
      }
    } catch (err) {
      console.log(err);
      setErr(err.response.data.message);
    }
  };

  // JSX return
  return (
    <div>
      <RealmLogo  style={{ marginTop: '100px'}} />

      <div className={styles["login-container"]}>
        <div className={styles.card}>
          <div className={styles.right}>
            <h1 className="head">Login</h1>
            <form>
              <input
                type="text"
                placeholder="Email"
                name="email"
                onChange={handleChange}
              />

              <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={handleChange}
              />
              {err && err}
              <div className={styles["button-container"]}>
                <button onClick={handleLogin}>Login</button>
                <Link to="/forgotpassword" className={styles["forgot-password-link"]}>
                  Forgot Password?
                </Link>
              </div>
              <div className={styles["new-user"]}>
                <span>New User?</span>
                <Link to="/register">
                  <button>Register</button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
