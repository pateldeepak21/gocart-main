'use client'

import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Star, XIcon } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useDispatch } from 'react-redux'
import { addRating } from '@/lib/features/rating/ratingSlice' // apne path ke according change karo

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const { getToken } = useAuth()
    const dispatch = useDispatch()

    const [rating, setRating] = useState(0)
    const [review, setReview] = useState('')

    const handleSubmit = async () => {
        if (rating === 0) {
            return toast.error('Please select a rating')
        }

        if (review.trim().length < 5) {
            return toast.error('Write a short review')
        }

        try {
            const token = await getToken()

            const { data } = await axios.post(
                '/api/rating',
                {
                    productId: ratingModal.productId,
                    orderId: ratingModal.orderId,
                    rating,
                    review,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            dispatch(addRating(data.data))
            toast.success(data.message)

            setRating(0)
            setReview('')
            setRatingModal(null)

            return data
        } catch (error) {
            toast.error(
                error?.response?.data?.error || error.message
            )
            throw error
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
                <button
                    onClick={() => setRatingModal(null)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <XIcon size={20} />
                </button>

                <h2 className="text-xl font-medium text-slate-600 mb-4">
                    Rate Product
                </h2>

                <div className="flex items-center justify-center mb-4">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            size={32}
                            className={`cursor-pointer ${
                                rating > i
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                            }`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>

                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Write your review..."
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                <button
                    onClick={() =>
                        toast.promise(handleSubmit(), {
                            loading: 'Submitting...',
                            success: 'Rating submitted successfully!',
                            error: 'Failed to submit rating',
                        })
                    }
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
                >
                    Submit Rating
                </button>
            </div>
        </div>
    )
}

export default RatingModal
