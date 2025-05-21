import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { Helmet } from "react-helmet";
import "./styles/App.css";
import Login from "./Login";
import RoomSelect from "./RoomSelect";
import Chatroom from "./Chatroom";

function App() {
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const roomInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");

  const messagesRef = collection(db, "messages");
  const imagesRef = collection(db, "images");

  const uid = auth.currentUser?.uid || cookies.get("uid");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };

  const strokeWidths = {
    pen: 0.3,
    pencil: 3.0,
    marker: 5.0,
    brush: 7.5,
  };

  const startDrawing = (e) => {
    setDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current = ctx;

    if (tool !== "eraser") {
      ctx.lineWidth = strokeWidths[tool] || 1.0;
      ctx.strokeStyle = color;
    }
  };


  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;


    if (tool === "eraser") {
      ctx.clearRect(
        e.nativeEvent.offsetX - 10,
        e.nativeEvent.offsetY - 10,
        20,
        20
      );
    } else {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };


  const stopDrawing = () => {
    setDrawing(false);
  };


  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };


  const switchToPencil = () => {
    setTool("pencil");
  };


  const switchToEraser = () => {
    setTool("eraser");
  };
  

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    if(room){
      leaveRoom();
    }
    setRoom(null);
  };

  const changeName = () => {
    newUsername = nameInputRef.current.value;
    cookies.set("username", newUsername);
  }

  const leaveRoom = async (e) => {
    await addDoc(messagesRef, {
      text: cookies.get("username") + " left chat",
      createdAt: serverTimestamp(),
      user: "CHATG0D",
      room: room,
      uid: "IgFDnls934dsyhs3otFHIRe87uV2",
    });
    setRoom(null);
  }

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
  }

  const saveCanvasImage = async () => {
    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL("image/png");
    await addDoc(imagesRef, {
      image: imageDataUrl,
      createdAt:serverTimestamp(),
      user: cookies.get("username"),
      room: room,
      uid: uid,
    });
    clearCanvas();
  }
if (loading) return <div>Loading...</div>; // or a spinner

  if(!isAuth){
    return (
      <div>
        <Auth setIsAuth={setIsAuth}/>
      </div>
      );
  }
  if (fullscreenMode) {
    return (
      <div className="fullscreen-canvas" style={{ display: "flex", height: "100vh", backgroundColor: "white" }}>
        
       {/* Sidebar with tools and colors */}
        <div className="tool-sidebar" style={{ width: "200px", padding: "10px", backgroundColor: "#f5f5f5" }}>
          <button onClick={() => setTool("pen")}>Pen</button>
          <button onClick={() => setTool("pencil")}>Pencil</button>
          <button onClick={() => setTool("marker")}>Marker</button>
          <button onClick={() => setTool("brush")}>Paint Brush</button>
          <button onClick={() => setTool("eraser")}>Eraser</button>
  
          <div className="color-buttons" style={{ marginTop: "10px" }}>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  backgroundColor: c,
                  color: c === "yellow" ? "black" : "white",
                  border: color === c ? "2px solid #333" : "none",
                  margin: "2px",
                  padding: "5px 10px",
                  borderRadius: "4px"
                }}
              >
                {c}
              </button>
            ))}
          </div>
  
          <button onClick={clearCanvas} style={{ marginTop: "10px" }}>Clear</button>
          <button onClick={saveCanvasImage}>Send Drawing</button>
          <div style={{ marginTop: "20px" }}>
              <button onClick={() => setFullscreenMode(false)}>Back</button>
          </div>
          </div>
  
        {/* Fullscreen canvas */}
        <canvas
          ref={canvasRef}
          width={window.innerWidth - 200}
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
  

  if (loading) return <div>Loading...</div>; // or a spinner

  return (
      <>
      <Helmet>
        <link rel="icon" href="assets/bluebladee.png"/>
        <link rel="stylesheet" href="./App.css" />
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
      <button onClick={() => setTool("pen")}>Pen</button>
      <button onClick={() => setTool("pencil")}>Pencil</button>
      <button onClick={() => setTool("marker")}>Marker</button>
      <button onClick={() => setTool("brush")}>Paint Brush</button>
      <button onClick={() => setTool("eraser")}>Eraser</button>

      <div className="color-buttons">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              backgroundColor: c,
              color: c === "yellow" ? "black" : "white",
              border: color === c ? "2px solid #333" : "none",
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
        <div class="room">
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
           <div class="button-container">
              <div className="sign-out">
              <button onClick={() => setRoom("lobby1")}>Room1</button>
              <button onClick={() => setRoom("lobby2")}>Room2</button>
              <button onClick={() => setRoom("lobby3")}>Room3</button>
              <button onClick={() => setRoom("lobby4")}>Room4</button>


                <button onClick={signUserOut}>sign out</button>
              </div>
            </div>
            <div class = "gif-container">
              <img src ={doraemonGif} alt="Doraemon" class="doraemon"></img>
            </div>
        </div>
        )
        ):(
         <Navigate to="/" replace />
        )}
        />
        <Route path="/chat" element={<Chatroom />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;