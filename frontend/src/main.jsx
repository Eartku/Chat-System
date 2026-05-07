import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; //Bọc app bằng Provider để mọi component đều truy cập được Redux
import { BrowserRouter } from 'react-router-dom';//Bọc app bằng BrowserRouter để dùng route URL
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';//Render component gốc là App
import store from './store/index.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
