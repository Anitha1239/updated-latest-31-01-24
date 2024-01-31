import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
  Navigate,
  Link,
} from "react-router-dom";

import "./App.css";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import Register from "./components/Register";
import AddProfile from "./components/AddProfile";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile"; // Import EditProfile component here
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import PasswordReset from "./components/PasswordReset";
import RealmLogo from "./components/RealmLogo";
import FileUpload from "./components/FileUpload";
import Restrict from "./components/Restrict";
import Home from "./components/Home";
import Movie from "./components/Movie";
import Search from "./components/Search";
import PinPage from "./components/PinPage";
import VideoPlayer from "./components/VideoPlayer";
import WatchlistVideos from "./components/WatchlistVideos";
import Movies from "./components/Movies";
import GenrePage from "./components/GenrePage";
import Admin from "./components/Admin";
import ChildHome from "./components/ChildHome";
import ChildSearch from "./components/ChildSearch";
import ChildMovies from "./components/ChildMovies";
import Test from "./components/Test";
import Plan1 from "./components/Plan1";
import Plan2 from "./components/Plan2";
import Plan3 from "./components/Plan3";
import Plan4 from "./components/Plan4";
import Plans from "./components/Plans";
import PaymentPage from "./components/PaymentPage";

function App() {
  const { currentUser } = useContext(AuthContext);

  const Layout = () => {
    return (
      <div className="light">
        <div>
          <Outlet />
        </div>
      </div>
    );
  };
  

  

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  // Redirect user to the home page if already logged in
  const RedirectIfLoggedIn = () => {
    if (currentUser) {
      return <Navigate to="/home" />;
    } else {
      return null;
    }
  };

  

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/test",
      element: <Test />,
    },
    {
      path: '/pin/:profileId/',
      element: <PinPage />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/realmlogo",
      element: <RealmLogo />,
    },
    {
      path: "/forgotpassword",
      element: <ForgotPassword />, // Include EditProfile component for editing profiles
    },
   
    {
      path: "/VerifyOtp",
      element: <VerifyOtp />, // Include EditProfile component for editing profiles
    },
    {
      path: "/PasswordReset",
      element: <PasswordReset />, // Include EditProfile component for editing profiles
    },
    {
      path: "/Moviespage",
      element: <Movies />, // Include EditProfile component for editing profiles
    },

    {
      path: "/movie/:id",
      element: <Movie />, // Include EditProfile component for editing profiles
    },
    {
      path: "/upload",
      element: <FileUpload />,
    },
    {
      path: "/search",
      element: <Search />,
    },
    {
      path: "/genre/:genreId",
      element: <GenrePage />, // Include EditProfile component for editing profiles
    },
    {
  
    path: "/Childhome",
      element: <ChildHome/>,
    },
    {
      path: "/ChildMovies",
      element: <ChildMovies/>,
    },
    {
      path: "/ChildSearch",
      element: <ChildSearch/>,
    },



    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/profiles",
          element: <Profile />,
        },

        {
          path: "/watchlist",
          element: <WatchlistVideos />,
        },

        {
          path: "/home",
          element: <Home />,
        },
        {
          path: "/plans",
          element: <Plans />,
        },
        {
          path: "/plan1",
          element: <Plan1 />,
        },
        {
          path: "/plan2",
          element: <Plan2 />,
        },
        {
          path: "/plan3",
          element: <Plan3 />,
        },
        {
          path: "/plan4",
          element: <Plan4 />,
        },
        {
          path: "/pay/:price",
          element: <PaymentPage />,
        },


        {
          path: "/add-profile",
          element: <AddProfile />,
        },
        {
          path: "/restrict",
          element: <Restrict />,
        },
        {
          path: "/admin",
          element: <Admin />,
        },
        {
          path: "/edit-profile/:profileId",
          element: <EditProfile />, // Include EditProfile component for editing profiles
        },
        {
          path: "/video/:videoPath",
          element: <VideoPlayer />, 
        },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
