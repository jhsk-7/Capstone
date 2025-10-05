// /src/app/myBikes/service.js

import axios from "axios";

export async function fetchBikes() {
    const res = await axios.get("/api/users/bikes/myBikes", { withCredentials: true });
    return res
};