import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io("http://localhost:3000");

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);

  const createNewChat = () => {
    const newId = uuidv4();
    socket.emit("initialize_chat", newId);
    localStorage.setItem("uuid", newId);
    return newId;
  };

  const initializeChat = () => {
    var uuid = localStorage.getItem("uuid");
    if (uuid === null) {
      uuid = createNewChat();
    }
    fetch("http://localhost:3000/messages/" + uuid)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      });
  };

  const sendMessage = (message: string) => {
    var uuid = localStorage.getItem("uuid");
    socket.emit("message_emitted", { message, uuid });
  };

  useEffect(() => {
    socket.on("new_message", (data: Message) => {
      console.log("new_message", data);
      setMessages((msg) => (msg ? [...msg, data] : [data]));
    });

    initializeChat();
    return () => {
      socket.off();
    };
  }, []);

  return { messages, createNewChat, initializeChat, sendMessage };
};

type Message = {
  sender: string;
  message: string;
  date: string;
  id: number;
};
