import { Flex, Text, Image } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Header = () => {
    return (
        <Flex justifyContent="space-between" alignItems="center" height="10vh" color="#FFFFFF" fontFamily="fantasy" backgroundColor="#001922" width="100%" p="2rem">
            <Image boxSize='5rem' objectFit='cover' src='https://ipfs.io/ipfs/QmTR8CB9RBUmm9F2zM4dab9JUzoeEcVbtxnJ9DAMdzvhex' alt='Logo'/>
            <Flex width="50%" color="#001922" justifyContent="space-between" alignItems="center">
                <Text backgroundColor="#FFFFFF" padding="2" borderRadius="10"><Link href="/">Home</Link></Text>
                <Text backgroundColor="#FFFFFF" padding="2" borderRadius="10"><Link href="/CreateRental">Create rental</Link></Text>
                <Text backgroundColor="#FFFFFF" padding="2" borderRadius="10"><Link href="/Rentals">See rentals</Link></Text>
                <Text backgroundColor="#FFFFFF" padding="2" borderRadius="10"><Link href="/generatekey">Generate key</Link></Text>
                <Text backgroundColor="#FFFFFF" padding="2" borderRadius="10"><Link href="/control">Control access</Link></Text>
            </Flex>
            <ConnectButton />
        </Flex>
    )   
}

export default Header;