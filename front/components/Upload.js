import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, useToast } from '@chakra-ui/react';

function Upload({setImage }) {

  const API_KEY = 'YOUR_API_KEY';
  const API_SECRET = 'YOUR_API_SECRET';
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

    const API_KEY = `ba7982d3d1680b7fff21`
    const API_SECRET = `15bcc356dfa03f63dcbf6e59b7dbd88c1dbb703583733e15cafa7d107fbea86c`
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