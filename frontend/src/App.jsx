import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <p className='text-5xl text-red-500 bg-blue-300' >Hello from App</p>
    </>
  )
}

export default App
