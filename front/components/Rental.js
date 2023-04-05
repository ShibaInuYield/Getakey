import React from 'react';
import { Center, Heading, Text } from '@chakra-ui/react'

const Rental = (props) => {
  return (
    <div className="rental">
      <img src={props.image} alt={props.title} className="rentalImg" />
      <Center><Heading as='h2' size='sm'>{props.title}</Heading></Center>
      <Text>{props.description}</Text>
    </div>
  );
};

export default Rental;