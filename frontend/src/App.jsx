import { useEffect, useState } from "react";
import api from "./api/axiosInstance";


function App() {

  const [status, setStatus] = useState("Checking backend...");


  useEffect(() => {

    api.get("/api/health")
        .then((response) => {
          setStatus(response.data);
        })
        .catch((error) => {
          console.log(error);
          setStatus("Backend connection failed");
        });

  }, []);


  return (
      <div>
        <h1>AegisSight Frontend</h1>

        <h2>
          Backend Status:
        </h2>

        <p>
          {status}
        </p>

      </div>
  );
}


export default App;