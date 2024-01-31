// App.js
import React from "react";
import HoverVideo from "./HoverVideo";

const App = () => {
  const imageSrc =
    "https://static.toiimg.com/thumb/msid-101553026,width-1280,resizemode-4/101553026.jpg";
    const videoSrc = `videos/salaar_tr.mp4`;
  const title = "Salaar";
  const description =
    "A gang leader tries to keep a promise made to his dying friend and takes on the other criminal gangs.";

  return (
    <div>
      <HoverVideo
        imageSrc={imageSrc}
        videoSrc={videoSrc}
        title={title}
        description={description}
      />
    </div>
  );
};

export default App;