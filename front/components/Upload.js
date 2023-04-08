import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, useToast } from '@chakra-ui/react';

function Upload({setImage }) {

  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
  }

async function handleFileUpload(e) {
    if(selectedFile === null) return;
    console.log('starting')
    const formData = new FormData()
    formData.append("file", selectedFile)

    const API_KEY = '5d8b5814d1adb8041bc4'
    const API_SECRET = '11cb4372d366fb2e3661b33271f84d2d9f106dbd9e9f199eb39b1a91282c216c'
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
    setImage(response.data.IpfsHash);
    console.log(response.data.IpfsHash)
    
    toast({
      title: 'Congratulations',
      description: `File has been uploaded`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
}

  return (
    <div>
      <input type="file" onChange={handleFileChange}></input>
      <Button backgroundColor='#001922' color="#FFFFFF" onClick={handleFileUpload}>Upload to Pinata</Button>
    </div>
  );
}

export default Upload;