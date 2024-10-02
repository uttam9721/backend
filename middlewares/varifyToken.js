const jwt = require('jsonwebtoken');

module.exports.verifyToken=async(req,res,next)=>{

    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.id = decoded.id;
        next();
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"});
        
    }

}