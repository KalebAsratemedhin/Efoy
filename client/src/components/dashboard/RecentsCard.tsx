
const RecentsCard = () => {
  return (
    <div className='bg-white rounded-md shadow-md p-4 min-w-72'>
        <div className='flex gap-3'>
          <p>Doctor: </p> <p>Alemu K.</p>
          
        </div>

        <div  className='flex gap-3'>
          <p>Date: </p> <p>{new Date().toDateString()}</p>
        </div>

        <div  className='flex gap-3'>
          <p>Reason: </p> <p>Hod kurtet</p>
        </div>
          
    </div>
  )
}

export default RecentsCard