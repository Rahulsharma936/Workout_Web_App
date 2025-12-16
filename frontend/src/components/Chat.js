import React, { useState, useEffect } from 'react';

const Chat = ({ socket, username, room }) => {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        socket.off("receive_message").on("receive_message", (data) => {
            setMessageList((list) => [...list, data]);
        });
    }, [socket]);

    return (
        <div className="chat-window">
            <div className="chat-header">
                <p>Live Chat</p>
            </div>
            <div className="chat-body">
                <div className="message-container">
                    {messageList.map((messageContent, i) => {
                        return (
                            <div
                                key={i}
                                className="message"
                                id={username === messageContent.author ? "you" : "other"}
                            >
                                <div>
                                    <div className="message-content">
                                        <p>{messageContent.message}</p>
                                    </div>
                                    <div className="message-meta">
                                        <p id="time">{messageContent.time}</p>
                                        <p id="author">{messageContent.author}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    value={currentMessage}
                    placeholder="Hey..."
                    onChange={(event) => {
                        setCurrentMessage(event.target.value);
                    }}
                    onKeyPress={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
            <style jsx>{`
        .chat-window {
          width: 300px;
          height: 420px;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }
        .chat-header {
          height: 45px;
          border-radius: 8px 8px 0 0;
          background: #2563eb;
          position: relative;
          cursor: pointer;
        }
        .chat-header p {
          display: block;
          padding: 0;
          color: #fff;
          text-align: center;
          line-height: 45px;
          margin: 0;
          font-weight: bold;
        }
        .chat-body {
          height: calc(450px - (45px + 70px + 30px)); 
          padding: 10px;
          background: #f3f4f6;
          overflow-y: scroll;
        }
        .chat-body .message-container {
          width: 100%;
          height: 100%;
          overflow-y: scroll;
          overflow-x: hidden;
        }
        .chat-body .message {
          height: auto;
          padding: 10px;
          display: flex;
        }
        .chat-body .message .message-content {
          width: auto;
          height: auto;
          min-height: 40px;
          max-width: 120px;
          background-color: #43a047;
          border-radius: 5px;
          color: white;
          display: flex;
          align-items: center;
          margin-right: 5px;
          margin-left: 5px;
          padding-right: 5px;
          padding-left: 5px;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        #you {
          justify-content: flex-end;
        }
        #you .message-content {
          justify-content: flex-end;
          background-color: #2563eb;
        }
        #you .message-meta {
          justify-content: flex-end;
          margin-left: 5px;
        }
        #other {
          justify-content: flex-start;
        }
        #other .message-content {
          justify-content: flex-start;
          background-color: #4b5563;
        }
        #other .message-meta {
          justify-content: flex-start;
          margin-right: 5px;
        }
        .message-meta #author {
          margin-left: 10px;
          font-weight: bold;
        }
        .chat-body .message .message-meta {
          display: flex;
          font-size: 12px;
        }
        .chat-footer {
          height: 40px;
          border: 1px solid #263238;
          border-top: none;
          display: flex;
        }
        .chat-footer input {
          height: 100%;
          flex: 85%;
          border: 0;
          padding: 0 0.7em;
          font-size: 1em;
          border-right: 1px dotted #607d8b;
          outline: none;
          font-family: 'Open Sans', sans-serif;
        }
        .chat-footer button {
          border: 0;
          display: grid;
          place-items: center;
          cursor: pointer;
          flex: 15%;
          height: 100%;
          background: transparent;
          outline: none;
          font-size: 25px;
          color: lightgray;
        }
        .chat-footer button:hover {
          color: #43a047;
        }
      `}</style>
        </div>
    );
};

export default Chat;
