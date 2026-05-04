import React, { useState } from 'react'

const HTTPMethodsList = () => {

    const methods = ["GET", "POST", "PUT", "OPTIONS"]
    const [selectedMethod, setSelectedMethod] = useState('');
    return (
        <div className='flex flex-row rounded-xl items-center justify-between'>
            {
                methods.map((item) => {
                    return (
                        <button
                            onClick={() => {
                                setSelectedMethod(item)
                            }}
                            className={`border border-gray-400 p-2 w-full cursor-pointer ${item === selectedMethod ? 'text-blue-500 bg-gray-800' : 'text-white hover:bg-gray-800'}`} key={item}>
                            {item}
                        </button>
                    )

                })
            }

        </div>
    )
}

export default HTTPMethodsList