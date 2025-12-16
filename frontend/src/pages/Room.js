import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from '../components/Chat';
import { useAuthContext } from '../hooks/useAuthContext';

import config from '../config';

let socket;

const Room = () => {
    const { roomId } = useParams();
    const { user } = useAuthContext();
    const [roomName, setRoomName] = useState('Room');



    useEffect(() => {

        const ENDPOINT = config.API_URL || 'http://localhost:4000';
        socket = io(ENDPOINT);

        if (user) {
            socket.emit('join_room', roomId);
        }

        return () => {
            socket.disconnect();
        }
    }, [roomId, user]);

    if (!user) {
        return <div>Please login to join a room.</div>
    }

    return (
        <div style={{ padding: '20px', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <div style={{ flex: 1, maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '20px' }}>Workout Room: {roomId}</h2>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h3>Participating in workout...</h3>
                    <p style={{ marginTop: '10px' }}>
                        Here you could sync exercises or timers!
                    </p>
                </div>
            </div>

            <div>
                <Chat socket={socket} username={user.email} room={roomId} />
            </div>
        </div>
    );
};

export default Room;
