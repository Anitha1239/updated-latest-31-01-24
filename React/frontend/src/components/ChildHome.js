import React from "react";
import NavChild from "./NavChild";
import "./Home.css"; // You can reuse the styles from Home.css
import ChildThumbnails from "./ChildThumbnails"; // Import the ChildThumbnails component

import Hoverchild from "./HoverChild";


const ChildHome = () => {
  return (
    <div>
      <header>
        <NavChild/>
      </header>
      <div className="vid">
        <Hoverchild/>
      </div>
      <div className="thumbnails-container">
        <ChildThumbnails /> {/* Use the ChildThumbnails component here */}
      </div>
    </div>
  );
};

export default ChildHome;