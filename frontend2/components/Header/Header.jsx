import { Flex, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Header = () => {
    return (
        <Flex justifyContent="space-between" alignItems="center" height="10vh" width="100%" p="2rem">
            <Text fontWeight="bold">Logo</Text>
            <Flex width="50%" justifyContent="space-between" alignItems="center">
                <Text><Link href="/">Home</Link></Text>
                <Text><Link href="/createRental">Create rental</Link></Text>
                <Text><Link href="/rentals">See rentals</Link></Text>
                <Text><Link href="/setNumber">Set the number</Link></Text>
            </Flex>
            <ConnectButton />
        </Flex>
    )   
}

export default Header;