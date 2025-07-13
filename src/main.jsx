
import React from 'react'
import ReactDOM  from 'react-dom/client'
import {App} from './App.jsx'
import './App.css'


window.API_URL = import.meta.env.VITE_API_URL ||"http://localhost:3000/api"

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
 
    <App />
)
