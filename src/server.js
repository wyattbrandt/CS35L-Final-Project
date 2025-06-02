import { db } from "./firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 

export const sendSystemMessage = async ({ room, text }) => {
    return await addDoc(collection(db, "messages"), {
        text: text,
        createdAt: serverTimestamp(),
        user: "CHATG0D",
        room: room,
        uid: "system",
    });
};

export const uploadDrawing = async ({ room, image, user, uid }) => {
    return await addDoc(collection(db, "images"), {
        image: image,
        createdAt: serverTimestamp(),
        user: user,
        room: room,
        uid: uid,
    });
};

export const sendUserMessage = async ({ room, text, user, uid }) => {
    return await addDoc(collection(db, "messages"), {
        text: text,
        createdAt: serverTimestamp(),
        user: user,
        room: room,
        uid: uid,
    });
};