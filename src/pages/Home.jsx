import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings,setOfferListings] = useState([])
  const [saleListings,setSaleListings] = useState([])
  const [rentListings,setRentListings] = useState([])

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOfferListings();
  }, [])

  return (
    <div>

      {/* top */}
      <div className='flex flex-col max-w-6xl gap-6 px-3 mx-auto p-28'>
        <h1 className='text-3xl font-bold text-slate-700 lg:text-6xl'>
          Encuentra el lugar <span className='text-slate-500'>perfecto</span>
          <br/> 
          para vivir
        </h1>
        <div className='text-xs text-gray-400 sm:text-sm'>
          Inmobiliaria Argentina es el mejor lugar para encontrar tu proximo lugar para vivir
          <br/>
          Tenemos un amplio rango de propiedades para que encuentres la mejor para vos.
        </div>
        <Link to={"/search"} className='text-xs font-bold text-blue-800 sm:text-sm hover:underline'>
          Empieza ya...
        </Link>
      </div>

      {/* swiper */}
      <Swiper navigation>
        {offerListings &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            <SwiperSlide>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className='h-[500px]'
                key={listing._id}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* listing results for offer, sale and rent */}
      <div className='flex flex-col max-w-6xl gap-8 p-3 mx-auto my-10'>
        {offerListings && offerListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Ofertas recientes</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>Ver más ofertas</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Alquileres recientes</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>Ver más alquileres</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Últimos en venta</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=sale'}>Ver más en venta</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
      
    </div>
  )
}
