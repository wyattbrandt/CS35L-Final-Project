import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Helmet } from "react-helmet";
import "./styles/App.css";
import Login from "./Login";
import RoomSelect from "./RoomSelect";
import Chatroom from "./Chatroom";
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';
import { Drawings } from './components/Drawings';
import { signOut } from 'firebase/auth';
import { addDoc, serverTimestamp, collection } from 'firebase/firestore';
import Cookies from 'universal-cookies';
import { auth, db } from "./firebase-config";
import doraemonGif from './assets/doraemon.gif';

const cookies = new Cookies();
const colors = [
  "#ff0000", // red
  "#ffa500", // orange
  "#ffff00", // yellow
  "#008000", // green
  "#0000ff", // blue
  "#800080", // purple
  "#ffc0cb", // pink
  "#a52a2a", // brown
  "#000000", // black
];

let newUsername = "";

function App() {
  const [opacity, setOpacity] = useState(1); 
  const [selectedTool, setSelectedTool] = useState("pencil");
  const [lastDrawTool, setLastDrawTool] = useState("pencil"); 
  const [selectedColor, setSelectedColor] = useState("black");
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);

  const roomInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const fullscreenCanvasRef = useRef(null);

  const messagesRef = collection(db, "messages");
  const imagesRef = collection(db, "images");

  const uid = auth.currentUser?.uid || cookies.get("uid");

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAuth(true);
        cookies.set("auth-token", currentUser.accessToken);
        cookies.set("uid", currentUser.uid);
      } else {
        setIsAuth(false);
        cookies.remove("auth-token");
        cookies.remove("uid");
      }
    });

    return () => unsubscribe();
  }, []);

  const strokeWidths = {
    pen: 0.3,
    pencil: 3.0,
    marker: 5.0,
    brush: 7.5,
  };

  const getActiveCanvas = () => 
    fullscreenMode ? fullscreenCanvasRef.current : canvasRef.current;

  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };

  const startDrawing = (e) => {
    setDrawing(true);

    const canvas = getActiveCanvas(); 
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current = ctx;

    if (selectedTool !== "eraser") {
      ctx.lineWidth = strokeWidths[selectedTool] || 1.0;
      ctx.strokeStyle = convertToRGBA(selectedColor, opacity);
    }
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (selectedTool === "eraser") {
      ctx.clearRect(x - 10, y - 10, 20, 20);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath(); // Important: reset path for next move
      ctx.moveTo(x, y); // Move the "pen" to current mouse position
    }
  };

  const stopDrawing = () => {
    setDrawing(false);
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const switchToPencil = () => {
    setSelectedTool("pencil");
  };

  const switchToEraser = () => {
    setSelectedTool("eraser");
  };

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    cookies.remove("uid");
    setIsAuth(false);
    if(room){
      leaveRoom();
    }
    setRoom(null);
  };

  const changeName = () => {
    newUsername = nameInputRef.current.value;
    cookies.set("username", newUsername);
  };

  const leaveRoom = async (e) => {
    await addDoc(messagesRef, {
      text: cookies.get("username") + " left chat",
      createdAt: serverTimestamp(),
      user: "CHATG0D",
      room: room,
      uid: "IgFDnls934dsyhs3otFHIRe87uV2",
    });
    setRoom(null);
  };

  const joinRoom = async (e) => {
    const roomValue = roomInputRef.current.value;
    setRoom(roomValue);

    console.log("JOINED ROOM");
    await addDoc(messagesRef, {
      text: cookies.get("username") + " joined chat",
      createdAt: serverTimestamp(),
      user: "CHATG0D",
      room: roomValue,
    });
  };

  const saveCanvasImage = async () => {
    const canvas = getActiveCanvas();
    if (!canvas) return; 

    const imageDataUrl = canvas.toDataURL("image/png");
    await addDoc(imagesRef, {
      image: imageDataUrl,
      createdAt: serverTimestamp(),
      user: cookies.get("username"),
      room: room,
      uid: uid,
    });
    clearCanvas();
  };

  const convertToRGBA = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  };

  // Loading state
  if (loading) return <div>Loading...</div>;

  // Not authenticated - show Auth component
  if (!isAuth) {
    return (
      <div>
        <Auth setIsAuth={setIsAuth}/>
      </div>
    );
  }

  // Fullscreen mode
  if (fullscreenMode) {
    return (
      <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
        {/* Sidebar with tools and colors */}
        <div
          className="tool-sidebar"
          style={{
            width: "200px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <button onClick={() => setSelectedTool("pen")}>Pen</button>
          <button onClick={() => setSelectedTool("pencil")}>Pencil</button>
          <button onClick={() => setSelectedTool("marker")}>Marker</button>
          <button onClick={() => setSelectedTool("brush")}>Paint Brush</button>
          <button onClick={() => setSelectedTool("eraser")}>Eraser</button>

          <div className="color-buttons" style={{ marginTop: "10px" }}>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                style={{
                  backgroundColor: c,
                  color: c === "yellow" ? "black" : "white",
                  border: selectedColor === c ? "2px solid #333" : "none",
                  margin: "2px",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "10px" }}>
            <label htmlFor="opacity-slider">Opacity:</label>
            <input
              id="opacity-slider"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ marginLeft: "10px" }}
            />
            <span style={{ marginLeft: "8px" }}>{opacity}</span>
          </div>

          <button onClick={clearCanvas} style={{ marginTop: "10px" }}>
            Clear
          </button>
          <button onClick={saveCanvasImage} style={{ marginTop: "10px" }}>
            Send Drawing
          </button>
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => setFullscreenMode(false)}>Back</button>
          </div>
        </div>

        {/* Fullscreen Canvas */}
        <canvas
          ref={fullscreenCanvasRef}
          width={window.innerWidth - 200} // subtract sidebar width
          height={window.innerHeight}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ display: "block", flexGrow: 1 }}
        />
      </div>
    );
  }

  // Main app with routing
  return (
    <>
      <Helmet>
        <link rel="icon" href="assets/bluebladee.png"/>
        <title>1000words</title>
      </Helmet>

      <Router>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/rooms" replace /> : <Login />}
          />
          <Route
            path="/rooms"
            element={
              user ? (
                room ? (
                  <div className="main-room">
                    <div className="drawing-area">
                      <div className="drawings-scroll">
                        <Drawings room={room} />
                      </div>

                      <div className="canvas-controls">
                        <canvas
                          ref={canvasRef}
                          width={550}
                          height={250}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                        />
                        
                        <div className="tools">
                          <button onClick={() => setSelectedTool("pen")}>Pen</button>
                          <button onClick={() => setSelectedTool("pencil")}>Pencil</button>
                          <button onClick={() => setSelectedTool("marker")}>Marker</button>
                          <button onClick={() => setSelectedTool("brush")}>Paint Brush</button>
                          <button onClick={() => setSelectedTool("eraser")}>Eraser</button>

                          <label htmlFor="opacity">Opacity:</label>
                          <input
                            id="opacity"
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                          />
                          <span>{opacity}</span>

                          <div className="color-buttons">
                            {colors.map((c) => (
                              <button
                                key={c}
                                onClick={() => setSelectedColor(c)}
                                style={{
                                  backgroundColor: c,
                                  color: c === "yellow" ? "black" : "white",
                                  border: selectedColor === c ? "2px solid #333" : "none",
                                  marginRight: "5px",
                                  padding: "5px 10px",
                                  borderRadius: "5px"
                                }}
                              >
                                {c}
                              </button>
                            ))}
                          </div>

                          <button onClick={() => setFullscreenMode(true)}>Fullscreen Mode</button>
                          <button onClick={clearCanvas}>Clear</button>
                          <button onClick={saveCanvasImage}>Send Drawing</button>
                          <button onClick={leaveRoom}>Leave Room ☘︎</button>

                          <div className="sign-out">
                            <button onClick={signUserOut}>Sign Out</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="chat-area">
                      <Chat room={room} />
                    </div>    
                  </div>
                ) : (
                  <div className="room">
                    <label>
                      ᓚ₍⑅^- .-^₎ -ᶻ 𝗓 𐰁✧ <br></br>
                      Enter Room Name:
                    </label>
                    <input ref={roomInputRef}/>
                    
                    <button onClick={joinRoom}> ≽^•⩊•^≼ enter chatroom ₍^. .^₎⟆</button>
                    <label>
                      <br></br>
                      Enter Username:
                    </label>
                    <input ref={nameInputRef}/>
                    
                    <button onClick={changeName}> submit name ＊*•̩̩͙✩•̩̩͙*˚</button>
                    <div className="button-container">
                      <div className="sign-out">
                        <button onClick={() => setRoom("lobby1")}>Room1</button>
                        <button onClick={() => setRoom("lobby2")}>Room2</button>
                        <button onClick={() => setRoom("lobby3")}>Room3</button>
                        <button onClick={() => setRoom("lobby4")}>Room4</button>
                        <button onClick={signUserOut}>sign out</button>
                      </div>
                    </div>
                    <div className="gif-container">
                      <img src={doraemonGif} alt="Doraemon" className="doraemon"></img>
                    </div>
                  </div>
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/chat" element={<Chatroom />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;