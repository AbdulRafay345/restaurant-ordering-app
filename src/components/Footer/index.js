import React from 'react'

export default function Footer() {

    let year = new Date().getFullYear()

    return (
    <div className='pt-2' style={{background:"#a97e4d"}}>
        <p className='text-center text-white'>&copy; {year}. All Rights reserved.</p>
    </div>
    )
}
