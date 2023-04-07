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
  };

  return (
    <Button backgroundColor="#8e97a9" mt={2} colorScheme='facebook' onClick={handleClick}>Genereate key</Button>
  );
}