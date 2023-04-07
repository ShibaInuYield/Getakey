import React,{ useState } from 'react';
import { useContractEvent } from 'wagmi'
import { contractFactoryAddress, abiFactory } from "../public/constants/factory.js"

  const [rentals, setRentals] = useState([]);

  export function useRentalCollectionCreatdEvent() {
    useContractEvent({
      address: contractFactoryAddress,
      abi: abiFactory,
      eventName: 'RentalCollectionCreated',
      listener(_,label) {
        const newRental = label?.args?._rentalName;
        if (!rentals.includes(newRental)) {
          setRentals((prevRentals) => [...prevRentals, newRental]);
        }
      },
    })
    return  {rentals};
  }