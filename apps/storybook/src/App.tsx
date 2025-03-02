import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AddRowButton from '@workspace/ui/components/DataGrid/components/ActionButtons/AddRowButton'
// import './App.css'
// import '../.storybook/styles.css'
// import "../../../packages/ui/index.css";
// import "../../../packages/ui/src/styles/globals.css"

// import "../../../packages/ui/tailwind.config.js"
//     require("tailwindcss")("../../packages/ui/tailwind.config.js"),

import '@workspace/ui/globals.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <div className="rounded-full h-16 w-16 flex bg-teal-400 m-2">12</div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
