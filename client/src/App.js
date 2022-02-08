import './App.css';
import {BrowserRouter as Router,Route,Routes} from "react-router-dom"
import WebFont  from 'webfontloader';
import React from "react";
import Header from "./component/layout/Header/Header.js"
import Home from "./component/Home/Home.js"
import Footer from "./component/layout/Footer/Footer.js"
import ProductDetails from "./component/Product/ProductDetails.js"

function App() {
  React.useEffect(()=>{
    WebFont.load({
      google:{
        families:["Roboto","Droid Sans","Chilanka"]
      }
    })
    },[])
  return (
    <Router>
    <Header/>
    <Routes>
    <Route exact path='/' element={<Home/>}/>
    <Route exact path="/product/:id" element={<ProductDetails/>}/>
    </Routes>
    <Footer/>
    </Router>
  );
}

export default App;
