'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useUser, useAuth } from '@clerk/nextjs'

import Banner from '@/components/Banner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import { fetchUserRatings } from '@/lib/features/rating/ratingSlice'
import { fetchProducts } from '@/lib/features/product/productSlice'
import { fetchCart, uploadCart } from '@/lib/features/cart/cartSlice'
import { fetchAddress } from '@/lib/features/address/addressSlice'

export default function PublicLayout({ children }) {
  const dispatch = useDispatch()

  const { user } = useUser()
  const { getToken } = useAuth()

  const { cartItems } = useSelector((state) => state.cart)

  useEffect(() => {
    dispatch(fetchProducts({}))
  }, [dispatch])

  useEffect(() => {
    if (user) {
      dispatch(fetchCart({ getToken }))
      dispatch(fetchAddress({ getToken }))
      dispatch(fetchUserRatings({ getToken }))
    }
  }, [user, dispatch, getToken])

  useEffect(() => {
    if (user) {
      dispatch(uploadCart({ getToken }))
    }
  }, [cartItems, user, dispatch, getToken])

  return (
    <>
      <Banner />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}