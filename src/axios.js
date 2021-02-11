import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001/clone-5a987/us-central1/api', //api URL
});

export default instance;
