import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login/Login"
import Register from "./pages/Signup/Register"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/Signup" element={<Register />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App