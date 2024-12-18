import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { useRef, useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { app } from "../firebase"
import {updateUserStart , updateUserSuccess , updateUserFailure,deleteUserStart, deleteUserSuccess, deleteUserFailure,signOutUserStart,signOutUserSuccess,signOutUserFailure} from '../redux/user/userSlice'
import { Link } from "react-router-dom"

export default function Profile() {
  const {currentUser, loading, error} = useSelector((state) => state.user)
  const fileRef=useRef(null)
  const [file,setFile] = useState(undefined)
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState ({})
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false)
  const [userListings, setUserListings] = useState([])
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect (() => {
    if(file){
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setFilePerc(Math.round(progress))
      },
    (error)=>{
      setFileUploadError(true)
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        setFormData({...formData, avatar: downloadURL});
      });
    }
  );
  };

  const handleChange =  (e) => {
    setFormData({...formData, [e.target.id]: e.target.value})
  }

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try {
      dispatch(updateUserStart())
      const res = await fetch (`/api/user/update/${currentUser._id}`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if(data.success === false) {
        dispatch(updateUserFailure(data.message))
        return
      }
      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure(error.message))
    }
  }

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`,{
        method: 'DELETE'
      })
      const data = await res.json()
      if(data.success === false) {
        dispatch(deleteUserFailure(data.message))
        return
      }
      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignOut = async () =>{
    try {
      dispatch(signOutUserStart())
      const res = await fetch('api/auth/signout')
      const data = await res.json()
      if(data.success === false) {
        dispatch(signOutUserFailure(data.message))
        return
      }
      dispatch(signOutUserSuccess(data))
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
    }
  }
 const handleShowListings = async () => {
 try {
  setShowListingsError(false)
  const res = await fetch(`/api/user/listings/${currentUser._id}`)
  const data = await res.json()
  if(data.success === false) {
    setShowListingsError(true)
    return
  }
  setUserListings(data)
 } catch (error) {
  setShowListingsError(true)
 } 
 }
const handleListingDelete = async (listingId) => {
  try {
    const res = await fetch(`/api/listing/delete/${listingId}`,{
      method: 'DELETE',
    })
    const data = await res.json()
    if(data.success === false) {
      console.log(data.message)
      return
    }
    setUserListings((prev)=> prev.filter((listing) => listing._id !== listingId))
  } catch (error) {
    console.log(error.message)
  }
}

  return (
    <div className="max-w-lg p-3 mx-auto">
      <h1 className='text-3xl font-semibold text-center my-7'>Perfil</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept='image/*' />
        <img src={formData.avatar || currentUser.avatar} alt="profile" className="self-center object-cover w-24 h-24 mt-2 rounded-full cursor-pointer" onClick={() => fileRef.current.click()} />
        <p className="self-center text-sm">
          {fileUploadError?
          (<span className="text-red-700">Error al subir imagen (Debe pesar menos de 2 mb)</span>) :
          filePerc > 0 && filePerc < 100 ? (
            <span>{`Uploading ${filePerc}%`}</span>) :
            filePerc === 100 ? (
              <span className="text-green-700">Imagen cargada correctamente</span>)
              :
              ""
        }
        </p>
        <input type="text" placeholder="username" className="p-3 border rounded-lg" id='username' defaultValue={currentUser.username}  onChange={handleChange}/>
        <input type="text" placeholder="email" className="p-3 border rounded-lg" id='email' defaultValue={currentUser.email} onChange={handleChange}/>
        <input type="password" placeholder="password" className="p-3 border rounded-lg" id='password' onChange={handleChange}/>
        <button disabled={loading} className="p-3 text-white uppercase rounded-lg bg-slate-700 hover:opacity-95 disable:opacity-80">
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link className="p-3 text-center text-white uppercase bg-green-700 rounded-lg hover:opacity-95" to={"/create-listing"}>
          Crear inmueble 
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-500 cursor-pointer">Borrar cuenta</span>
        <span onClick={handleSignOut} className="text-red-500 cursor-pointer">Cerrar sesión</span>
      </div>
      <p className="mt-5 text-red-700">{error ? error : ""}</p>
      <p className="mt-5 text-green-700">{updateSuccess ? 'User is updated successfully' : ""}</p>
      <button onClick={handleShowListings} className="w-full text-green-700">
        Show listings
      </button>
      <p className="mt-5 text-red-700">{showListingsError ? 'Error showing listings' : ""}</p>
      {userListings && userListings.length > 0 &&
      <div className="flex flex-col gap-4"> 
        <h1 className="text-2xl font-semibold text-center mt-7">Tus inmuebles</h1>
      {userListings.map((listing) => (
        <div key={listing._id} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
          <Link to={`/listing/${listing._id}`}>
            <img src={listing.imageUrls[0]} alt="listing cover" className="object-contain w-16 h-16"/>
          </Link>
          <Link className="flex-1 font-semibold truncate text-slate-700 hover:underline" to={`/listing/${listing._id}`}>
          <p>{listing.name}</p>
          </Link>
          <div className="flex flex-col items-center">
            <button onClick={() => handleListingDelete(listing._id)} className="text-red-700 uppercase">
              Borrar
            </button>
            <Link to={`/update-listing/${listing._id}`}>
            <button className="text-green-700 uppercase">
              Editar
            </button>
            </Link>
          </div>
        </div>
      ))}
      </div>}
    </div>
  )
}
