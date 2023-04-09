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
  if(props.isPaid === "No"){
    toast({
      title: 'Warning',
      description: 'Payment not done yet',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    })
    return;
  }

  const key = `ba7982d3d1680b7fff21`;
  const secret = `15bcc356dfa03f63dcbf6e59b7dbd88c1dbb703583733e15cafa7d107fbea86c`;
  const pinataSDK = require('@pinata/sdk');
  const pinata = new pinataSDK(key, secret);

    var data = JSON.stringify({
        
        "pinataOptions": {
            "cidVersion": `${props.nftId}`
          },
          "pinataMetadata": {
            "name": `Cryptokey #${props.nftId}`
          },
        "pinataContent": {
            "name": `Cryptokey #${props.nftId}`,
            "description": "Your web3 key",
            "image": "https://ipfs.io/ipfs/QmTR8CB9RBUmm9F2zM4dab9JUzoeEcVbtxnJ9DAMdzvhex",
            "attributes": [
            {
                "trait_type": "nftId",
                "value": `${props.nftId}`
            },
            {
                "trait_type": "Renter",
                "value": `${props.renter}`
            },
            {
                "trait_type": "Rental start time",
                "value": `${props.startTimestamp}`
            },
            {
                "trait_type": "Rental end time",
                "value": `${props.endTimestamp}`
            },
            ]
        }
    });

    var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
        "Content-Type": `application/json`,
        'pinata_api_key': process.env.NEXT_PUBLIC_API_KEY,
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_API_SECRET
    },
    
    data : data
    };

    const res = await axios(config);

    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      let transaction = await contract.transferNFT(props.renter, props.nftId,'https://api.pinata.cloud/pinning/pinJSONToIPFS');
      transaction.wait();
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
  }
  };

  return (
    <Button backgroundColor="#8e97a9" mt={2} colorScheme='facebook' onClick={handleClick}>Genereate key</Button>
  );
}