import React from 'react'
import { Link } from "react-router-dom"

const Intro = () => {
  return (
    <div>
      <Link to="login">
        <button>Login</button>
      </Link>
    </div>
  )
}

export default Intro
