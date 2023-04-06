import axios from 'axios';
import { useToast, Button} from '@chakra-ui/react'
import { useAccount, useSigner,useProvider } from 'wagmi'
import { contractAddress, abi } from "../public/constants/contract"
import { ethers } from 'ethers'



export default function Mint(props) {

  const provider = useProvider();
  const { isConnected } = useAccount()
  const { data: signer } = useSigner()
  const toast = useToast();

  const contract = new ethers.Contract(contractAddress, abi, provider);
  if (!contract) return;
  const handleClick = async () => {

    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      let transaction = await contract.transferNFT(props.renter, props.nftId);
      await transaction.wait()
      toast({
        title: 'Congratulations',
        description: `NFT transfered to ${props.renter}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
  }
  catch(e) {
      toast({
          title: 'Error',
          description: 'NFT can\'t be minted',
          status: 'error',
          duration: 5000,
          isClosable: true,
      })
      console.log(e)
  }
  //   const response = await fetch('maison.png');
  //   const fileBuffer = await response.arrayBuffer();
  //   const file = new Blob([fileBuffer], { type: 'image/png' });

  //   // Create a new FormData object and append the file and any other form data
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('name', 'File name');
  //   formData.append('cidVersion', 0);

  //   const API_KEY = `ba7982d3d1680b7fff21`
  //   const API_SECRET = `15bcc356dfa03f63dcbf6e59b7dbd88c1dbb703583733e15cafa7d107fbea86c`

  //   try {
  //     // Send a POST request to upload the file
  //     const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //         'pinata_api_key': API_KEY,
  //         'pinata_secret_api_key': API_SECRET
  //       },
  //     });
  //     console.log(response);
  //   } catch (error) {
  //     console.error(error);
  //   }
  };

  return (
    <Button backgroundColor="#8e97a9" mt={2} colorScheme='facebook' onClick={handleClick}>Genereate key</Button>
  );
}