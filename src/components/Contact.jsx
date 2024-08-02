import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact({listing}) {
    const [landlord, setLandlord] = useState(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const fetchLandlord = async () => {
          try {
            const res = await fetch(`/api/user/${listing.userRef}`)
            const data = await res.json()
            setLandlord(data)
          } catch (error) {
            console.log(error)
          }
        }
        fetchLandlord()
      }, [listing.userRef])

    const onChange = (e) => {
    setMessage(e.target.value);
    }
  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-2'>
          <p>
            Contactar al usuario <span className='font-semibold'>{landlord.username}</span>{' '}
            por{' '}
            <span className='font-semibold'>{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name='message'
            id='message'
            rows='2'
            value={message}
            onChange={onChange}
            placeholder='Escribe un mensaje aqui...'
            className='w-full p-3 border rounded-lg'
          ></textarea>

          <Link
          to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
          className='p-3 text-center text-white uppercase rounded-lg bg-slate-700 hover:opacity-95'
          >
            Enviar mail          
          </Link>
        </div>
      )}
    </>
  )
}
