import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout/Layout'
import { useAccount, useSigner,useProvider } from 'wagmi'
import { Text, Flex, TableContainer, Table, TableCaption, Thead, Tbody, Tr, Td, Th, Tfoot, useToast, Button} from '@chakra-ui/react'
import {
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { contractAddress, abi } from "../public/constants/contract"
import Mint from '@/components/Mint'

export default function createRental() {
  const { isConnected } = useAccount();

  const [allRentals, setAllRentals] = useState([]);

useEffect(() => {
  fetchReservations();
  console.log(allRentals);
}, []);

  const provider = useProvider()

  async function fetchReservations() {
    const contract = new ethers.Contract(contractAddress, abi, provider)
    if (!contract) return;

    try {
      const rentalPeriodCreatedFilter = contract.filters.RentalPeriodCreated();
      if (!rentalPeriodCreatedFilter) return;

      const rentalPeriodCreatedEvents = await contract.queryFilter(
        rentalPeriodCreatedFilter
      );
      if (!rentalPeriodCreatedEvents) return;
      const fetchedRentals = rentalPeriodCreatedEvents.map(
        (rental) => ({
          id: rental?.args?.nftId.toNumber(),
          startTimestamp: new Date(rental?.args?._startTimestamp * 1000).toLocaleDateString(),
          endTimestamp: new Date(rental?.args?._endTimestamp * 1000).toLocaleDateString(),
          renter: rental?.args?._renter,
          isPaid: rental?.args?._isPaid ? "Yes" : "No",
          isRented: rental?.args?.isRented ? "Yes" : "No"
        }));

      console.log("fetchedRentals",fetchedRentals);
      setAllRentals(fetchedRentals);
      setTimeout(() => {
        console.log("allRentals", allRentals);
      }, "3000");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Head>
        <title>Cryptokey DApp : Generate key</title>
        <meta name="description" content="Generated by cryptokey app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>

     
        {isConnected ? (
          <Flex alignItems="center">        
            <TableContainer borderWidth="3px" borderRadius="10px">           
            <Table size="sm" variant='striped' color="#000000" backgroundColor='#446a9d'>
              <TableCaption>List of all rentals</TableCaption>
              <Thead>
                <Tr>
                  <Th>nft id</Th>
                  <Th>vacantion start</Th>
                  <Th>vacation end</Th>
                  <Th>renter</Th>
                  <Th>Is rented</Th>
                  <Th>Paid</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>                             
              {allRentals.map(({id, startTimestamp, endTimestamp, renter, isPaid, isRented }) => (
              <Tr>
                <Td>{id}</Td>
                <Td>{startTimestamp}</Td>
                <Td>{endTimestamp}</Td>
                <Td>{renter}</Td>
                <Td textAlign="center">{isPaid}</Td>
                <Td textAlign="center">{isRented }</Td>
                <Td><Mint nftId={id} renter={renter} startTimestamp={startTimestamp} endTimestamp={endTimestamp} isPaid={isPaid} isRented={isRented}/></Td>
              </Tr>
              ))}  
              </Tbody>
            </Table>
          </TableContainer>
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