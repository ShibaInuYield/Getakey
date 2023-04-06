import { Flex, Text } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Flex justifyContent="center" alignItems="center" color="#FFFFFF" width="100%" backgroundColor="#001922" height="10vh" p="2rem">
            <Text fontFamily="fantasy">&copy; Cryptokey {new Date().getFullYear()}</Text>
        </Flex>
    )   
}

export default Footer;