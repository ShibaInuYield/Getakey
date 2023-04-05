import { Flex, Text, Image } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Header = () => {
    return (
        <Flex justifyContent="space-between" alignItems="center" height="10vh" width="100%" p="2rem">
            <Image boxSize='5rem' objectFit='cover' src='https://ipfs.io/ipfs/QmcEvwdEskwVCKHUJs4gxWaihEWyWpAF1nPkFNKMm66Rvs' alt='Logo'/>
            <Flex width="50%" justifyContent="space-between" alignItems="center">
                <Text><Link href="/">Home</Link></Text>
                <Text><Link href="/createRental">Create rental</Link></Text>
                <Text><Link href="/rentals">See rentals</Link></Text>
                <Text><Link href="/generatekey">Generate key</Link></Text>
            </Flex>
            <ConnectButton />
        </Flex>
    )   
}

export default Header;