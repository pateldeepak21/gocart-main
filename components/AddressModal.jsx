'use client'

import { useState } from 'react'
import { XIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { useDispatch } from 'react-redux'

import { addAddress } from '@/lib/features/address/addressSlice'

const AddressModal = ({ setShowAddressModal }) => {
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const [address, setAddress] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  })

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = await getToken()

      const { data } = await axios.post(
        '/api/address',
        { address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      dispatch(addAddress(data.newAddress))
      toast.success(data.message)
      setShowAddressModal(false)
    } catch (error) {
      console.error(error)

      toast.error(
        error?.response?.data?.message || 'Failed to add address'
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center"
    >
      <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl">
          Add New <span className="font-semibold">Address</span>
        </h2>

        <input
          name="name"
          value={address.name}
          onChange={handleAddressChange}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Enter your name"
          required
        />

        <input
          name="email"
          value={address.email}
          onChange={handleAddressChange}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="email"
          placeholder="Email address"
          required
        />

        <input
          name="street"
          value={address.street}
          onChange={handleAddressChange}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Street"
          required
        />

        <div className="flex gap-4">
          <input
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="City"
            required
          />

          <input
            name="state"
            value={address.state}
            onChange={handleAddressChange}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="State"
            required
          />
        </div>

        <div className="flex gap-4">
          <input
            name="zip"
            value={address.zip}
            onChange={handleAddressChange}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="Zip code"
            required
          />

          <input
            name="country"
            value={address.country}
            onChange={handleAddressChange}
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
            type="text"
            placeholder="Country"
            required
          />
        </div>

        <input
          name="phone"
          value={address.phone}
          onChange={handleAddressChange}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Phone"
          required
        />

        <button
          type="submit"
          className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all"
        >
          SAVE ADDRESS
        </button>
      </div>

      <XIcon
        size={30}
        className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer"
        onClick={() => setShowAddressModal(false)}
      />
    </form>
  )
}

export default AddressModal