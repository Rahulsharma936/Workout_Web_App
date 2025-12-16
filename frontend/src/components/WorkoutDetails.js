import { useWorkoutsContext } from '../hooks/useWorkoutsContext'
import { useAuthContext } from '../hooks/useAuthContext'
import config from '../config'


import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const WorkoutDetails = ({ workout, onSchedule }) => {
  const { dispatch } = useWorkoutsContext()
  const { user } = useAuthContext()

  const handleClick = async () => {
    if (!user) {
      return
    }

    const response = await fetch(`${config.API_URL}/api/workouts/${workout._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    const json = await response.json()

    if (response.ok) {
      dispatch({ type: 'DELETE_WORKOUT', payload: json })
    }
  }

  return (
    <div className="workout-details">
      <h4>{workout.title}</h4>
      <p><strong>Exercises: </strong>{workout.exercises}</p>
      <p><strong>Duration: </strong>{workout.duration} min</p>
      <p>{formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })}</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        {onSchedule && (
          <button
            onClick={() => onSchedule(workout)}
            style={{
              background: '#3686ab',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add to My Workouts
          </button>
        )}
        <span className="material-symbols-outlined" onClick={handleClick}>delete</span>
      </div>
    </div>
  )
}

export default WorkoutDetails