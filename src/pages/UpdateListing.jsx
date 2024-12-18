import { useEffect, useState } from "react"
import { getStorage, getDownloadURL,ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

export default function UpdateListing() {
    const {currentUser} = useSelector(state => state.user)
    const navigate = useNavigate()
    const params = useParams()
    const [files, setFiles] = useState([])
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
        vr: false
    })
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        const fetchListing = async () => {
            const listingId = params.listingId
            const res = await fetch(`/api/listing/get/${listingId}`)
            const data = await res.json()
            if(data.success === false){
                console.log(data.message)
                return
            }
            setFormData(data)
        }

        fetchListing()
    },[])

    const handleImageSubmit = (e) => {
        if(files.length > 0 && files.length + formData.imageUrls.length < 7){
            setUploading(true)
            setImageUploadError(false)
            const promises = [];
            for (let i=0; i < files.length; i++){
                promises.push(storeImage(files[i]))
            }
            Promise.all(promises).then((urls)=>{
                setFormData({...formData, imageUrls: formData.imageUrls.concat(urls)})
                setImageUploadError(false)
                setUploading(false)
            }).catch((err) => {
                setImageUploadError('Image upload failed (2 mb max per image)')
                setUploading(false)
            })
        }else{
            setImageUploadError('You can only upload 6 images per listing')
            setUploading(false)
        }
    }

    const storeImage = async (file) => {
        return new Promise ((resolve,reject) => {
            const storage = getStorage(app)
            const fileName = new Date().getTime() + file.name
            const storageRef = ref(storage, fileName)
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) *100
                    console.log(`Upload is ${progress}%`)
                },
                (error) => {
                    reject(error)
                },
                ()=>{
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL)
                    })
                }
            )
        })
    }
    const handleRemoveImage = (index) =>{
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i)=> i !== index),
        })
    }
    const handleChange = (e) => {
        if(e.target.id === 'sale' || e.target.id === 'rent'){
            setFormData({
                ...formData,
                type: e.target.id
            })
        }
        if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer' || e.target.id === 'vr'){
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked
            })
        }
        if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea'){
            setFormData({
                ...formData,
                [e.target.id]: e.target.value,
            })
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if(formData.imageUrls.length < 1) return setError('You must upload at least one image')
            if(+formData.regularPrice < +formData.discountPrice) return setError('Discount price must be lower than regular price')
                setLoading(true)
            setError(false)
            console.log(params.listingId)
            const res = await fetch(`/api/listing/update/${params.listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id}
                )
            })
            const data = await res.json()
            setLoading(false)
            if(data.success === false){
                setError(data.message)
            }
            navigate(`/listing/${data._id}`)
        } catch (error) {
            setError(error.message)
            setLoading(false)
        }
    }
  return (
    <main className="max-w-4xl p-3 mx-auto">
        <h1 className="text-3xl font-semibold text-center my-7">Actualiar inmueble</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col flex-1 gap-4">
                <input value={formData.name} onChange={handleChange} type="text" placeholder="Name" className="p-3 border rounded-lg" id="name" maxLength='62' minLength="10" required/>
                <textarea value={formData.description} onChange={handleChange} type="text" placeholder="Description" className="p-3 border rounded-lg" id="description" required/>
                <input value={formData.address} onChange={handleChange} type="text" placeholder="Address" className="p-3 border rounded-lg" id="address"  required/>
                <div className="flex flex-wrap gap-6">
                    <div className="flex gap-2">
                        <input checked={formData.type === 'sale'} onChange={handleChange} type="checkbox" id="sale" className="w-5"/>
                        <span>Venta</span>
                    </div>
                    <div className="flex gap-2">
                        <input checked={formData.type === 'rent'} onChange={handleChange} type="checkbox" id="rent" className="w-5"/>
                        <span>Alquiler</span>
                    </div>
                    <div className="flex gap-2">
                        <input checked={formData.parking} onChange={handleChange} type="checkbox" id="parking" className="w-5"/>
                        <span>Estacionamiento</span>
                    </div>
                    <div className="flex gap-2">
                        <input checked={formData.furnished} onChange={handleChange} type="checkbox" id="furnished" className="w-5"/>
                        <span>Amoblado</span>
                    </div>
                    <div className="flex gap-2">
                        <input checked={formData.offer} onChange={handleChange} type="checkbox" id="offer" className="w-5"/>
                        <span>Oferta</span>
                    </div>
                    <div className="flex gap-2">
                        <input checked={formData.vr} onChange={handleChange} type="checkbox" id="vr" className="w-5"/>
                        <span>VR</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <input value={formData.bedrooms} onChange={handleChange} type="number" id='bedrooms' min='1' max='10' required className="p-3 border-gray-300 rounded-lg"/>
                        <p>Camas</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input value={formData.bathrooms} onChange={handleChange} type="number" id='bathrooms' min='1' max='10' required className="p-3 border-gray-300 rounded-lg"/>
                        <p>Baños</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input value={formData.regularPrice} onChange={handleChange} type="number" id='regularPrice' min='50' max='1000000' required className="p-3 border-gray-300 rounded-lg"/>
                        <div className="flex flex-col items-center">
                            <p>Precio</p>
                            <span className="text-xs">($ / mes)</span>
                        </div>
                    </div>
                    {formData.offer &&(
                        <div className="flex items-center gap-2">
                            <input value={formData.discountPrice} onChange={handleChange} type="number" id='discountPrice' min='0' max='1000000' required className="p-3 border-gray-300 rounded-lg"/>
                            <div className="flex flex-col items-center">
                                <p>Precio con descuento</p>
                                <span className="text-xs">($ / mes)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col flex-1 gap-4">
                <p className="font-semibold">Imagenes:
                <span className="ml-2 font-normal text-gray-700">La primera imagen será la portada (max6)</span>
                </p>
                <div className="flex gap-4">
                    <input onChange={(e) => setFiles(e.target.files)}  className="w-full p-3 border border-gray-300 rounded" type='file' id="images" accept="image/*" multiple/>
                    <button disabled={uploading} type="button" onClick={handleImageSubmit} className="p-3 text-green-700 uppercase border border-green-700 rounded hover:shadow-lg disable:opacity-80">
                        {uploading? 'Uploading...' : "Upload"}
                    </button>
                </div>
                <p className="text-sm text-red-700">{imageUploadError && imageUploadError}</p>
                {
                    formData.imageUrls.length > 0 && formData.imageUrls.map((url, index)=>(
                        <div key={url} className="flex items-center justify-between p-3 border">
                            <img src={url} alt="listing image" className="object-contain w-20 h-20 rounded-lg"/>
                            <button type="button" onClick={() => handleRemoveImage(index)} className="p-3 text-red-700 uppercase rounded-lg hover:opacity-75">Borrar</button>
                        </div>
                    ))
                }
                <button disabled={loading || uploading} className="p-3 text-white uppercase rounded-lg bg-slate-700 hover:opacity-95 disabled:opacity-80">
                {loading? 'Updating...':'Update listing'}
            </button>
            {error && <p className="text-sm text-red-700">{error}</p>}
            </div>
        </form>
    </main>
  )
}

