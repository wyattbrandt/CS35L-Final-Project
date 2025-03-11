import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

export const Chat = (props) => {
    const {room} = props;
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesRef = collection(db, "messages");

    useEffect(() => {
        const queryMessages = query(messagesRef, where("room", "==", room), orderBy("createdAt"));
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            let messages = [];
            snapshot.forEach((doc) => {
                messages.push({...doc.data(), id: doc.id})
            });
            setMessages(messages);
        });
        //Clean-up
        return () => unsubscribe();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(newMessage === "") return;

        await addDoc(messagesRef, {
            text: newMessage,
            createdAt: serverTimestamp(),
            user: auth.currentUser.displayName,
            room: room,
        });

        setNewMessage("");
    };

    return <div className="chat-app"> 
        {/* <div className="header"> */}
            <h2>{room}</h2>
        {/* </div> */}
        <div className="messages"> 
            {messages.map((message) => 
            <div className = "message" key={message.id}>
                <span className="user">{message.user}</span>
                : {message.text}
            </div>)}
        </div>

        <form onSubmit={handleSubmit} className="new-message-form">
            <input 
                className="new-message-input" 
                placeholder="chat chat chat°❀⋆.ೃ࿔*:･"
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
            />
            <button type="submit" className="send-button">
                send
            </button>
        </form>
    </div>
};