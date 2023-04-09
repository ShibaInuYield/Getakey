import Head from 'next/head'
import Layout from '@/components/Layout/Layout'
import { useState, useEffect } from 'react'
import { useAccount, useSigner,useProvider } from 'wagmi'
import { Flex, useToast, Button, Box, Image } from '@chakra-ui/react'
import {
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { ethers } from 'ethers'
import { contractAddress, abi } from "../public/constants/contract"

export default function Control() {
  const provider = useProvider();
  const { isConnected } = useAccount()
  const { data: signer } = useSigner()
  const [hasAccess,setHasaccess] = useState(false);
  const toast = useToast();

  useEffect(() =>{
    console.log(hasAccess);
  },[signer,hasAccess]);

  const contract = new ethers.Contract(contractAddress, abi, signer);
  if (!contract) return;
  const handleClick = async () => {

  try {

    const rentalPeriodCreatedFilter = contract.filters.RentalPeriodCreated();
    if (!rentalPeriodCreatedFilter) return;

    const rentalPeriodCreatedEvents = await contract.queryFilter(
      rentalPeriodCreatedFilter
    );
    if (!rentalPeriodCreatedEvents) return;
    const fetchedRentals = rentalPeriodCreatedEvents.filter(rental => rental.args._renter === signer._address)
    .map(rental => ({
      id: rental?.args?.nftId.toNumber(),
      startTimestamp: rental?.args?._startTimestamp.toNumber() ,
      endTimestamp: rental?.args?._endTimestamp.toNumber(),
      renter: rental?.args?._renter,
      isPaid: rental?.args?._isPaid ? "Yes" : "No",
      isRented: rental?.args?.isRented ? "Yes" : "No"
    }));

    if (!fetchedRentals){
      setHasaccess(false);
      toast({
          title: 'Error',
          description: 'Access denied',
          status: 'error',
          duration: 5000,
          isClosable: true,
      })
      console.log(e)
    }
    else{
      let nftId = 0;
      const date = Date.now();
      for(let i=0;i<fetchedRentals.length;i++)
      {
        console.log("debut",fetchedRentals[i].startTimestamp * 1000);
        console.log("fin",fetchedRentals[i].endTimestamp* 1000);
        console.log("courant",date);
        if((fetchedRentals[i].startTimestamp * 1000 < date) && (fetchedRentals[i].endTimestamp * 1000 < date)){
          nftId = fetchedRentals[i].id;
          console.log(nftId);
        }
      } 
      let transaction = await contract.controlNFT(signer._address,nftId);
      console.log(transaction);
      await transaction.wait()
      setHasaccess(true);
      toast({
        title: 'Congratulations',
        description: `Access authorized`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  catch(e) {
    setHasaccess(false);
      toast({
          title: 'Error',
          description: 'Access denied',
          status: 'error',
          duration: 5000,
          isClosable: true,
      })
      console.log(e)
  }
  };


  return (
    <>
      <Head>
        <title>Cryptokey DApp : Control key</title>
        <meta name="description" content="Generated by cryptokey app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>  
        {isConnected ? (
          <Flex alignItems="center">
              <Box
              display='flex'
              alignItems='center'
              justifyContent='center'
              width='100%'
              p="120px 320px"
              bgImage="url('https://bit.ly/2Z4KKcF')"
              bgPosition='center'
              bgRepeat='no-repeat'
            >
                {hasAccess ? (<Button display="contents"><Image src='https://ipfs.io/ipfs/QmYQo5UDBeS37aqFVWPT2ppZejfWo589RTVJ8d9UitpDbS' w="10rem" onClick={handleClick}/></Button>
                ): (<Button display="contents"><Image src='https://ipfs.io/ipfs/QmaLbuH46bUEQCJjrFJe9cJiDbWsW6XNt9bHBrW1E1fNjW' w="12rem" onClick={handleClick}/></Button>
                )}
            </Box>
          </Flex>
        ) : (
          <Alert borderRadius="10" fontFamily="fantasy" textAlign="center" status='info' width="50%" height="10%">
          <AlertIcon />
          Please, connect your Wallet!
        </Alert>
        )}
      </Layout>
    </>
  )
}