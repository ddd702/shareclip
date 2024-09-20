import axios from "axios";
export default function req(url, method, data) {
  return axios({
    method: method,
    url: url,
    data: data,
  })
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(err.response.data.error);
  })
}