import React, { useState } from 'react';
import axios from 'axios';

// Remplacez les valeurs par votre propre clé API et clé secrète.
const API_KEY = 'YOUR_API_KEY';
const API_SECRET = 'YOUR_API_SECRET';

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);

  // Gérer le changement de fichier sélectionné par l'utilisateur
  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
  }

  // Envoyer une requête POST à l'API Pinata pour uploader le fichier
async function handleFileUpload(e) {
    console.log('starting')
    const formData = new FormData()
    formData.append("file", selectedFile)

    const API_KEY = API_KEY;
    const API_SECRET = API_SECRET;
    const url =  `https://api.pinata.cloud/pinning/pinFileToIPFS`

    const response = await axios.post(
        url,
        formData,
        {
            maxContentLength: "Infinity",
            headers: {
                "Content-Type": `multipart/form-data;boundary=${formData._boundary}`, 
                'pinata_api_key': API_KEY,
                'pinata_secret_api_key': API_SECRET
            }
        }
    )

    console.log(response)
    console.log(response.data.IpfsHash)
    
}

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload to Pinata</button>
    </div>
  );
}

export default Upload;