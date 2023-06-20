
let jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const checkToken = (token,secretKey) => {
    // console.log("token ====> ",token)
    try{
        if (!token) {
            console.log('Token not provided')
            return null
        }
    
        const tokenWithoutBearer = token.replace('Bearer ', '')
        const decoded = jwt.verify(tokenWithoutBearer, secretKey)
        
        // Check token expiration
        const currentTimestamp = Math.floor(Date.now() / 1000)
        if (decoded.exp < currentTimestamp) {
            console.log('Token has expired')
            return null
        }
    
        return decoded
        } catch (err) {
            console.log(err)
            console.log('Token verification error:', err.message)
            return null
        }
  }

  // check password 
const checkPassword = async(password,Store) => {
    const isPasswordMatch = await bcrypt.compare(password, Store)
    // console.log(isPasswordMatch)
    return isPasswordMatch
}

  module.exports = { checkToken,checkPassword };