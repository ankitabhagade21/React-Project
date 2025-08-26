import jwt from 'jsonwebtoken';
const isAuthenticated = (req, res, next) => {
    try{
        const token = req.cookies.token ;
        if (!token) {
            return res.status(401).json({
                 message: "Unauthorized",
                  success: false,
                 })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            })
        };
        req.id=decode.userId;
        next();

        
    }catch(error){
        console.log(error);
    }

 }
 export default isAuthenticated;