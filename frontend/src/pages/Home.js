import React, { useState, useEffect } from 'react';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import { useWorkoutsContext } from "../hooks/useWorkoutsContext"
import { useAuthContext } from "../hooks/useAuthContext"


import WorkoutDetails from '../components/WorkoutDetails'
import WorkoutForm from '../components/WorkoutForm'

const Home = () => {
  const { workouts, dispatch } = useWorkoutsContext()
  const { user } = useAuthContext()
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('allworkouts');
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [timers, setTimers] = useState({});
  const [isRunning, setIsRunning] = useState({});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  useEffect(() => {
    const fetchWorkouts = async () => {
      const response = await fetch(`${config.API_URL}/api/workouts`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json()

      if (response.ok) {
        dispatch({ type: 'SET_WORKOUTS', payload: json })
      }
    }

    if (user) {
      fetchWorkouts()
    }
  }, [dispatch, user])


  const fetchRooms = async () => {
    const response = await fetch(`${config.API_URL}/api/rooms`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    const json = await response.json()

    if (response.ok) {
      setRooms(json)
    }
  }

  useEffect(() => {
    if (activeTab === 'community' && user) {
      fetchRooms();
    }
  }, [activeTab, user]);

  const handleCreateRoom = async () => {
    if (!newRoomName) return;

    const response = await fetch(`${config.API_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ name: newRoomName })
    });
    const json = await response.json();

    if (response.ok) {
      setNewRoomName('');
      fetchRooms();
    }
  };

  const joinRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  }


  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        Object.keys(isRunning).forEach(id => {
          if (isRunning[id] && updated[id] > 0) {
            updated[id] = updated[id] - 1;
            if (updated[id] === 0) {
              alert('Workout Complete! 🎉');
              completeWorkout(parseInt(id));
            }
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);


  const openDaySelector = (workout) => {
    setSelectedWorkout(workout);
    setShowDaySelector(true);
  };


  const scheduleWorkout = (day) => {
    const scheduled = {
      ...selectedWorkout,
      scheduledDay: day,
      myWorkoutId: Date.now()
    };
    setMyWorkouts([...myWorkouts, scheduled]);
    setTimers({ ...timers, [scheduled.myWorkoutId]: scheduled.duration * 60 });
    setShowDaySelector(false);
    alert(`Added to ${day}!`);
  };


  const deleteScheduled = (id) => {
    setMyWorkouts(myWorkouts.filter(w => w.myWorkoutId !== id));
  };


  const getTodayName = () => {
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysMap[new Date().getDay()];
  };


  const getTodayWorkouts = () => {
    return myWorkouts.filter(w => w.scheduledDay === getTodayName());
  };


  const startTimer = (id) => {
    setIsRunning({ ...isRunning, [id]: true });
  };

  const pauseTimer = (id) => {
    setIsRunning({ ...isRunning, [id]: false });
  };

  const resetTimer = (id) => {
    const workout = myWorkouts.find(w => w.myWorkoutId === id);
    setTimers({ ...timers, [id]: workout.duration * 60 });
    setIsRunning({ ...isRunning, [id]: false });
  };

  const completeWorkout = (id) => {
    const workout = myWorkouts.find(w => w.myWorkoutId === id);
    if (workout) {
      setCompletedWorkouts([...completedWorkouts, { ...workout, date: new Date() }]);
      deleteScheduled(id);
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  const getStats = () => {
    const weekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    const weeklyCompleted = completedWorkouts.filter(w => w.date.getTime() >= weekAgo);
    const totalMinutes = weeklyCompleted.reduce((sum, w) => sum + w.duration, 0);

    return {
      thisWeek: weeklyCompleted.length,
      totalMinutes: totalMinutes,
      scheduled: myWorkouts.length,
      total: workouts ? workouts.length : 0
    };
  };

  return (
    <div className="home-container">
      <div className="home">


        <div className="tabs-container" style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('allworkouts')}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderBottom: activeTab === 'allworkouts' ? '3px solid #2563eb' : 'none',
                color: activeTab === 'allworkouts' ? '#2563eb' : '#6b7280'
              }}
            >
              All Workouts
            </button>
            <button
              onClick={() => setActiveTab('myworkouts')}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderBottom: activeTab === 'myworkouts' ? '3px solid #2563eb' : 'none',
                color: activeTab === 'myworkouts' ? '#2563eb' : '#6b7280'
              }}
            >
              My Workouts
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderBottom: activeTab === 'analysis' ? '3px solid #2563eb' : 'none',
                color: activeTab === 'analysis' ? '#2563eb' : '#6b7280'
              }}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('community')}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderBottom: activeTab === 'community' ? '3px solid #2563eb' : 'none',
                color: activeTab === 'community' ? '#2563eb' : '#6b7280'
              }}
            >
              Community
            </button>
          </div>
        </div>


        {activeTab === 'allworkouts' && (
          <>
            <div className="workouts">
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>All Workouts</h2>
              {workouts && workouts.map((workout) => (
                <WorkoutDetails key={workout._id} workout={workout} onSchedule={openDaySelector} />
              ))}
            </div>
            <div className="workout-form">
              <WorkoutForm />
            </div>
          </>
        )}


        {activeTab === 'myworkouts' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>My Workouts</h2>

            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
              Today's Workouts ({getTodayName()})
            </h3>

            {getTodayWorkouts().length === 0 ? (
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280',
                marginBottom: '20px'
              }}>
                No workouts for today. Schedule from "All Workouts"!
              </div>
            ) : (
              getTodayWorkouts().map(workout => (
                <div key={workout.myWorkoutId} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{workout.title}</h3>
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0' }}>{workout.exercises}</p>
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {workout.duration} min
                      </span>
                    </div>
                    <button
                      onClick={() => deleteScheduled(workout.myWorkoutId)}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        height: 'fit-content'
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
                      {formatTime(timers[workout.myWorkoutId] || 0)}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {!isRunning[workout.myWorkoutId] ? (
                        <button
                          onClick={() => startTimer(workout.myWorkoutId)}
                          style={{
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Start
                        </button>
                      ) : (
                        <button
                          onClick={() => pauseTimer(workout.myWorkoutId)}
                          style={{
                            background: '#ca8a04',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Pause
                        </button>
                      )}
                      <button
                        onClick={() => resetTimer(workout.myWorkoutId)}
                        style={{
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => completeWorkout(workout.myWorkoutId)}
                        style={{
                          background: '#7c3aed',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}


            <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '600', marginBottom: '10px' }}>All Scheduled Workouts</h4>
              {myWorkouts.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No scheduled workouts yet.</p>
              ) : (
                days.map(day => {
                  const dayWorkouts = myWorkouts.filter(w => w.scheduledDay === day);
                  if (dayWorkouts.length === 0) return null;
                  return (
                    <div key={day} style={{ fontSize: '14px', marginBottom: '5px' }}>
                      <strong>{day}:</strong> {dayWorkouts.map(w => w.title).join(', ')}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}


        {activeTab === 'analysis' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Analysis</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>
                  {getStats().thisWeek}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Workouts This Week</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>
                  {getStats().totalMinutes}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Minutes This Week</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>
                  {getStats().scheduled}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Scheduled Workouts</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ea580c' }}>
                  {getStats().total}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Workouts</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Recent Completions</h3>
              {completedWorkouts.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No completed workouts yet!</p>
              ) : (
                completedWorkouts.slice(-5).reverse().map((w, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{w.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {w.date.toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      height: 'fit-content'
                    }}>
                      {w.duration} min
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Weekly Goal</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
                Target: 5 workouts per week
              </p>
              <div style={{
                width: '100%',
                height: '20px',
                background: '#e5e7eb',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min((getStats().thisWeek / 5) * 100, 100)}%`,
                  height: '100%',
                  background: '#2563eb',
                  transition: 'width 0.5s'
                }}></div>
              </div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '10px' }}>
                {getStats().thisWeek} / 5 completed
              </p>
            </div>
          </div>
        )}


        {activeTab === 'community' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Community Rooms</h2>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px'
            }}>
              <input
                type="text"
                placeholder="New Room Name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <button
                onClick={handleCreateRoom}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Room
              </button>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Active Rooms</h3>

            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {rooms && rooms.map(room => (
                <div key={room._id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{room.name}</h4>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
                    Host ID: {room.host ? room.host.substring(0, 8) + '...' : 'Unknown'}
                  </p>
                  <button
                    onClick={() => joinRoom(room._id)}
                    style={{
                      width: '100%',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Join Room
                  </button>
                </div>
              ))}
              {rooms.length === 0 && (
                <p style={{ color: '#6b7280' }}>No active rooms used. Create one!</p>
              )}
            </div>
          </div>
        )}
      </div>


      {showDaySelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              Select a Day
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Schedule "{selectedWorkout?.title}" for:
            </p>

            {days.map(day => (
              <button
                key={day}
                onClick={() => scheduleWorkout(day)}
                style={{
                  width: '100%',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                {day}
              </button>
            ))}

            <button
              onClick={() => setShowDaySelector(false)}
              style={{
                width: '100%',
                background: '#d1d5db',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;