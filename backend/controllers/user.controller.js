import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: "Account doesn't exist with this role",
        success: false,
      });
    }

    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.SECRETE_KEY, { expiresIn: '1d' });

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user: safeUser,
        success: true,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({
        message: "Logged out successfully",
        success: true,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", success: false });
  }
}

export const updateProfile = async (req, res) => {
    try{
        const{ fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        if (!fullname || !email || !phoneNumber||bio||skills) {
            return res.status(400).json({
                message: "Fullname, email, and phone number are required",
                success: false,
            });
        };
        //

        const skillsArray = skills.split(',');
        const userId=req.id;
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            })
        }
        // Update user profile
        user.fullname = fullname;
        user.email = email;
        user.phoneNumber = phoneNumber; 
        user.profile.bio = bio;
        user.profile.skills = skillsArray;
        //index comes here later 

        await user.save();
        user={
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile:user.profile
        }
        return res.status(200).json({
            message: "Profile updated successfully",
            user,
            success: true,
        });

    }catch (error) {
        console.log(error);
    }
}
