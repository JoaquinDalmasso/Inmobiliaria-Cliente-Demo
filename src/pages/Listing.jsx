import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {Swiper, SwiperSlide} from 'swiper/react'
import SwiperCore from 'swiper'
import {Navigation} from 'swiper/modules'
import 'swiper/css/bundle'
import Contact from "../components/Contact"
import { 
    FaBath,
    FaBed,
    FaChair,
    FaMapMarkerAlt,
    FaParking,
    FaShare,
} from "react-icons/fa"
import { useSelector } from "react-redux"

export default function Listing() {
    SwiperCore.use([Navigation])
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [copied, setCopied] = useState(false);
    const [contact, setContact] = useState(false);
    const params = useParams()
    const { currentUser } = useSelector((state) => state.user);

    useEffect(()=>{
        const fetchListing= async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/listing/get/${params.listingId}`)
                const data = await res.json()
                if(data.success === false){
                    setError(true)
                    setLoading(false)
                    return
                }
                setListing(data)
                setLoading(false)
                setError(false)
            } catch (error) {
                setError(true)
                setLoading(false)
            }
            
        }
        fetchListing()
    }, [params.listingId])
  return (
    <main>
        {loading && <p className="text-2xl text-center my-7">Loading...</p>}
        {error && <p className="text-2xl text-center my-7">Someting went wrong</p>}
        {listing && !loading && !error && (
            
            <div>
                <Swiper navigation>
                    {listing.imageUrls.map((url) => (
                        <SwiperSlide key={url}>
                            <div className="h-[550px]" style={{background: `url(${url}) center no-repeat`, backgroundSize:'cover'}}></div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
                    <FaShare 
                        className='text-slate-500'
                        onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => {
                            setCopied(false);
                        }, 2000);
                        }}
                    />
                </div>
                {copied && (
                    <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2'>
                        Link copiado!
                    </p>
                )}
                <div className='flex flex-col max-w-4xl gap-4 p-3 mx-auto my-7'>
                    <p className='text-2xl font-semibold'>
                        {listing.name} - ${' '}
                        {listing.offer
                            ? listing.discountPrice.toLocaleString('en-US')
                            : listing.regularPrice.toLocaleString('en-US')}
                        {listing.type === 'rent' && ' / month'}
                    </p>
                    <p className='flex items-center gap-2 mt-6 text-sm text-slate-600'>
                        <FaMapMarkerAlt className='text-green-700' />
                        {listing.address}
                    </p>
                    <div className='flex gap-4'>
                        <p className='bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                            {listing.type === 'rent' ? 'Se alquila' : 'En venta'}
                        </p>
                        {listing.offer && (
                            <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                            ${+listing.regularPrice - +listing.discountPrice} OFF
                            </p>
                        )}
                    </div>
                    <p className='text-slate-800'>
                        <span className='font-semibold text-black'>Descripción - </span>
                        {listing.description}
                    </p>
                    <ul className='flex flex-wrap items-center gap-4 text-sm font-semibold text-green-900 sm:gap-6'>
                        <li className='flex items-center gap-1 whitespace-nowrap '>
                            <FaBed className="text-lg" />
                            {listing.bedrooms > 1 ? `${listing.bedrooms} camas`: `${listing.bedrooms} cama`}
                        </li>
                        <li className='flex items-center gap-1 whitespace-nowrap '>
                            <FaBath className='text-lg' />
                            {listing.bathrooms > 1
                            ? `${listing.bathrooms} baños `
                            : `${listing.bathrooms} baño `}
                        </li>
                        <li className='flex items-center gap-1 whitespace-nowrap '>
                            <FaParking className='text-lg' />
                            {listing.parking ? 'Con Cochera' : 'Sin Cochera'}
                        </li>
                        <li className='flex items-center gap-1 whitespace-nowrap '>
                            <FaChair className='text-lg' />
                            {listing.furnished ? 'Amoblado' : 'Sin Amoblar'}
                        </li>
                    </ul>
                    {currentUser && listing.userRef !== currentUser._id && !contact && (
                    <button
                        onClick={() => setContact(true)}
                        className='p-3 text-white uppercase rounded-lg bg-slate-700 hover:opacity-95'
                    >
                        Contacto del vendedor
                    </button>
                    )}
                    {contact && <Contact listing={listing} />}
                </div>
            </div>
        )}
    </main>
  )
}
