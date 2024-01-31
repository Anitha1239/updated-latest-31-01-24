import React, { forwardRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import FastRewindIcon from "@material-ui/icons/FastRewind";
import FastForwardIcon from "@material-ui/icons/FastForward";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import VolumeUp from "@material-ui/icons/VolumeUp";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeMute from "@material-ui/icons/VolumeOff";
import FullScreen from "@material-ui/icons/Fullscreen";
import Popover from "@material-ui/core/Popover";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Link } from 'react-router-dom';
import { color } from "@mui/system";

const useStyles = makeStyles((theme) => ({
  controlsWrapper: {
    visibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  thumbnail: {
    position: "absolute",
    width: "160px",
    height: "90px",
    backgroundSize: "cover",
    borderRadius: "4px",
    pointerEvents: "none",
    marginTop: "45%",
  },
 
  videoTitle: {
    color: "#fff",
    fontSize: "1.9rem",
    marginLeft: "auto",
    marginRight: "auto",
  },
  bookmarkButton: {
    color: "#fff",
    backgroundColor: "#FF5F1F",
    marginLeft: "auto", // This will push it to the right
  },
  button: {
    margin: theme.spacing(1),
  },
  controlIcons: {
    color: "#fff",
    fontSize: 50,
    transform: "scale(0.9)",
    "&:hover": {
      color: "#fff",
      transform: "scale(1.1)",
    },
  },
  bottomIcons: {
    color: "#fff",
    "&:hover": {
      color: "#fff",
      transform: "scale(1.3)",
    },
  },
  volumeSlider: {
    width: 150,
    marginLeft: "10px",
    color: "#FF5F1F"
   
  },
  
}));
const CustomSlider = withStyles({
  root: {
    height: 8, // Adjust the height as needed
  },
  thumb: {
    height: 20,
    width: 20,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -6,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8, // Adjust the height as needed
    borderRadius: 4,
  },
  rail: {
    height: 8, // Adjust the height as needed
    borderRadius: 4,
  },
})(Slider);

const PrettoSlider = withStyles({
  root: {
    height: 8,
    color: "#FF5F1F",
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -8,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)",
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

const Controls = forwardRef((props, ref) => {
  const {
    onSeek,
    onSeekMouseDown,
    onSeekMouseUp,
    onDuration,
    onRewind,
    onPlayPause,
    onFastForward,
    playing,
    played,
    elapsedTime,
    totalDuration,
    onMute,
    muted,
    setVolume,
    onVolumeChange,
    onVolumeSeekDown,
    onChangeDispayFormat,
    playbackRate,
    onPlaybackRateChange,
    onToggleFullScreen,
    volume,
    onBookmark,
    onPlayPauseClick,
    playerRef,
    onBackButtonClick,
    videoTitle,
  } = props;

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPosition, setThumbnailPosition] = useState({ left: 0, top: 0 });
  const [isProgressBarHovered, setIsProgressBarHovered] = useState(false);
  const [hoveredTime, setHoveredTime] = useState(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);

  function handleProgressBarHover(e) {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const left = e.nativeEvent.offsetX;
    const percentage = (left / rect.width) * 100;
   
   
    setThumbnailPosition({ left: `${percentage}%`, top: "-120px" });
   
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
 
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMute = () => {
    // Toggle the mute state
    onMute(!muted);
  };
  
  const handleVolumeKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
  
      // Calculate the new volume
      const step = 0.1; // You can adjust the step as needed
      const newVolume = e.key === "ArrowUp" ? Math.min(volume + step, 1) : Math.max(volume - step, 0);
  
      // Update the volume state
      setVolume(newVolume);
    }
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case "Space":
           e.preventDefault();
          onPlayPause();
          break;
        case "ArrowLeft":
            e.preventDefault();
          onRewind();
          break;
        case "ArrowRight":
          onFastForward();
          break;
        case "ArrowUp":
            e.preventDefault();
          // Increase volume
          const newVolumeUp = Math.min(volume + 0.1, 1);
          onVolumeChange(null, newVolumeUp);
          break;
        case "ArrowDown":
            e.preventDefault();
          // Decrease volume
          const newVolumeDown = Math.max(volume - 0.1, 0);
          onVolumeChange(null, newVolumeDown);
          break;
        default:
          break;
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleVolumeKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleVolumeKeyDown);
    };
  }, [onPlayPause, onRewind, onFastForward, onVolumeChange, volume]);

  const generateThumbnail = async (time) => {
    setLoadingThumbnail(true);
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext("2d");
   
    ctx.drawImage(playerRef.current.getInternalPlayer(), 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL();
    canvas.width = 0;
    canvas.height = 0;

    setLoadingThumbnail(false);

    return dataUri;
  };

  function formatTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return formattedTime;
  }

  return (
    <div
      ref={ref}
      className={classes.controlsWrapper}
      tabIndex="0"
      
    >
       <Grid container direction="column" justify="space-between" style={{ flexGrow: 1 }}>
      <Grid
        container
        direction="column"
        justify="space-between"
        style={{ flexGrow: 1 }}
      >
        <Grid
          container
          direction="row"
          alignItems="center"
          justify="space-between"
          style={{ padding: 16 }}
        >
          <Grid item>
          <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton
              onClick={props.onBackButtonClick} // Replace with your actual back button logic
              className={classes.controlIcons}
              aria-label="back"
            >
              <ArrowBackIcon fontSize="inherit" />
            </IconButton>
            </Link>
          </Grid>
          <Grid item className={classes.videoTitle}>
            <Typography variant="h5" style={{ color: "#fff" }}>
             
            </Typography>
          </Grid>
          <Grid item>
            {/* <Button
              onClick={onBookmark}
              variant="contained"
              color="primary"
              startIcon={<BookmarkIcon />}
              className={classes.bookmarkButton}
            >
              Bookmark
            </Button> */}
          </Grid>
        </Grid>
        <Grid container direction="row" alignItems="center" justify="center">
          <IconButton
            onClick={onRewind}
            className={classes.controlIcons}
            aria-label="rewind"
          >
            <FastRewindIcon
              className={classes.controlIcons}
              fontSize="inherit"
            />
          </IconButton>
          <IconButton
  onClick={props.onPlayPauseClick}
  className={`${classes.bottomIcons} play-pause-button`}
>
  {playing ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
</IconButton>
          <IconButton
            onClick={onFastForward}
            className={classes.controlIcons}
            aria-label="forward"
          >
            <FastForwardIcon fontSize="inherit" />
          </IconButton>
        </Grid>
        {/* bottom controls */}
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          style={{ padding: 16 }}
        >
          <Grid item xs={12}>
            <PrettoSlider
              min={0}
              max={100}
              ValueLabelComponent={(props) => (
                <ValueLabelComponent {...props} value={elapsedTime} />
              )}
              aria-label="custom thumb label"
              value={played * 100}
              onChange={onSeek}
              onMouseDown={onSeekMouseDown}
              onChangeCommitted={onSeekMouseUp}
              onDuration={onDuration}
              onMouseMove={(e) => handleProgressBarHover(e)}
              onMouseEnter={() => setIsProgressBarHovered(true)}
              onMouseLeave={() => setIsProgressBarHovered(false)}
            />
            {isProgressBarHovered && thumbnail && (
              <div
                className={`${classes.thumbnail} ${classes.thumbnailAboveProgressBar}`}
                style={{
                  left: thumbnailPosition.left,
                  top: thumbnailPosition.top,
                  backgroundImage: `url(${thumbnail})`,
                }}
              >
                
                {!loadingThumbnail && (
                  <>
                    <Typography
                      variant="caption"
                      style={{ color: "#fff", textAlign: "center" }}
                    >
                      {formatTime(hoveredTime)}
                    </Typography>
                  </>
                )}
              </div>
            )}
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
            <IconButton
  onClick={props.onPlayPauseClick}
  className={`${classes.bottomIcons} play-pause-button`}
>
  {playing ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
</IconButton>


 
              <IconButton
                onClick={handleMute}
                className={`${classes.bottomIcons} ${classes.volumeButton}`}
              >
                {muted ? (
                  <VolumeMute fontSize="large" />
                ) : volume > 0.5 ? (
                  <VolumeUp fontSize="large" />
                ) : (
                  <VolumeDown fontSize="large" />
                )}
              </IconButton>

              <CustomSlider
               min={0}
               max={1}
               step={0.02}
               value={muted ? 0 : volume}
               onChange={onVolumeChange}
               aria-labelledby="input-slider"
               className={classes.volumeSlider}
               onMouseDown={onSeekMouseDown}
               onChangeCommitted={onVolumeSeekDown}
               onKeyDown={handleVolumeKeyDown}
              />
              <Button
                variant="text"
                onClick={onChangeDispayFormat}
              >
                <Typography
                  variant="body1"
                  style={{ color: "#fff", marginLeft: 16 ,}}
                >
                  {elapsedTime}/{totalDuration}
                </Typography>
              </Button>
            </Grid>
          </Grid>

          <Grid item>
            <Button
              onClick={handleClick}
              aria-describedby={id}
              className={classes.bottomIcons}
              variant="text"
            >
             <Typography style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
  {playbackRate}X
</Typography>
            </Button>

            <Popover
              container={ref.current}
              open={open}
              id={id}
              onClose={handleClose}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Grid container direction="column-reverse">
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <Button
                    key={rate}
                    onClick={() => onPlaybackRateChange(rate)}
                    variant="text"
                    
                    
                    
                  >
               <Typography style={{ color: rate === playbackRate ? "orangered" : "inherit", fontSize: '16px', fontWeight: 'bold' }}>
  {rate}X
</Typography>
                  </Button>
                ))}
              </Grid>
            </Popover>
            <Button
              onClick={onToggleFullScreen}
              className={classes.bottomIcons}
            >
              <FullScreen fontSize="large" />
            </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
});

Controls.propTypes = {
  onSeek: PropTypes.func,
  onSeekMouseDown: PropTypes.func,
  onSeekMouseUp: PropTypes.func,
  onDuration: PropTypes.func,
  onRewind: PropTypes.func,
  onPlayPause: PropTypes.func,
  onFastForward: PropTypes.func,
  onVolumeSeekDown: PropTypes.func,
  onVolumeChange: PropTypes.func,
  volume: PropTypes.number,
  muted: PropTypes.bool,
  onChangeDispayFormat: PropTypes.func,
  onPlaybackRateChange: PropTypes.func,
  onToggleFullScreen: PropTypes.func,
  onMute: PropTypes.func,
  playing: PropTypes.bool,
  played: PropTypes.number,
  elapsedTime: PropTypes.string,
  totalDuration: PropTypes.string,
  muted: PropTypes.bool,
  setVolume: PropTypes.func,
  onBookmark: PropTypes.func,
  playbackRate: PropTypes.number,
  playerRef: PropTypes.object,
  videoTitle: PropTypes.string, 
  bookmarks: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      // Add other properties as needed
    })
  ),
  onRemoveBookmark: PropTypes.func,

};

export default Controls;
