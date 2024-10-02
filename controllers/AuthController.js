const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// signup route
const signup = async (req, res) => {
    const {email,password,name}= req.body;

    try {
        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({ message: "Please Login" });
        }
        const securePassword = await bcrypt.hash(password,10);
        user = await User.create({
            name,
            email,
            password: securePassword,

        })
        await user.save();
        return res.status(201).json({ message: "signup successfully"})
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }

}

// Login routes
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({ message: "Invalid email or password" });
            }
            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY,{
                expiresIn: "1h",
            });
        
        res.cookie("token",token,{
            httpOnly: true,
            secure: true,
            sameSile:"none",
        }).status(200).json({success:true,message:"Login Successful"});
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

// Logout routes
const logout = async (req, res) => {
    try {
        res.clearCookie("token").json({success:true,message:"Logout Successful"});
        
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

// GET USER ROUTES
const getUser = async(req,res)=>{

    const reqId = req.id;
    try {
        let user = await User.findById(reqId).select("-password");
        if (!user) {
            return res.status(400).json({success:false,message:"User not found"});
        }
        return res.status(200).json({success:true,user,message:"user found"})
    } catch (error) {
     return res.status(500).json({ message: error.message });

        
    }

}

// RESET PASSWORD ROUTES 
const resetPassword = async (req, res) => {
    const {email} = req.body;
    // const {email} = req.body;

    try {
        // let user = await User.findOne({email});
        const generateOtp = Math.floor(Math.random()*10000); //generate a 4 digit otp
        
        let user = User.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message:"please login"})
        }
        // Looking to send emails in production? Check out our Email API/SMTP product!
        var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "d1427744c5abae",
          pass: "800bd87399f7da"
    }
  });
  const info = await transporter.sendMail({
    from: 'um8794907@gmail.com', // sender address
    to:email, // list of receivers
    subject: "New Otp has been Generated ✔", // Subject line
    // text: "Hello world?", // plain text body
    html: `<h3>Your Generated Otp is : <i>${generateOtp}</i></h3>`, // html body
  });
  if(info.messageId){
    await User.findOneAndUpdate(
        {email},
        {
        $set: {
            otp:generateOtp,
            
        },
    });
    return res.status(200).json({success:true,message:"Otp has been sent to your"});
  }

    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

//  VERIFY OTP ROUTES
const verifyOtp = async (req, res) => {
    const {otp,newPassword} = req.body;

    try {
        const securePassword = await bcrypt.hash(newPassword,10);

        let user = await User.findOneAndUpdate({otp},{
            $set:{
                password:securePassword,
                otp:0,
            }
        })
        if(!user){
            return res.status(400).json({message:"Invalid otp"})
        }
        return res.status(200).json({message:"Password has been updated successfully"})
    
        
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

module.exports={signup,login,logout,getUser,resetPassword,verifyOtp};